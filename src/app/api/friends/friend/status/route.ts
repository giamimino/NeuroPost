import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;

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
