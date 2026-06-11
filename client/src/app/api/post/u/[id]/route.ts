import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { Post } from "@/types/neon";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const { limit, cursor } = Object.fromEntries(searchParams.entries());

    const date = (
      cursor && !isNaN(new Date(cursor).getTime())
        ? new Date(cursor)
        : new Date()
    ).toISOString();

    const posts = (await sql.query(
      `
      SELECT 
        p.id, 
        p.title, 
        p.description, 
        p.created_at,
        CASE
          WHEN m.fileurl IS NULL THEN NULL
          ELSE 
            json_build_object(
              'fileurl', m.fileurl, 
              'type', m.type, 
              'thumb_url', m.thumb_url
            )
        END AS media 
      FROM posts p 
      LEFT JOIN media m ON m.post_id = p.id 
      WHERE author_id = $1 AND p.created_at < $3
      ORDER BY p.created_at DESC
      LIMIT $2`,
      [id, Number(limit) || 20, date],
    )) as Post[];

    const keys = posts.map(({ media }) => {
      if (media?.type === "video" && media?.thumb_url) {
        return media.thumb_url;
      } else if (media?.type === "image" && media.fileurl) {
        return media.fileurl;
      }
      return "";
    });

    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, {
          expiresIn: 5 * 60,
        });
      }),
    );

    const signedPosts = posts.map((post, i) => {
      const media = post.media;
      if (media?.type === "video" && media?.thumb_url) {
        return { ...post, media: { ...media, thumb_url: signedUrls[i] } };
      } else if (media?.type === "image" && media.fileurl) {
        return { ...post, media: { ...media, thumb_url: signedUrls[i] } };
      }
      return { ...post, media: null };
    });

    const nextCursor = signedPosts.at(-1)?.created_at ?? null;

    return NextResponse.json(
      { ok: true, posts: signedPosts, nextCursor },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
