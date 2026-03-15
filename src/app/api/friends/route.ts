import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";
import { getAuthUser } from "@/lib/auth";

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
    const payload = auth.user;

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
