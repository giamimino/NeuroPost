import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)
      ?.value as string;
    let payload;

    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const rawSql = `SELECT u.id, u.email, u.name, u.username, u.bio, json_build_object('id', f.id, 'created_at', f.created_at) as follow FROM users u 
    LEFT JOIN follows f ON f.follower_id = $2 AND f.follow_id = u.id where u.username = $1`;
    const user = await sql.query(rawSql, [username, payload.userId]);

    console.log(user, username);

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
