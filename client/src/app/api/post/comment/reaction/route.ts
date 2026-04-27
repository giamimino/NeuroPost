import { ReactionsConst } from "@/constants/comments.constants";
import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isUuid } from "@/schemas/common/uuid.schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId, type } = body;

    const checkCommentId = isUuid.safeParse(commentId);

    if (!checkCommentId.success || !ReactionsConst.includes(type))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
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

    const reactions = await sql.query(
      `INSERT INTO comment_reactions (user_id, comment_id, type) VALUES ($1, $2, $3) RETURNING id as reactionId, type`,
      [payload.userId, commentId, type],
    );
    const reaction = reactions[0];

    if (!reaction)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    return NextResponse.json({ ok: true, reaction }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { reactionId } = body;

    const checkReactionId = isUuid.safeParse(reactionId);
    if (!checkReactionId.success)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
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

    const rections = await sql.query(
      `SELECT user_id FROM comment_reactions WHERE id = $1`,
      [reactionId],
    );

    const reaction = rections[0];
    if (reaction.user_id !== payload.userId)
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.NOT_ALLOWED,
        },
        { status: 400 },
      );

    await sql.query(`DELETE FROM comment_reactions WHERE id = $1`, [
      reactionId,
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { reactionId, type } = body;

    const checkReactionId = isUuid.safeParse(reactionId);

    if (!checkReactionId.success || !ReactionsConst.includes(type))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const reactions = await sql.query(
      `UPDATE comment_reactions SET type = $2 WHERE id = $1 RETURNING id, type`,
      [reactionId, type],
    );
    const reaction = reactions[0];

    if (!reaction)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    return NextResponse.json({ ok: true, reaction }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
