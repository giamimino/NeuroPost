import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { sql } from "@/lib/db";
import { createAccessToken, createRefreshToken } from "@/lib/jwt";

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message,
  });
}

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username.trim() || !email.trim() || !password.trim())
      return NextResponse.json(
        { error: "Please fill up required fields." },
        { status: 401 },
      );

    const hashPassword = await bcrypt.hash(password, 12);

    const rawUserSql = `INSERT INTO users (email, password, name, username) values ($1, $2, $3, $4) RETURNING id;`;
    const user = (await sql.query(rawUserSql, [
      email,
      hashPassword,
      username,
      username,
    ])) as any;

    const accessToken = createAccessToken(user[0].id);
    const refreshToken = createRefreshToken(user[0].id);

    const refreshTokenSql = `INSERT INTO refresh_tokens (token, user_id, expires_at) values (${refreshToken}, ${user[0].id}, NOW() + INTERVAL '7 days')`;
    await sql.query(refreshTokenSql);

    const res = NextResponse.json({ success: true });

    res.cookies.set(process.env.ACCESS_COOKIE_NAME!, accessToken, {
      httpOnly: true,
    });
    res.cookies.set(process.env.REFRESH_COOKIE_NAME!, refreshToken, {
      httpOnly: true,
    });

    return res;
  } catch (err) {
    console.error(err);
    return errorResponse("Something went wrong.");
  }
}
