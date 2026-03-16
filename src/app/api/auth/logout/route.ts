import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const auth = await getAuthUser();

    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const paylaod = auth.user;
    await sql.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
      paylaod.userId,
    ]);

    cookieStore.delete(process.env.ACCESS_COOKIE_NAME!);
    cookieStore.delete(process.env.REFRESH_COOKIE_NAME!);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: true }, { status: 500 });
  }
}
