import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { s3 } from "@/lib/aws-sdk";
import { sql } from "@/lib/db";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { MediaValidator } from "@/utils/validator";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id)
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const formData = await req.formData();
    const title = formData.get("title") as string | undefined;
    const description = formData.get("description") as string | undefined;
    const media = formData.get("media") as File | undefined;
    if (!title && !description && !media)
      return NextResponse.json({ ok: false, error: ERRORS.GENERIC_ERROR });

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;

    const posts = await sql.query(
      `SELECT id, author_id, title, description FROM posts WHERE id = $1 LIMIT 1`,
      [id],
    );
    const post = posts[0];

    if (payload.userId !== post.author_id)
      return NextResponse.json(
        { ok: false, error: ERRORS.NOT_ALLOWED },
        { status: 403 },
      );

    if (title || description) {
      const editedValues = {
        title: title || post.title,
        description: description || post.description,
      };

      await sql.query(
        "UPDATE posts SET title = $1, description = $2 WHERE id = $3",
        [editedValues.title, editedValues.description, id],
      );
    }
    let resMedia;
    if (media) {
      const error = MediaValidator(media);
      if (error)
        return NextResponse.json({ ok: false, error }, { status: 400 });

      const postMedias = await sql.query(
        `SELECT * FROM media WHERE post_id = $1 LIMIT 1`,
        [id],
      );
      const postMedia = postMedias[0];

      if (postMedia) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "neuropost",
            Key: postMedia.fileurl,
          }),
        );
      }

      const extension = media.name.split(".").pop();
      const filename = `${crypto.randomUUID}.${extension}`;
      const key = `media/${payload.userId}/${post.id}/${filename}`;
      const arrayBuffer = await media.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const type = media.type.split("/")[0];

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: "neuropost",
            Key: key,
            Body: buffer,
            ContentType: media.type,
          }),
        );

        if (postMedia) {
          resMedia = await sql.query(
            `UPDATE media SET fileurl = $1, type = $2 WHERE id = $3 RETURNING *`,
            [key, type, postMedia.id],
          );
        } else {
          resMedia = await sql.query(
            `INSERT INTO media (fileurl, type, post_id) VALUES ($1, $2, $3) RETURNING *`,
            [key, type, id],
          );
        }
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { ok: false, error: ERRORS.MEDIA_PROCESSING_FAILED },
          { status: 500 },
        );
      }
    }
    let signedUrl;
    if (resMedia && resMedia.length > 0) {
      const command = new GetObjectCommand({
        Bucket: "neuropost",
        Key: resMedia[0].fileurl,
      });
      signedUrl = await getSignedUrl(s3, command, { expiresIn: 5 * 60 });
    }

    return NextResponse.json({
      ok: true,
      post: {
        title,
        description,
        meida: resMedia ? resMedia[0] : undefined,
      },
      signedUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: ERRORS.GENERIC_ERROR },
      { status: 500 },
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    // const { searchParams } = new URL(req.url)
    // const { i } = Object.fromEntries(searchParams.entries())

    if (!id || !Number(id))
      return NextResponse.json({ ok: false }, { status: 400 });

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;

    const posts = await sql.query(
      `SELECT p.*, json_build_object('name', u.name, 'username', u.username, 'profile_url', u.profile_url) AS user, l.id AS likeId 
      FROM posts p JOIN users u ON p.author_id=u.id 
      LEFT JOIN likes l ON l.post_id = $1 AND l.user_id = $2
      WHERE p.id = $1 GROUP BY p.id, u.name, u.username, u.profile_url, l.id`,
      [Number(id), payload?.userId],
    );
    const post = posts[0];

    const likes = await sql.query(
      `SELECT COUNT(*) FROM likes WHERE post_id = $1`,
      [Number(id)],
    );

    let role: "creator" | "guest";
    if (post.author_id === payload?.userId) {
      role = "creator";
    } else {
      role = "guest";
    }

    const medias = await sql.query(`SELECT * FROM media where post_id = $1`, [
      post.id,
    ]);
    const media = medias[0];
    const keys = [post.user.profile_url || "", media?.fileurl || ""];

    const signedUrls = await Promise.all(
      keys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: "neuropost",
          Key: key,
        });
        return getSignedUrl(s3, command, { expiresIn: 60 * 5 });
      }),
    );
    console.log(likes[0].count);

    return NextResponse.json(
      {
        ok: true,
        post: {
          ...post,
          signedUrl: signedUrls[1] || null,
          media,
          role,
          likes: Number(likes[0].count),
          user: {
            ...post.user,
            profile_url: post.user.profile_url ? signedUrls[0] : "/user.jpg",
          },
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
