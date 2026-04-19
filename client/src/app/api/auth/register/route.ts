import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";
import { ERRORS } from "@/constants/error-handling";
import { NeonDbError } from "@neondatabase/serverless";
import { getIP } from "@/utils/getIp";
import client from "@/lib/client";
import { RegisterSchema } from "@/schemas/auth/register.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedBody = RegisterSchema.safeParse(body);

    if (!parsedBody.success) {
      try {
        const message = JSON.parse(parsedBody.error.issues[0].message);
        return NextResponse.json(
          { ok: false, error: message },
          { status: 400 },
        );
      } catch (error) {
        return NextResponse.json(
          { ok: false, error: ERRORS.GENERIC_ERROR },
          { status: 400 },
        );
      }
    }

    const { password, email, username } = parsedBody.data;

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

    const ip = getIP(req.headers);
    const key = `refresh:${user[0].id}:${ip}`;
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
