import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { CommentType, CommentUserType } from "@/types/neon";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, post_id }: { content: string; post_id: number } = body;

    if (!content || !content.trim() || !post_id || !Number(post_id))
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_EMPTY_ERROR },
        { status: 400 },
      );

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
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }

    const comment = await sql.query(
      `WITH new_comment AS (INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *) 
      SELECT new_comment.*, json_build_object('id', u.id, 'name', u.name, 'profile_url', u.profile_url) as user FROM new_comment 
      JOIN users u ON u.id = new_comment.user_id`,
      [content, post_id, payload.userId],
    );

    return NextResponse.json(
      { ok: true, comment: comment[0] },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { postId, limit } = Object.fromEntries(searchParams.entries());

    if (!postId || !Number(postId))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

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

    const comments = (await sql.query(
      `SELECT c.*, json_build_object('id', u.id, 'name', u.name, 'profile_url', u.profile_url) as user FROM comments c 
      JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 ORDER BY c.created_at DESC LIMIT $2`,
      [postId, Number(limit) || 20],
    )) as (CommentType & { user: CommentUserType })[];
    const commentItems = comments.map((comment) => ({
      ...comment,
      role: comment.user_id === payload.userId ? "creator" : "guest",
    }));

    if (!comments)
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_NOT_FOUND },
        { status: 404 },
      );

    return NextResponse.json(
      { ok: true, comments: commentItems },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}