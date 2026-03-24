import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());

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

    const friends = await sql.query(
      `SELECT f.id, 
          json_build_object('id', u.id, 'name', u.name, 'username', u.username, 'profile_url', u.profile_url) as user
          FROM friendship_settings fs 
          JOIN friends f ON fs.friendship_id = f.id
          JOIN users u ON u.id = CASE 
                                  WHEN f.user_id = $1 THEN f.friend_id
                                  ELSE f.user_id
                                 END
          WHERE fs.user_id = $1 AND fs.blocked = true 
          LIMIT $2`,
      [payload.userId, Number(limit) || 20],
    );

    const keys = friends.map((f) => f.user.profile_url || "");
    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });

        return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
      }),
    );

    const signedFriends = friends.map((f, i) => ({
      ...f,
      user: {
        ...f.user,
        profile_url: f.user.profile_url ? signedUrls[i] : "/user.jpg",
      },
    }));

    return NextResponse.json(
      { ok: true, friends: signedFriends },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blocked, friendship_id } = body;

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

    const settings = await sql.query(
      `SELECT id FROM friendship_settings WHERE friendship_id = $1 AND user_id = $2 LIMIT 1`,
      [friendship_id, payload.userId],
    );
    const setting = settings[0];

    if (setting) {
      await sql.query(
        `UPDATE friendship_settings SET blocked = $1 WHERE id = $2`,
        [blocked, setting.id],
      );
    } else {
      await sql.query(
        `INSERT INTO friendship_settings (friendship_id, user_id, blocked) VALUES ($1, $2, $3)`,
        [friendship_id, payload.userId, blocked],
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
