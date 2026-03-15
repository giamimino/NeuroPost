import { auth, getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const user = await auth({ userId: false, bio: true });

    if (!user || user.status === 401)
      return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ user, ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, dev: error }, { status: 500 });
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

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;
    const user = await sql.query(
      `UPDATE users SET name = $1, username = $2, bio = $3 WHERE id = $4 RETURNING name, username, bio`,
      [name, username, bio, payload.userId],
    );

    return NextResponse.json({ ok: true, user: user[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false, dev: error }, { status: 500 });
  }
}
