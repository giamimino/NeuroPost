import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { followId }: { followId: string } = body;

    if (!followId || !String(followId))
      return NextResponse.json(
        { ok: false, error: ERRORS.INVALID_REQUEST_ERROR },
        { status: 400 },
      );

    const cookieStore = await cookies();
    const access_token = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)
      ?.value as string;
    let payload;

    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

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
    
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 })
  }
}
