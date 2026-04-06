import { ERRORS } from "@/constants/error-handling";
import { NotificationEnumType } from "@/types/enums";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { type, limit } = Object.fromEntries(searchParams.entries());
    const ALLOWED_NOTIFICATION_TYPES: (NotificationEnumType | "ALL")[] = [
      "FRIEND_REQUEST",
      "NEW_FOLLOWER",
      "NEW_MESSAGE",
      "NEW_POST",
      "NEW_LIKE",
      "SYSTEM",
      "ALL",
      "FRIEND_ACCEPT",
      "FRIEND_DECLINE",
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

    let notifications;
    if (type.toUpperCase() === "ALL") {
      notifications = await sql.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [payload.userId, Number(limit) || 20],
      );
    } else {
      notifications = await sql.query(
        `SELECT * FROM notifications WHERE user_id = $1 AND type = $2 LIMIT $3`,
        [payload.userId, type.toUpperCase(), Number(limit) || 20],
      );
    }

    return NextResponse.json({ ok: true, notifications }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
