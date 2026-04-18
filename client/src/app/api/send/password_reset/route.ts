import { ERRORS } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import { EmailInObjectSchema } from "@/schemas/auth/auth.schema";
import { NextResponse } from "next/server";
import crypto from "crypto";
import client from "@/lib/client";
import { Resend } from "resend";
import { PasswordResetEmailTemplate } from "@/components/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsedBody = EmailInObjectSchema.safeParse(body);

    if (!parsedBody.success) {
      const message = JSON.parse(parsedBody.error.issues[0].message);

      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const users = await sql.query(
      `SELECT id, status, username FROM users WHERE email = $1`,
      [parsedBody.data.email],
    );
    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );
    }
    if (user.status === "inactive") {
      return NextResponse.json(
        { ok: false, error: ERRORS.PASSWORD_RESET_ACC_INACTIVE },
        { status: 423 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const value = { userId: user.id, username: user.username };

    await client.set(`reset:${hash}`, JSON.stringify(value), {
      expiration: { type: "EX", value: 60 * 15 },
    });

    const url = `${process.env.DOMAIN_URL!}auth/password_reset/${token}`;

    const { data, error } = await resend.emails.send({
      from: "neuropost@greenmindmail.shop",
      to: parsedBody.data.email,
      subject: "NeuroPost verify",
      react: PasswordResetEmailTemplate({ url }),
    });

    if(error) {
      return NextResponse.json(
        { ok: false, error: ERRORS.EMAIL_VERIFICATION_SEND_ERROR },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
