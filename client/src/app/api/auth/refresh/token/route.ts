import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createAccessToken } from "@/lib/jwt";
import { JWTUserPaylaod } from "@/types/global";
import { ERRORS } from "@/constants/error-handling";
import { getIP } from "@/utils/getIp";
import client from "@/lib/client";

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
    if (!refreshToken)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 500 },
      );

    let auth;
    try {
      auth = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET!,
      ) as JWTUserPaylaod;
    } catch {
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 500 },
      );
    }

    if (!auth.userId)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 500 },
      );

    const ip = getIP(req.headers);
    const key = `refresh:${auth.userId}:${ip}`;
    const refresh = await client.get(key);

    if (!refresh)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 403 },
      );

    const payload = jwt.verify(
      refresh,
      process.env.REFRESH_SECRET!,
    ) as JWTUserPaylaod;

    const newAccessToken = createAccessToken(
      payload.userId,
      payload.username,
      payload.status,
    );

    const res = NextResponse.json({ ok: true, refresh }, { status: 200 });
    res.cookies.set(process.env.ACCESS_COOKIE_NAME!, newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 15,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return res;
  } catch (err) {
    console.log(err);
    return errorResponse("Something went wrong.");
  }
}
