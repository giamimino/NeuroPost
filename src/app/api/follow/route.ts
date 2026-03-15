import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

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
    const payload = auth.user;

    if (payload.userId === followId)
      return NextResponse.json(
        { ok: false, error: ERRORS.YOURSELF_FOLLOW_ERROR },
        { status: 400 },
      );

    const follow = await sql.query(
      `INSERT INTO follows (follow_id, follower_id) VALUES ($1, $2) RETURNING *`,
      [followId, payload.userId],
    );

    return NextResponse.json({ ok: true, follow: follow[0] }, { status: 200 });
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
