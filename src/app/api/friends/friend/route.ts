import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { friendId } = body;
    if (!friendId)
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

    const friends = await sql.query(
      `SELECT id, friend_id, user_id FROM friends WHERE id = $1`,
      [friendId],
    );
    const friend = friends[0];

    if (!friend)
      return NextResponse.json(
        { ok: false, error: ERRORS.FRIEND_NOT_FOUND_ERROR },
        { status: 404 },
      );

    if (
      payload.userId !== friend.user_id &&
      payload.userId !== friend.friend_id
    )
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 403 },
      );

    await sql.query(`DELETE FROM friends WHERE id = $1`, [friendId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
