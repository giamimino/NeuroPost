import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { GENERIC_ERROR } from "@/constants/error-handling";
import { Tag } from "@/types/neon";

interface TagInput {
  id?: number;
  tag: string;
}
interface DBTag {
  id: number;
  tag: string;
}

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
      tags: TagInput[];
    } = await req.json();

    if (!title || !Array.isArray(tags))
      return NextResponse.json(
        { ok: false, message: "Invalid Input" },
        { status: 400 },
      );

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

    if (!accessToken) return NextResponse.json({ ok: false }, { status: 401 });

    let payload: JWTUserPaylaod;

    try {
      payload = jwt.verify(
        accessToken,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
    await sql.query("BEGIN");

    const postResult = await sql.query(
      `INSERT INTO posts (title, description, author_id) VALUES ($1, $2, $3) RETURNING id, title, description, author_id`,
      [title, description || null, payload.userId],
    );

    const post = postResult[0];

    if (!post.id) {
      await sql.query(`ROLLBACK`);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    if (tags.length === 0) {
      await sql.query("COMMIT");
      return NextResponse.json({ ok: false }, { status: 200 });
    }
    const newTags = tags
      .filter((tag) => typeof tag.id === "undefined")
      .map((tag) => tag.id) as number[];

    let existTags: DBTag[] = [];
    if (newTags.length > 0) {
      const placeholders = newTags.map((_, i) => `$${i + 1}`).join(",");

      existTags = (await sql.query(
        `SELECT id, tag FROM tags WHERE tag IN (${placeholders})`,
        newTags,
      )) as { id: number; tag: string }[];
    }

    const existTagNames = new Set(existTags.map((t) => Number(t.tag)));

    const tagsToInsert = newTags.filter((tag) => !existTagNames.has(tag));
    let insertedTags: DBTag[] = [];

    if (tagsToInsert.length > 0) {
      const values = tagsToInsert.map((_, i) => `($${i + 1})`).join(",");

      insertedTags = (await sql.query(
        `INSERT INTO tags (tag) VALUES ${values} RETURNING id, tag`,
        tagsToInsert,
      )) as DBTag[];
    }

    const allTags: DBTag[] = [...(existTags ?? []), ...(insertedTags ?? [])];

    if (allTags.length > 0) {
      const relationValues = allTags.map((_, i) => `($1, $${i + 1})`).join(",");

      const params = [post.id, ...allTags];

      await sql.query(
        `INSERT INTO post_tag (post_id, tag_id) VALUES ${relationValues}`,
        params,
      );
    }

    await sql.query("COMMIT")

    return NextResponse.json({ ok: true, post: post[0] }, { status: 200 });
  } catch (err) {
    console.error(err);
    await sql.query("ROLLBACK")
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
