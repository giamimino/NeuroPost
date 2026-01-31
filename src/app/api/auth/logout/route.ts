import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

function errorResponse(message: string) {
  return NextResponse.json({
    success: false,
    message,
  });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

    if (!accessToken) return NextResponse.json({ ok: false }, { status: 401 });
    
    const paylaod = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET!,
    ) as JWTUserPaylaod;
    
    if (!paylaod) return NextResponse.json({ ok: false }, { status: 401 });

    const rawSql = `DELETE FROM refresh_tokens WHERE user_id = $1`;
    await sql.query(rawSql, [paylaod.userId]);

    cookieStore.delete(process.env.ACCESS_COOKIE_NAME!);
    cookieStore.delete(process.env.REFRESH_COOKIE_NAME!);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true }, { status: 401 });

  }
}
