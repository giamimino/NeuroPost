import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { CommentReplyAPISchema } from "@/schemas/comment/reply.schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      post_id,
      comment_id,
    }: { content: string; post_id: number; comment_id: string } = body;

    try {
      CommentReplyAPISchema.parse({ content, post_id, comment_id });
    } catch (err) {
      console.log(err);
    }

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );

    if (auth.status === "inactive")
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.ACCOUNT_INACTIVE,
        },
        { status: 423 },
      );

    const payload = auth.user;

    const comments = await sql.query(
      `INSERT INTO comments (content, post_id, user_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [content, post_id, payload.userId, comment_id],
    );
    const comment = comments[0];

    if (!comment)
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_CREATION_FAILED },
        { status: 500 },
      );

    return NextResponse.json({ ok: true, comment }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
