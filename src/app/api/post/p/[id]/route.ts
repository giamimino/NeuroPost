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
      `SELECT p.*, COUNT( l.id) AS likes, json_build_object('name', u.name, 'username', u.username, 'profile_url', u.profile_url) AS user, l.id AS likeId 
      FROM posts p JOIN users u ON p.author_id=u.id 
      LEFT JOIN likes l ON l.post_id = $1 
      WHERE p.id = $1 GROUP BY p.id, u.name, u.username, u.profile_url, l.id`,
      [Number(id)],
    );
    const post = posts[0];
    console.log(post);

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
    const keys = [post.user.profile_url || "", media?.fileurl || ""];

    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });
        return getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      }),
    );

    return NextResponse.json(
      {
        ok: true,
        post: {
          ...post,
          signedUrl: signedUrls[1] || null,
          media,
          role,
          user: {
            ...post.user,
            profile_url: post.user.profile_url ? signedUrls[0] : "/user.jpg",
          },
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
