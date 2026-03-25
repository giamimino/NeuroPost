import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { TagType } from "@/types/global";
import { Post, UserJoin } from "@/types/neon";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";
import { getAuthUser } from "@/lib/auth";
import { ERRORS } from "@/constants/error-handling";

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

    const rawSql = `
      SELECT 
        p.*,

        json_agg(
          DISTINCT jsonb_build_object(
            'id', t.id,
            'tag', t.tag
          )
        ) FILTER (WHERE t.id IS NOT NULL) AS tags,

        l.id AS like_id,

        json_build_object(
          'id', m.id,
          'fileurl', m.fileurl,
          'type', m.type
        ) AS media,

        json_build_object(
          'id', u.id,
          'name', u.name,
          'username', u.username,
          'profile_url', u.profile_url
        ) AS user,

        COUNT(DISTINCT tl.id) AS likes

      FROM posts p

      LEFT JOIN post_tag pt 
        ON p.id = pt.post_id

      LEFT JOIN tags t 
        ON t.id = pt.tag_id

      LEFT JOIN likes l 
        ON l.user_id = $3 AND l.post_id = p.id

      LEFT JOIN media m 
        ON m.post_id = p.id

      LEFT JOIN users u 
        ON u.id = p.author_id

      LEFT JOIN likes tl 
        ON tl.post_id = p.id

      WHERE p.created_at < $2

      GROUP BY 
        p.id,
        l.id,
        m.id,
        u.id

      ORDER BY p.${col} ${dir}

      LIMIT $1
    `;

    let posts = (await sql.query(rawSql, [
      Number(limit) || 20,
      date,
      payload.userId,
    ])) as (Post & {
      tags: TagType[];
      like_id: string | null;
      user: UserJoin;
      media: { fileurl: string | null; type: string | null; id: string | null };
    })[];

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

      posts = posts.map((p, i) => ({
        ...p,
        mediaUrl: p.media.fileurl ? signedUrls[i] : null,
      }));
    }

    const keys = posts.map((p) => p.user.profile_url || "");

    const signedProfiles = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    posts = posts.map((p, i) => ({
      ...p,
      user: {
        ...p.user,
        profile_url: p.user.profile_url ? signedProfiles[i] : "/user.jpg",
      },
    }));

    return NextResponse.json(
      {
        ok: true,
        posts: posts,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
