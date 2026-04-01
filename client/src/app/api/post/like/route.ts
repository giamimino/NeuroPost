import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { SETTINGS_KEYS } from "@/constants/settings-keys";

export async function POST(req: Request) {
  try {
    const { postId }: { postId: number } = await req.json();

    if (!postId)
      return NextResponse.json(
        { ok: false, error: ERRORS.INVALID_REQUEST_ERROR },
        { status: 400 },
      );
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

    const posts = await sql.query(`SELECT author_id FROM posts WHERE id = $1`, [
      postId,
    ]);
    const post = posts[0];

    if (!post)
      return NextResponse.json(
        { ok: false, error: ERRORS.POST_NOT_FOUND },
        { status: 404 },
      );

    if (post.author_id === payload.userId)
      return NextResponse.json({ ok: false, error: ERRORS.LIKE_FAILED });

    const authors_settings = await sql.query(
      `SELECT value WHERE user_id = $1 AND key = $2`,
      [post.author_id, SETTINGS_KEYS.NOTIFICATIONS_SETTINGS_KEYS.LIKES],
    );
    const author_setting = authors_settings[0];

    if (author_setting.value === false) {
      await sql.query(
        `INSERT INTO notifications (user_id, type, title, body)`,
        [post.author_id, "NEW_LIKE"],
      );
    }

    const rawSQL = `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING id as like_id`;
    const likes = await sql.query(rawSQL, [payload.userId, postId]);

    return NextResponse.json(
      { ok: true, like: likes[0].like_id },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id }: { id: string } = await req.json();

    const rawSQL = `DELETE FROM likes WHERE id = $1`;
    await sql.query(rawSQL, [id]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
