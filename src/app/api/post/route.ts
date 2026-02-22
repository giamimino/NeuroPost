import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { ERRORS } from "@/constants/error-handling";
import { auth } from "@/lib/auth";
import { MediaValidator } from "@/utils/validator";
import { s3 } from "@/lib/aws-sdk";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { flushAllTraces } from "next/dist/trace";

interface TagInput {
  id?: number;
  tag: string;
}
interface DBTag {
  id: number;
  tag: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, col, dir, cursor, tag, withTags } = Object.fromEntries(
      searchParams.entries(),
    );
    if (tag) {
      const posts = await sql.query(
        `SELECT P.*, json_agg(json_build_object('id', t.id, 'tag', t.tag)) as tags FROM tags t 
        JOIN post_tag pt ON t.id = pt.tag_id 
        JOIN posts p ON p.id = pt.post_id
        WHERE t.tag = $1 GROUP BY p.id`,
        [tag],
      );

      return NextResponse.json({ ok: true, posts }, { status: 200 });
    }
    const columns = ["created_at", "title"];
    const directions = ["ASC", "DESC"];

    if (!columns.includes(col) || !directions.includes(dir)) {
      throw new Error("Nice try, hacker.");
    }

    const date =
      cursor && !isNaN(new Date(cursor).getTime())
        ? new Date(cursor).toISOString()
        : new Date(Date.now()).toISOString();
    // const userId = joinLikes ? await auth({ userId: true }) : null;
    const rawSql = withTags
      ? `
      SELECT p.*, json_agg(json_build_object('id', t.id, 'tag', t.tag)) as tags FROM posts p
      LEFT JOIN post_tag pt ON p.id = pt.post_id
      LEFT JOIN tags t ON t.id = pt.tag_id
      WHERE p.created_at < $2 GROUP BY p.id ORDER BY p.${col} ${dir} LIMIT $1 
    `
      : `SELECT * FROM posts WHERE created_at < $2 ORDER BY ${col} ${dir} LIMIT $1`;
    const posts = await sql.query(rawSql, [Number(limit) || 20, date]);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: ERRORS.GENERIC_ERROR },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsJSON = formData.get("tags") as string;
    const tags = JSON.parse(tagsJSON) as TagInput[];
    const file = formData.get("file") as File | undefined;

    if (!title.trim() || !description.trim()) {
      return NextResponse.json(
        { ok: false, message: "Invalid input" },
        { status: 422 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(process.env.ACCESS_COOKIE_NAME!)?.value;

    if (!accessToken) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    let payload: JWTUserPaylaod;

    try {
      payload = jwt.verify(
        accessToken,
        process.env.ACCESS_SECRET!,
      ) as JWTUserPaylaod;
    } catch {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await sql.query("BEGIN");

    const postResult = await sql.query(
      `INSERT INTO posts (title, description, author_id)
       VALUES ($1, $2, $3)
       RETURNING id, title, description, author_id`,
      [title, description ?? null, payload.userId],
    );

    const post = postResult[0];

    if (!post?.id) {
      await sql.query("ROLLBACK");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    if (tags.length === 0) {
      await sql.query("COMMIT");
      return NextResponse.json({ ok: true, post }, { status: 200 });
    }

    const newTagNames = tags
      .filter((t) => typeof t.id === "undefined")
      .map((t) => t.tag);

    let existingTags: DBTag[] = [];

    if (newTagNames.length > 0) {
      const placeholders = newTagNames.map((_, i) => `$${i + 1}`).join(",");

      existingTags = (await sql.query(
        `SELECT id, tag FROM tags WHERE tag IN (${placeholders})`,
        newTagNames,
      )) as DBTag[];
    }

    const existingTagNames = new Set(existingTags.map((t) => t.tag));

    const tagsToInsert = newTagNames.filter(
      (tag) => !existingTagNames.has(tag),
    );

    let insertedTags: DBTag[] = [];

    if (tagsToInsert.length > 0) {
      const values = tagsToInsert.map((_, i) => `($${i + 1})`).join(",");

      insertedTags = (await sql.query(
        `INSERT INTO tags (tag) VALUES ${values} RETURNING id, tag`,
        tagsToInsert,
      )) as DBTag[];
    }

    const existTags = tags.filter(
      (tag) => typeof tag.id !== "undefined",
    ) as DBTag[];
    const allTags: DBTag[] = [...existingTags, ...insertedTags, ...existTags];

    if (allTags.length > 0) {
      const relationValues = allTags.map((_, i) => `($1, $${i + 2})`).join(",");

      const params = [post.id, ...allTags.map((t) => t.id)];

      await sql.query(
        `INSERT INTO post_tag (post_id, tag_id) VALUES ${relationValues}`,
        params,
      );
    }

    if (file) {
      const error = MediaValidator(file);
      if (error) return NextResponse.json({ ok: true, message: error });

      const extension = file.name.split(".").pop();
      const filename = `${crypto.randomUUID()}.${extension}`;
      const key = `media/${payload.userId}/${post.id}/${filename}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const type = file.type.split("/")[0];

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: "neuropost",
            Key: key,
            Body: buffer,
            ContentType: file.type,
          }),
        );
      } catch (error) {
        return NextResponse.json(
          { ok: false, message: "Media upload failed." },
          { status: 500 },
        );
      }

      const media = await sql.query(
        `INSERT INTO media (fileurl, type, post_id) VALUES ($1, $2, $3)`,
        [key, type, post.id],
      );
      console.log(media);
    }

    await sql.query("COMMIT");

    return NextResponse.json({ ok: true, post }, { status: 200 });
  } catch (error) {
    console.error("POST /posts error:", error);
    await sql.query("ROLLBACK");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { postId, mediaId }: { postId: number; mediaId: string } = body;

    if (!postId || !Number(postId))
      return NextResponse.json({ ok: false }, { status: 400 });

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

    const posts = await sql.query(
      `SELECT p.author_id, p.id, json_agg(json_build_object('media_id', m.id, 'fileurl', m.fileurl)) as media
      FROM posts p LEFT JOIN media m ON m.post_id = p.id  WHERE p.id = $1 GROUP BY p.id`,
      [postId],
    )
    const post = posts[0];

    if (!post) return NextResponse.json({ ok: false }, { status: 404 });

    if (post.author_id !== payload.userId)
      return NextResponse.json({ ok: false, error: ERRORS.NOT_ALLOWED }, { status: 403 });

    await sql.query(`DELETE FROM posts WHERE author_id = $1 and id = $2`, [
      payload.userId,
      post.id,
    ]);

    if (mediaId && post.media[0].fileurl) {
      const media = post.media[0]

      console.log(media);
      

      if (!media) return NextResponse.json({ ok: false }, { status: 404 });

      await s3.send(
        new DeleteObjectCommand({
          Bucket: "neuropost",
          Key: media.fileurl,
        }),
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
