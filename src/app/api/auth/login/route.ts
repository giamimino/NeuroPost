import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { ERRORS } from "@/constants/error-handling";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const selectUsersSql = `SELECT * FROM users WHERE email = $1`;
    const users = await sql.query(selectUsersSql, [email]);
    const user = users[0];
    
    if (!user) {
      return NextResponse.json(
        { error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    const refreshTokenSql = `
      INSERT INTO refresh_tokens (token, user_id, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '7 days')
    `;

    await sql.query(refreshTokenSql, [refreshToken, user.id]);

    const res = NextResponse.json({ success: true }, { status: 200 });

    res.cookies.set(process.env.ACCESS_COOKIE_NAME!, accessToken, {
      httpOnly: true,
      maxAge: 60 * 15,
      secure: true,
      sameSite: "strict",
      path: "/",
    });
    res.cookies.set(process.env.REFRESH_COOKIE_NAME!, refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.log(err);
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
