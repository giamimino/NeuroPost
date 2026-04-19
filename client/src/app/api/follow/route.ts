import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { SETTINGS_KEYS } from "@/constants/settings-keys";
import { NOTIFICATIONS_TEXT } from "@/constants/notifications";
import { NotificationEnumType } from "@/types/enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { followId }: { followId: string } = body;

    if (!followId || !String(followId))
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

    if (payload.userId === followId)
      return NextResponse.json(
        { ok: false, error: ERRORS.YOURSELF_FOLLOW_ERROR },
        { status: 400 },
      );

    const user_settings = await sql.query(
      `
      SELECT value FROM user_settings WHERE user_id = $1 AND key = $2
    `,
      [followId, SETTINGS_KEYS.NOTIFICATIONS_SETTINGS_KEYS.NEW_FOLLOWERS],
    );

    const user_setting = user_settings[0] || { value: "true" };

    if (user_setting.value === "true" ? true : false) {
      const title = NOTIFICATIONS_TEXT.NEW_FOLLOWER.title;
      const description = `${payload.username} ${NOTIFICATIONS_TEXT.NEW_FOLLOWER.description}`;
      const type = "NEW_FOLLOWER" as NotificationEnumType;
      const body = { description, username: payload.username };

      await sql.query(
        `INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)`,
        [followId, type, title, body],
      );
    }

    const follow = await sql.query(
      `INSERT INTO follows (follow_id, follower_id) VALUES ($1, $2) RETURNING *`,
      [followId, payload.userId],
    );

    return NextResponse.json(
      { ok: true, follow: follow[0], user_setting },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { followId } = body;

    if (!followId)
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

    const follows = await sql.query(`SELECT * FROM follows WHERE id = $1`, [
      followId,
    ]);

    if (follows[0].follower_id !== payload.userId)
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 404 },
      );

    await sql.query(`DELETE FROM follows WHERE id = $1`, [followId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
