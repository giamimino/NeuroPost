import { auth } from "@/lib/auth";
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
    // const { searchParams } = new URL(req.url)
    // const { i } = Object.fromEntries(searchParams.entries())

    if (!id || !Number(id))
      return NextResponse.json({ ok: false }, { status: 400 });

    let payload;
    try {
      payload = await auth({ userId: true });
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const posts = await sql.query(
      "SELECT p.*, json_build_object('name', u.name, 'username', u.username) as user, l.id as likeId FROM posts p JOIN users u ON p.author_id=u.id LEFT JOIN likes l ON l.post_id = $1 WHERE p.id = $1",
      [Number(id)],
    );
    const post = posts[0];

    let role: "creator" | "guest";
    if (post.author_id === payload?.userId) {
      role = "creator";
    } else {
      role = "guest";
    }

    const medias = await sql.query(`SELECT * FROM media where post_id = $1`, [
      post.id,
    ]);
    const media = medias[0];
    if (!media)
      return NextResponse.json(
        { ok: true, post: { ...post, role } },
        { status: 200 },
      );
    const command = new GetObjectCommand({
      Bucket: "neuropost",
      Key: media.fileurl,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json(
      { ok: true, post: { ...post, signedUrl, media, role } },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
