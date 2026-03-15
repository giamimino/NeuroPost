import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";
import { JWTUserPaylaod } from "@/types/global";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());

    const cookieStore = await cookies();
    const access_token = cookieStore.get(
      process.env.ACCESS_COOKIE_NAME!,
    )?.value;

    if (!access_token)
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_MISSING },
        { status: 401 },
      );

    let payload;
    try {
      payload = jwt.verify(
        access_token,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }

    const friends = await sql.query(
      `SELECT f.*, 
      json_build_object('name', u.name, 'username', u.username, 'profile_url', u.profile_url) AS user,
      json_build_object('id', fs.id, 'muted', fs.muted) AS settings 
      FROM friends f
      JOIN users u 
        ON u.id = CASE
                    WHEN f.user_id = $1 THEN f.friend_id
                    ELSE f.user_id
                  END
      LEFT JOIN friendship_settings fs 
      ON fs.friendship_id = f.id AND 
        fs.user_id = CASE
                      WHEN f.user_id = $1 THEN f.user_id
                      ELSE f.friend_id
                     END
      WHERE f.user_id = $1 OR f.friend_id = $1 LIMIT $2`,
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
