import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { NOTIFICATIONS_TEXT } from "@/constants/notifications";

export async function PATCH(
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

    const { searchParams } = new URL(req.url);
    const { withNotif } = Object.fromEntries(searchParams.entries());

    const cookieStore = await cookies();
    const access_token = cookieStore.get(
      process.env.ACCESS_COOKIE_NAME!,
    )?.value;
    if (!access_token)
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_MISSING },
        { status: 404 },
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

    const friend_requests = await sql.query(
      `SELECT * FROM friend_request WHERE id = $1`,
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

    if (Boolean(withNotif) === true) {
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
      const type = "FRIEND_REQUEST";

      await sql.query(
        "INSERT INTO notifications (user_id, type, title, body) VALUES ($1, $2, $3, $4)",
        [friend_request.requester_id, type, title, body],
      );
    }

    if (action === "accept") {
      // add as friend query goes there
    }

    await sql.query(`DELETE FROM friend_request WHERE id = $1`, [requestId]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
