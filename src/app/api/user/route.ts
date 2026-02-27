import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const user = await auth({ userId: false, bio: true });

    if (!user || user.status === 401)
      return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ user, ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as {
      username: string;
      name: string;
      bio: string;
    };
    const { username, name, bio } = body;
    if (!username || !name || !bio)
      return NextResponse.json({ ok: false }, { status: 422 });

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

    const user = await sql.query(
      `UPDATE users SET name = $1, username = $2, bio = $3 WHERE id = $4 RETURNING name, username, bio`,
      [name, username, bio, payload.userId],
    );

    return NextResponse.json({ ok: true, user: user[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
