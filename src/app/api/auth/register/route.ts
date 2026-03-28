import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { ERRORS } from "@/constants/error-handling";
import { PasswordValidator } from "@/utils/validator";
import { NeonDbError } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username?.trim() || !email?.trim() || !password?.trim())
      return NextResponse.json(
        { ok: false, error: ERRORS.REQUIRED_FIELDS },
        { status: 422 },
      );

    const validPassword = PasswordValidator(password);
    if (validPassword.error)
      return NextResponse.json(
        { ok: false, error: validPassword.error },
        { status: 422 },
      );

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await sql.query(
      `INSERT INTO users (email, password, name, username, status) values ($1, $2, $3, $4, $5) RETURNING id, username, status;`,
      [email, hashPassword, username, username, "inactive"],
    );

    const accessToken = createAccessToken(
      user[0].id,
      user[0].username,
      user[0].status,
    );
    const refreshToken = createRefreshToken(
      user[0].id,
      user[0].username,
      user[0].status,
    );

    await sql.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at) values ($1, $2, NOW() + INTERVAL '7 days')`,
      [refreshToken, user[0].id],
    );

    const res = NextResponse.json({ ok: true }, { status: 200 });

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
    if (err instanceof NeonDbError && err.code === "23505") {
      if (err.constraint === "users_username_key") {
        return NextResponse.json(
          { ok: false, error: ERRORS.USERNAME_TAKEN },
          { status: 409 },
        );
      }
      if (err.constraint === "users_email_key") {
        return NextResponse.json(
          {
            ok: false,
            error: ERRORS.EMAIL_ALREADY_EXISTS,
          },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
