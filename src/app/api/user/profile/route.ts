import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { JWTUserPaylaod } from "@/types/global";
import { s3 } from "@/lib/aws-sdk";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageValidator } from "@/utils/imageValidator";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ ok: false }, { status: 400 });

    const error = ImageValidator(file);
    if (error)
      return NextResponse.json({ ok: false, message: error }, { status: 400 });

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

    const extension = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${extension}`;
    const key = `profiles/${payload.userId}/${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3.send(
      new PutObjectCommand({
        Bucket: "neuropost",
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const user = await sql.query(
      `UPDATE users SET profile_url = $1 WHERE id = $2 RETURNING profile_url`,
      [key, payload.userId],
    );

    return NextResponse.json(
      { ok: true, image: user[0].profile_url },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}