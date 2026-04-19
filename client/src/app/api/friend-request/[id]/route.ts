import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { NOTIFICATIONS_TEXT } from "@/constants/notifications";
import { getAuthUser } from "@/lib/auth";
import { SETTINGS_KEYS } from "@/constants/settings-keys";
import { NotificationEnumType } from "@/types/enums";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const requestId = (await params).id;

    const body = await req.json();
    const { action } = body;

    if (!requestId || !["accept", "reject"].includes(action))
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

    const friend_requests = await sql.query(
      `SELECT requester_id, receiver_id FROM friend_request WHERE id = $1`,
      [requestId],
    );
    const friend_request = friend_requests[0];

    if (!friend_request)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 404 },
      );

    if (friend_request.receiver_id !== payload.userId)
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 403 },
      );

    const user_settings = await sql.query(
      `
      SELECT value FROM user_settings WHERE user_id = $1 AND key = $2`,
      [
        friend_request.requester_id,
        SETTINGS_KEYS.NOTIFICATIONS_SETTINGS_KEYS.FRIEND_ACCEPTS,
      ],
    );
    const user_setting = user_settings[0] || { value: true };

    if (user_setting.value) {
      const key =
        action === "accept"
          ? "FRIEND_REQUEST_ACCEPTED"
          : "FRIEND_REQUEST_DECLINED";
      const title = NOTIFICATIONS_TEXT[key].title;
      const description = `${payload.username} ${NOTIFICATIONS_TEXT[key].description} `;
      const body = {
        description,
        sentAt: new Date(Date.now()),
      };
      const type = (
        action === "accept" ? "FRIEND_ACCEPT" : "FRIEND_DECLINE"
      ) as NotificationEnumType;

      await sql.query(
        "INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)",
        [friend_request.requester_id, type, title, body],
      );
    }

    if (action === "accept") {
      await sql.query(
        `
          WITH deleted AS (
            DELETE FROM friend_request
            WHERE id = $1
            RETURNING requester_id
          )
          INSERT INTO friends (user_id, friend_id)
          SELECT 
              LEAST($2::text, requester_id::text)::uuid,
              GREATEST($2::text, requester_id::text)::uuid
          FROM deleted;
        `,
        [requestId, payload.userId],
      );
    } else {
      await sql.query(`DELETE FROM friend_request WHERE id = $1`, [requestId]);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
