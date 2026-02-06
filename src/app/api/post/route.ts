import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { GENERIC_ERROR } from "@/constants/error-handling";

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
    }: { title: string; description: string | undefined } = await req.json();

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

    return NextResponse.json({ ok: true, post: post[0] }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
