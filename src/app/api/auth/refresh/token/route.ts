import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createAccessToken } from "@/lib/jwt";

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message,
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(
      process.env.REFRESH_COOKIE_NAME!,
    )?.value;
    if (!refreshToken) return NextResponse.json({}, { status: 401 });

    const rawSql = `SELECT * FROM refresh_tokens WHERE token = $1`;
    const rows = await sql.query(rawSql, [refreshToken]);

    if (rows.length === 0) return NextResponse.json({}, { status: 403 });

    const payload = jwt.verify(
      rows[0].token,
      process.env.REFRESH_SECRET!,
    ) as any;

    const newAccessToken = createAccessToken(payload.userId);

    const res = NextResponse.json({ ok: true, rows }, { status: 200 });
    res.cookies.set(process.env.ACCESS_COOKIE_NAME!, newAccessToken, {
      httpOnly: true,
    });
    return res;
  } catch (err) {
    console.log(err);
    return errorResponse("Something went wrong.");
  }
}
