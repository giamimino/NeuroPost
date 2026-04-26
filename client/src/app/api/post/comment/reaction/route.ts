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
      `INSERT INTO comment_reactions (user_id, comment_id, type) VALUES ($1, $2, $3) RETURNING id, type`,
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
