import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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

    const hasNewNotifications = await sql.query(
      `SELECT EXISTS (SELECT 1 FROM notifications WHERE isread = false AND user_id = $1)`,
      [payload.userId],
    );

    const data = {
      hasNewNotifications,
    };

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
