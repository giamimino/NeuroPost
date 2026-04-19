import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ERRORS } from "@/constants/error-handling";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());
    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
      );
    const payload = auth.user;

    const posts = await sql.query(
      `SELECT 
        p.*,
        json_build_object(
          'id', m.id,
          'fileurl', m.fileurl,
          'type', m.type
        ) as media
      FROM likes l
      JOIN posts p ON p.id = l.post_id
      LEFT JOIN media m ON m.post_id = p.id
      WHERE l.user_id = $1 
      LIMIT $2`,
      [payload.userId, Number(limit) || 20],
    );

    const keys = posts.map((p) => p.media.fileurl || "");

    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    const signedPosts = posts.map((p, i) => ({
      ...p,
      media: {
        ...p.media,
        mediaUrl: p.media.fileurl ? signedUrls[i] : undefined,
      },
    }));

    return NextResponse.json({ ok: true, likes: signedPosts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
