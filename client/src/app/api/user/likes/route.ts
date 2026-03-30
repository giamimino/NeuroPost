import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ERRORS } from "@/constants/error-handling";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());
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

    const posts = await sql.query(
      `SELECT p.* FROM likes l JOIN posts p ON p.id = l.post_id WHERE l.user_id = $1 LIMIT $2`,
      [payload.userId, Number(limit) || 20],
    );

    return NextResponse.json({ ok: true, likes: posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
