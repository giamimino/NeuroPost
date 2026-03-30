import { NextResponse } from "next/server";
import { s3 } from "@/lib/aws-sdk";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { ImageValidator } from "@/utils/imageValidator";
import { sql } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ERRORS } from "@/constants/error-handling";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    console.log(formData);

    if (!file) return NextResponse.json({ ok: false }, { status: 400 });

    const error = ImageValidator(file);
    if (error)
      return NextResponse.json({ ok: false, message: error }, { status: 400 });

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

    const users = await sql.query(
      `SELECT profile_url FROM users WHERE id = $1 LIMIT 1`,
      [payload.userId],
    );
    const ruser = users[0];

    if (ruser.profile_url) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: "neuropost",
          Key: ruser.profile_url,
        }),
      );
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
