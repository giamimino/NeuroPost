import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const { token } = body;

    if (!token)
      return NextResponse.json(
        { ok: false, error: ERRORS.VERIFICATION_TOKEN_INVALID },
        { status: 404 },
      );

    let payload;

    try {
      payload = jwt.verify(token, process.env.EMAIL_VERIFY_SECRET!) as {
        id: string;
      };
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { ok: false, error: ERRORS.VERIFICATION_TOKEN_EXPIRED },
        { status: 410 },
      );
    }

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.user.status === "active")
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.VERIFICATION_ALREADY_COMPLETED,
        },
        { status: 400 },
      );

    const users = await sql.query(
      `SELECT username FROM users WHERE id = $1 LIMIT 1`,
      [payload.id],
    );
    const user = users[0];

    if (!user)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    await sql.query(`UPDATE users SET status = 'active' WHERE id = $1`, [
      payload.id,
    ]);

    const accessToken = createAccessToken(payload.id, user.username, "active");
    const refreshToken = createRefreshToken(
      payload.id,
      user.username,
      "active",
    );

    await sql.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1 AND created_at > expires_at`,
      [payload.id],
    );

    await sql.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [refreshToken, payload.id],
    );

    cookieStore.set(process.env.ACCESS_COOKIE_NAME!, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });
    cookieStore.set(process.env.REFRESH_COOKIE_NAME!, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
