import { ERRORS } from "@/constants/error-handling";
import { NotificationEnumType } from "@/types/enums";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { type, limit } = Object.fromEntries(searchParams.entries());
    const ALLOWED_NOTIFICATION_TYPES: NotificationEnumType[] = [
      "FRIEND_REQUEST",
      "NEW_FOLLOWER",
      "NEW_MESSAGE",
      "NEW_POST",
      "SYSTEM",
    ];

    if (
      !ALLOWED_NOTIFICATION_TYPES.includes(
        String(type).toUpperCase() as NotificationEnumType,
      )
    )
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 403 },
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

    const notifications = await sql.query(
      `SELECT * FROM notifications WHERE user_id = $1 AND type = $2 LIMIT $3`,
      [payload.userId, type.toUpperCase(), Number(limit) || 20],
    );

    return NextResponse.json({ ok: true, notifications }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
