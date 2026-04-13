import { ERRORS } from "@/constants/error-handling";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CommentType, CommentUserType } from "@/types/neon";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/aws-sdk";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, post_id }: { content: string; post_id: number } = body;

    if (!content || !content.trim() || !post_id || !Number(post_id))
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_EMPTY_ERROR },
        { status: 400 },
      );

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
    const { postId, limit } = Object.fromEntries(
      searchParams.entries(),
    );

    if (!postId || !Number(postId))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

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

    const comments = await sql.query(
      `SELECT c.*, json_build_object('id', u.id, 'name', u.name, 'username', u.username, 'profile_url', u.profile_url) as user, COUNT(r.id) as replies_count FROM comments c 
      JOIN users u ON u.id = c.user_id
      LEFT JOIN comments r ON r.parent_id = c.id
      WHERE c.post_id = $1 AND c.parent_id IS NULL ORDER BY c.created_at DESC LIMIT $2`,
      [postId, Number(limit) || 20],
    );

    if (!comments)
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_NOT_FOUND },
        { status: 404 },
      );

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

    const signedComments = comments.map((c, i) => ({
      ...c,
      user: {
        ...c.user,
        profile_url: c.user.profile_url ? signedUrls[i] : "/user.jpg",
      },
      role: c.user_id === payload.userId ? "creator" : "guest",
    }));

    return NextResponse.json(
      {
        ok: true,
        comments: signedComments
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
