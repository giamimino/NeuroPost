import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { GENERIC_ERROR } from "@/constants/error-handling";
import { Tag } from "@/types/neon";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, col, dir, cursor, id, joinLikes } = Object.fromEntries(
      searchParams.entries(),
    );
    if (id) {
      const posts = await sql.query(
        "SELECT p.*, u.name, u.username FROM posts p JOIN users u ON p.author_id=u.id WHERE p.id = $1",
        [Number(id)],
      );
      console.log(posts);

      return NextResponse.json({ ok: true, posts }, { status: 200 });
    }
    const columns = ["created_at", "title"];
    const directions = ["ASC", "DESC"];

    if (!columns.includes(col) || !directions.includes(dir)) {
      throw new Error("Nice try, hacker.");
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;
    if (!accessToken) return NextResponse.json({ ok: false }, { status: 401 });
    const payload = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as any;

    const date =
      cursor && !isNaN(new Date(cursor).getTime())
        ? new Date(cursor).toISOString()
        : new Date(Date.now()).toISOString();

    const rawSql = `
      SELECT p.*, l.id as like_id FROM posts p 
      FULL JOIN likes l ON p.id=l.post_id AND l.user_id = $3 
      WHERE p.created_at < $2 ORDER BY ${col} ${dir} LIMIT $1
    `;
    const posts = await sql.query(rawSql, [
      Number(limit) || 20,
      date,
      payload.userId,
    ]);

    console.log(posts);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: GENERIC_ERROR },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      tags,
    }: {
      title: string;
      description: string | undefined;
      tags: { id?: number; tag: string }[];
    } = await req.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

    if (!accessToken) return NextResponse.json({ ok: false }, { status: 401 });

    const payload = jwt.verify(accessToken, process.env.ACCESS_SECRET!) as
      | JWTUserPaylaod
      | undefined;

    if (!payload) return NextResponse.json({ ok: false }, { status: 401 });

    const rawSql = `INSERT INTO posts (title, description, author_id) VALUES ($1, $2, $3) RETURNING *`;
    const post = await sql.query(rawSql, [
      title,
      description || null,
      payload.userId,
    ]);

    if (tags.length !== 0 || !post[0].id) {
      const filteredTags = tags
        .map((tag) => typeof tag.id === "undefined" && tag.tag)
        .filter(Boolean);
      let existTags: any[] = [];
      if (filteredTags.length !== 0) {
        const rawTags = `(${filteredTags.map((tag) => `'${tag}'`).join(",")})`;
        console.log("filteredTags:", filteredTags);

        existTags = (await sql.query(
          `SELECT id, tag FROM tags WHERE tag IN ${rawTags}`,
        )) as { id: number; tag: string }[];
        console.log("existTags:", existTags);
      }

      const normalizedTags = filteredTags.filter((tag) =>
        existTags.some((t) => t.tag !== tag),
      );
      console.log("normalizedTags:", normalizedTags);

      const raw = [];
      for (const tag of normalizedTags) {
        raw.push(`('${tag}')`);
      }
      const insertedTags = (
        raw.length !== 0
          ? await sql.query(
              `INSERT INTO tags (tag) VALUES ${raw.join(",")} RETURNING id, tag`,
            )
          : []
      ) as { id: number; tag: string }[];
      console.log("insertedTags:", insertedTags);
      const combinedTags = [...(existTags ?? []), ...(insertedTags ?? [])];
      console.log("combinedTags:", combinedTags);

      const raw_combined_tags_insert = [];
      for (const tag of combinedTags) {
        raw_combined_tags_insert.push(`(${post[0].id}, ${tag.id})`);
      }
      console.log("raw_combined_tags_insert:", raw_combined_tags_insert);
      await sql.query(
        `INERT INTO post_tag (post_id, tag_id) VALUES ${raw_combined_tags_insert.join(",")}`,
      );
    }

    return NextResponse.json({ ok: true, post: post[0] }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
