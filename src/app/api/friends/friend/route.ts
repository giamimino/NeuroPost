import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { friendId } = body;
    if (!friendId)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const cookieStore = await cookies();
    const access_token = cookieStore.get(
      process.env.ACCESS_COOKIE_NAME!,
    )?.value;

    if (!access_token)
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_MISSING },
        { status: 401 },
      );

    let payload;
    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }

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
