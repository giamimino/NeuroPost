import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || !Number(id))
      return NextResponse.json({ ok: false }, { status: 400 });

    const posts = await sql.query(
      `SELECT p.title, p.description, m.fileUrl as media_url FROM posts p 
      LEFT JOIN media m ON m.post_id = $1 
      WHERE p.id = $1 LIMIT 1`,
      [Number(id)],
    );
    const post = posts[0];
    const key = post.media_url;

    const command = new GetObjectCommand({
      Bucket: "neuropost",
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

    return NextResponse.json(
      {
        ok: true,
        post: { ...post, media_url: signedUrl },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
