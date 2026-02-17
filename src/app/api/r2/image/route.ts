import { s3 } from "@/lib/aws-sdk";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body: { image_url: string } = await req.json();
    const { image_url } = body;

    const command = new GetObjectCommand({
      Bucket: "neuropost",
      Key: image_url,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60 * 5,
    });

    return NextResponse.json(
      { ok: true, profileImage: signedUrl },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
