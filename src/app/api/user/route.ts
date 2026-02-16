import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWTUserPaylaod } from "@/types/global";
import { sql } from "@/lib/db";
import { s3 } from "@/lib/aws-sdk";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const user = await auth({ userId: false, bio: true });

    if (!user || user.status === 401)
      return NextResponse.json({ ok: false }, { status: 401 });

    return NextResponse.json({ user, ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as {
      username: string;
      name: string;
      bio: string;
      file: File | undefined;
      profile_url: string | null;
    };
    const { username, name, bio, file, profile_url } = body;
    if (!username || !name || !bio)
      return NextResponse.json({ ok: false }, { status: 422 });

    let image_url = profile_url;

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
    let filename;
    try {
      if (!file) return;
      filename = `${payload.userId}-image`;
      const Key = `profiles/${filename}`;
      const arrayBuffer = await file.arrayBuffer();
      await s3.send(
        new PutObjectCommand({
          Bucket: "neuropost",
          Key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
        }),
      );

      image_url = `https://${process.}`
    } catch (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const user = await sql.query(
      `UPDATE users SET name = $1, username = $2, bio = $3, profile_url = $5 WHERE id = $4 RETURNING name, username, bio`,
      [name, username, bio, payload.userId, profile_url],
    );

    return NextResponse.json({ ok: true, user: user[0] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
