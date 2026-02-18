import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, cursor, dir, col } = Object.fromEntries(
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
      SELECT p.*, json_agg(json_build_object('id', t.id, 'tag', t.tag)) as tags, l.id as like_id FROM posts p
      LEFT JOIN post_tag pt ON p.id = pt.post_id
      LEFT JOIN tags t ON t.id = pt.tag_id
      LEFT JOIN likes l ON l.user_id = $3 AND l.post_id = p.id
      WHERE p.created_at < $2
      GROUP BY p.id, l.id
      ORDER BY p.${col} ${dir} LIMIT $1
    `;

    const posts = await sql.query(rawSql, [Number(limit) || 20, date, payload.userId]);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
