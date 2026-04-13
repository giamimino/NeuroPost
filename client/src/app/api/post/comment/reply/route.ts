import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import {
  CommentReplyAPISchema,
  CommentReplySchema,
} from "@/schemas/comment/reply.schema";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      content,
      post_id,
      comment_id,
    }: { content: string; post_id: number; comment_id: string } = body;

    try {
      CommentReplyAPISchema.parse({ content, post_id, comment_id });
    } catch (err) {
      console.log(err);
    }

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );

    if (auth.status === "inactive")
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.ACCOUNT_INACTIVE,
        },
        { status: 423 },
      );

    const payload = auth.user;

    const comments = await sql.query(
      `
      WITH insert_comment AS 
      (INSERT INTO comments (content, post_id, user_id, parent_id) VALUES ($1, $2, $3, $4) RETURNING *)
      SELECT insert_comment.*, 
      json_build_object('id', u.id, 'username', u.username, 'name', u.name, 'profile_url', u.profile_url) AS user
      FROM insert_comment
      JOIN users u ON u.id = insert_comment.user_id
      `,
      [content, post_id, payload.userId, comment_id],
    );
    const comment = comments[0];

    if (!comment)
      return NextResponse.json(
        { ok: false, error: ERRORS.COMMENT_CREATION_FAILED },
        { status: 500 },
      );

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: "neuropost",
        Key: comment.user.profile_url,
      }),
      { expiresIn: 5 * 60 },
    );

    const signedComment = {
      ...comment,
      user: {
        ...comment.user,
        profile_url: comment.user.profile_url ? signedUrl : "/user.jpg",
      },
    };

    const result = CommentReplySchema.safeParse(signedComment);

    if (!result.success) {
      console.error(result.error);
      return NextResponse.json({
        ok: false,
        error: ERRORS.COMMENT_CREATION_FAILED,
      });
    }

    return NextResponse.json(
      { ok: true, comment: result.data },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
