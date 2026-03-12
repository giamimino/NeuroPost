import { ERRORS } from "@/constants/error-handling";
import { FriendStatusEnumType } from "@/types/enums";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { status } = Object.fromEntries(searchParams.entries());
    const body = await req.json();
    const { friendId } = body;
    const statuses = ["blocked", "muted", "none"];

    if (!friendId || !statuses.includes(status))
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

    await sql.query(`UPDATE friends SET status = $1 WHERE id = $2`, [
      status,
      friendId,
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
