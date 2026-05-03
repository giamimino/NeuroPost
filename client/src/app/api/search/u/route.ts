import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();

    if (!query.trim()) {
      return NextResponse.json({ ok: true, users: [] }, { status: 200 });
    }

    const search = `%${String(query).toLowerCase()}%`;

    const users = await sql`
      SELECT name, id, bio, username, profile_url
      FROM users 
      WHERE (name LIKE ${search}
        OR username LIKE ${search})
        AND "isPrivate" = FALSE
      LIMIT 20
    `;

    const keys = users.map((u) => u.profile_url ?? "");

    const signed_urls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Key: key,
          Bucket: "neuropost",
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    const signed_users = users.map((u, i) => ({
      ...u,
      profile_url: u.profile_url ? signed_urls[i] : "/user.jpg",
    }));

    return NextResponse.json(
      { ok: true, users: signed_users },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
