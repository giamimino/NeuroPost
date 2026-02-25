import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { CommentType, CommentUserType } from "@/types/neon";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, post_id }: { content: string; post_id: number } = body;

    if (!content || !content.trim() || !post_id || !Number(post_id))
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_EMPTY_ERROR },
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
      return NextResponse.json(
        { ok: false, error: ERRORS.TOKEN_INVALID },
        { status: 401 },
      );
    }

    const comment = await sql.query(
      `WITH new_comment AS (INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *) 
      SELECT new_comment.*, json_build_object('id', u.id, 'name', u.name, 'profile_url', u.profile_url) as user FROM new_comment 
      JOIN users u ON u.id = new_comment.user_id`,
      [content, post_id, payload.userId],
    );

    const key = comment[0].user.profile_url;
    let signedUrl;
    if (key) {
      const command = new GetObjectCommand({
        Bucket: "neuropost",
        Key: key,
      });

      signedUrl = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });
    }

    return NextResponse.json(
      {
        ok: true,
        comment: {
          ...comment[0],
          user: { ...comment[0].user, profile_url: signedUrl || key },
          role: "creator",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { postId, limit, withProfile } = Object.fromEntries(
      searchParams.entries(),
    );

    if (!postId || !Number(postId))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
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
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const comments = (await sql.query(
      `SELECT c.*, json_build_object('id', u.id, 'name', u.name, 'username', u.username, 'profile_url', u.profile_url) as user FROM comments c 
      JOIN users u ON u.id = c.user_id WHERE c.post_id = $1 ORDER BY c.created_at DESC LIMIT $2`,
      [postId, Number(limit) || 20],
    )) as (CommentType & { user: CommentUserType })[];
    const commentItems = comments.map((comment) => ({
      ...comment,
      role: comment.user_id === payload.userId ? "creator" : "guest",
    }));

    if (!comments)
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_NOT_FOUND },
        { status: 404 },
      );

    let signedComments = null;
    if (Boolean(withProfile) === true) {
      const keys = comments.map((c) => c.user.profile_url || "");

      const signedUrls = await Promise.all(
        keys.map((key) => {
          const command = new GetObjectCommand({
            Bucket: "neuropost",
            Key: key,
          });

          return getSignedUrl(s3, command, { expiresIn: 5 * 60 });
        }),
      );

      signedComments = commentItems.map((c, i) => ({
        ...c,
        user: {
          ...c.user,
          profile_url: c.user.profile_url ? signedUrls[i] : "/user.jpg",
        },
      }));
    }

    return NextResponse.json(
      {
        ok: true,
        comments:
          withProfile && signedComments && signedComments.length > 0
            ? signedComments
            : commentItems,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
