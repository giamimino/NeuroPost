import { EmailChangeTemplate } from "@/components/email-templates";
import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import client from "@/lib/client";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email)
      return NextResponse.json(
        { ok: false, error: ERRORS.EMAIL_REQUIRED },
        { status: 400 },
      );

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    const payload = auth.user;

    const code = Math.floor(100000 + Math.random() * 900000);

    const { data, error } = await resend.emails.send({
      from: "neuropost@greenmindmail.shop",
      to: email,
      subject: "NeuroPost verify",
      react: EmailChangeTemplate({ code }),
    });

    if (error)
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.EMAIL_VERIFICATION_SEND_ERROR,
        },
        { status: 500 },
      );

    const key = `email_code:${payload.userId}`;
    await client.set(
      key,
      JSON.stringify({ code, email, userId: payload.userId }),
      {
        expiration: { type: "EX", value: 60 * 5 },
      },
    );

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
