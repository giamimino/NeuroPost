import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { ERRORS } from "@/constants/error-handling";
import client from "@/lib/client";
import { getIP } from "@/utils/getIp";
import { LoginSchema } from "@/schemas/auth/login.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedBody = LoginSchema.safeParse(body);

    if (!parsedBody.success) {
      const message = JSON.parse(parsedBody.error.issues[0].message);

      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const { email, password } = parsedBody.data!;

    const users = await sql.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: ERRORS.USER_NOT_FOUND },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: ERRORS.INVALID_CREDENTIALS },
        { status: 401 },
      );
    }

    const accessToken = createAccessToken(user.id, user.username, user.status);
    const refreshToken = createRefreshToken(
      user.id,
      user.username,
      user.status,
    );
    const ip = getIP(req.headers);
    const key = `refresh:${user.id}:${ip}`;
    const exp = 60 * 60 * 24 * 7;

    await client.set(key, refreshToken, {
      expiration: { type: "EX", value: exp },
    });

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
    console.log(err);
    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
