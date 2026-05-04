import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import { UsernameSchema } from "@/schemas/auth/auth.schema";
import { StatsEndpointEnum } from "@/schemas/common/enums.schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const $params = await params;
    const username = UsernameSchema.parse($params.username);

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const type = StatsEndpointEnum.parse(queryParams.type);
    const limit = Number(queryParams.limit ?? 10);

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

    let stats;

    const author = await sql.query(
      `SELECT id FROM users WHERE username = $1 LIMIT 1`,
      [username],
    );

    if (author.length === 0)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    switch (type) {
      case "LIKES": {
        const likes = await sql.query(
          `SELECT
            u.name,
            u.username,
            u.profile_url,
            u."isPrivate",
            COUNT(l.id) as likes_count
          FROM posts p
          JOIN likes l ON l.post_id = p.id
          JOIN users u ON l.user_id = u.id
          WHERE p.author_id = $1
          GROUP BY u.name, u.username, u.profile_url, u."isPrivate"
          LIMIT $2`,
          [author[0].id, limit],
        );

        return NextResponse.json({ ok: true, stats, likes }, { status: 200 });
      }
      case "FOLLOWERS": {
        const followers = await sql.query(
          `SELECT
            u.username,
            u.name,
            u.profile_url,
            u."isPrivate"
          FROM follows f
          JOIN users u ON u.id = f.follower_id
          WHERE f.follow_id = $1
          LIMIT $2`,
          [author[0].id, limit],
        );

        const keys = followers.map((f) => f.profile_url ?? "");
        const signed_urls = await Promise.all(
          keys.map((key) => {
            const command = new GetObjectCommand({
              Key: key,
              Bucket: "neuropost",
            });

            return getSignedUrl(s3, command, {
              expiresIn: 5 * 60,
            });
          }),
        );

        const signedFollowers = followers.map((f, i) => ({
          ...f,
          profile_url:
            f.profile_url && !f.isPrivate ? signed_urls[i] : "/user.jpg",
        }));

        return NextResponse.json(
          { ok: true, stats: { followers: signedFollowers } },
          { status: 200 },
        );
      }
      case "FOLLOWING": {
        const following = await sql.query(
          `SELECT
            u.username,
            u.name,
            u.profile_url,
            u."isPrivate"
          FROM follows f
          JOIN users u ON u.id = f.follow_id
          WHERE f.follower_id = $1
          LIMIT $2`,
          [author[0].id, limit],
        );

        const keys = following.map((f) => f.profile_url ?? "");
        const signed_urls = await Promise.all(
          keys.map((key) => {
            const command = new GetObjectCommand({
              Key: key,
              Bucket: "neuropost",
            });

            return getSignedUrl(s3, command, {
              expiresIn: 5 * 60,
            });
          }),
        );

        const signedFollowing = following.map((f, i) => ({
          ...f,
          profile_url:
            f.profile_url && !f.isPrivate ? signed_urls[i] : "/user.jpg",
        }));

        return NextResponse.json(
          { ok: true, stats: { following: signedFollowing } },
          { status: 200 },
        );
      }
      default:
        return NextResponse.json({ ok: true, stats }, { status: 200 });
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );
    }

    console.log(err);

    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
