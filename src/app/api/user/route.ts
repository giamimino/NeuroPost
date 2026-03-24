import { auth, getAuthUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ERRORS } from "@/constants/error-handling";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/aws-sdk";
import { cookies } from "next/headers";

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
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
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

export async function DELETE() {
  try {
    const auth = await getAuthUser();
    const cookieStore = await cookies();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_INACTIVE },
        { status: 423 },
      );

    const payload = auth.user;

    const users = await sql.query(
      `SELECT id, profile_url FROM users WHERE id = $1 LIMIT 1`,
      [payload.userId],
    );

    const user = users[0];

    if (!user)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    if (user.profile_url) {
      const command = new DeleteObjectCommand({
        Bucket: "neuropost",
        Key: user.profile_url,
      });
      await s3.send(command);
    }

    const medias = await sql.query(
      `SELECT fileurl FROM media WHERE user_id = $1`,
      [user.id],
    );
    if (medias.length > 0) {
      await Promise.all(
        medias.map((media) => {
          const command = new DeleteObjectCommand({
            Bucket: "neuropost",
            Key: media.fileurl,
          });

          return s3.send(command);
        }),
      );
    }

    await sql.query(`DELETE FROM users WHERE id = $1`, [user.id]);

    cookieStore.delete(process.env.ACCESS_COOKIE_NAME!);
    cookieStore.delete(process.env.REFRESH_COOKIE_NAME!);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
