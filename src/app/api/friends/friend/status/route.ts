import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { muteStatus } = Object.fromEntries(searchParams.entries());
    const body = await req.json();
    const { friendshipId } = body;

    if (!friendshipId || !Boolean(muteStatus))
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

    const friendSettings = await sql.query(
      `SELECT id, friendship_id, muted FROM friendship_settings WHERE friendship_id = $1 AND user_id = $2`,
      [friendshipId, payload.userId],
    );
    const friend = friendSettings[0];

    if (!friend) {
      await sql.query(
        `INSERT INTO friendship_settings (friendship_id, user_id, muted) VALUES ($1, $2, $3)`,
        [friendshipId, payload.userId, muteStatus],
      );

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await sql.query(`UPDATE friendship_settings SET muted = $1 WHERE id = $2`, [
      muteStatus,
      friend.id,
    ]);

    return NextResponse.json(
      { ok: true, settings: { id: friend.id, muted: muteStatus } },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
