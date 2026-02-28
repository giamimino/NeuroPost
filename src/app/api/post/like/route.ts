import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { ERRORS } from "@/constants/error-handling";

export async function POST(req: Request) {
  try {
    const { postId }: { postId: number } = await req.json();

    if (!postId)
      return NextResponse.json(
        { ok: false, error: ERRORS.INVALID_REQUEST_ERROR },
        { status: 400 },
      );
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
      return NextResponse.json({ ok: false, dev: error }, { status: 401 });
    }

    const rawSQL = `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING id as like_id`;
    const likes = (await sql.query(rawSQL, [payload.userId, postId]));

    return NextResponse.json(
      { ok: true, like: likes[0].like_id },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id }: { id: string } = await req.json();

    const rawSQL = `DELETE FROM likes WHERE id = $1`;
    await sql.query(rawSQL, [id]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
