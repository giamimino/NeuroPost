import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ERRORS } from "@/constants/error-handling";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const { stats, friend_status } = Object.fromEntries(searchParams.entries());

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;

    const rawSql = `SELECT u.id, u.email, u.name, u.username, u.profile_url, u.bio, json_build_object('id', f.id, 'created_at', f.created_at) as follow FROM users u 
    LEFT JOIN follows f ON f.follower_id = $2 AND f.follow_id = u.id where u.username = $1`;
    const users = await sql.query(rawSql, [username, payload.userId]);
    let user = users[0];

    if (!user || user.length === 0)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    let signedUrl;

    if (user.profile_url) {
      const command = new GetObjectCommand({
        Bucket: "neuropost",
        Key: user.profile_url,
      });

      signedUrl = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });
    }

    user = { ...user, profile_url: user.profile_url ? signedUrl : "/user.jpg" };

    if (Boolean(stats) === true) {
      const stats = await sql.query(
        `
        SELECT 
        (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following,
        (SELECT COUNT(*) FROM follows WHERE follow_id = $1) AS followers,
        (SELECT COUNT(l.id) FROM posts p 
        LEFT JOIN likes l ON l.post_id = p.id 
        WHERE p.author_id = $1) as likes;`,
        [user.id],
      );

      user = { ...user, stats: stats[0] };
    }

    if (Boolean(friend_status) === true && username !== payload.username) {
      const friends = await sql.query(
        `SELECT id FROM friends WHERE CASE
                                        WHEN user_id = $1 AND friend_id = $2 THEN 1
                                        WHEN user_id = $2 AND friend_id = $1 THEN 1
                                        ELSE 0
                                      END = 1;`,
        [payload.userId, user.id],
      );
      const friend = friends[0];
      if (friend) {
        user = {
          ...user,
          friend_status: { id: friend.id, status: "accepted" },
        };
      } else {
        const friend_receive_Status = await sql.query(
          `SELECT id FROM friend_request WHERE receiver_id = $1 AND requester_id = $2 LIMIT 1`,
          [payload.userId, user.id],
        );
        const receive = friend_receive_Status[0];

        if (receive) {
          user = {
            ...user,
            friend_receive: { ...receive },
          };
        } else {
          const friendStatus = await sql.query(
            `SELECT id, status FROM friend_request WHERE receiver_id = $1 AND requester_id = $2 LIMIT 1`,
            [user.id, payload.userId],
          );
          const request = friendStatus[0];

          user = {
            ...user,
            friend_status: request
              ? { id: request.id, status: request.status }
              : undefined,
          };
        }
      }
    }

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
