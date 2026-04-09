import { NextResponse, userAgent } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { ERRORS } from "@/constants/error-handling";
import { JWTUserPaylaod } from "@/types/global";
import { getIP } from "@/utils/getIp";
import client from "@/lib/client";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const access_token = cookieStore.get(
      process.env.ACCESS_COOKIE_NAME!,
    )?.value;

    if (!access_token) {
      return NextResponse.json(
        { error: ERRORS.TOKEN_MISSING },
        { status: 401 },
      );
    }
    let payload;
    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch {
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }
    const ip = getIP(req.headers);
    const key = `refresh:${payload.userId}:${ip}`;

    await client.del(key);

    cookieStore.delete(process.env.ACCESS_COOKIE_NAME!);
    cookieStore.delete(process.env.REFRESH_COOKIE_NAME!);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true }, { status: 500 });
  }
}
