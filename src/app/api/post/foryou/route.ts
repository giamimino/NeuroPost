import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod, TagType } from "@/types/global";
import { Post } from "@/types/neon";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, cursor, dir, col, withMedia } = Object.fromEntries(
      searchParams.entries(),
    );
    const directions = ["ASC", "DESC"];
    const columns = ["created_at", "title"];

    if (!columns.includes(col) || !directions.includes(dir))
      return NextResponse.json(
        { ok: false, message: "Nice try, hacker." },
        { status: 500 },
      );

    const date =
      cursor && !isNaN(new Date(cursor).getTime())
        ? new Date(cursor).toISOString()
        : new Date(Date.now()).toISOString();

    const cookieStore = await cookies();
    const access_token = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)
      ?.value as string;
    let payload;
    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const rawSql = `
      SELECT p.*, json_agg(json_build_object('id', t.id, 'tag', t.tag)) as tags, l.id as like_id, 
      json_build_object('id', m.id, 'fileurl', m.fileurl, 'type', m.type) as media FROM posts p
      LEFT JOIN post_tag pt ON p.id = pt.post_id
      LEFT JOIN tags t ON t.id = pt.tag_id
      LEFT JOIN likes l ON l.user_id = $3 AND l.post_id = p.id
      LEFT JOIN media m ON m.post_id = p.id
      WHERE p.created_at < $2
      GROUP BY p.id, l.id, m.id
      ORDER BY p.${col} ${dir} LIMIT $1
    `;

    const posts = (await sql.query(rawSql, [
      Number(limit) || 20,
      date,
      payload.userId,
    ])) as (Post & {
      tags: TagType[];
      like_id: string | null;
      media: { fileurl: string | null; type: string | null; id: string | null };
    })[];
    let signedPosts;
    if (Boolean(withMedia) === true) {
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

      signedPosts = posts.map((p, i) => ({
        ...p,
        mediaUrl: p.media.fileurl ? signedUrls[i] : null,
      }));
    }

    return NextResponse.json(
      {
        ok: true,
        posts:
          withMedia && signedPosts && signedPosts.length > 0
            ? signedPosts
            : posts,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
