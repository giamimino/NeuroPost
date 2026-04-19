import { ERRORS } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import {
  EmailInObjectSchema,
  PasswordValidatorSchema,
} from "@/schemas/auth/auth.schema";
import { NextResponse } from "next/server";
import crypto from "crypto";
import client from "@/lib/client";
import { Resend } from "resend";
import { PasswordResetEmailTemplate } from "@/components/email-templates";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

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

    if (error) {
      return NextResponse.json(
        { ok: false, error: ERRORS.EMAIL_VERIFICATION_SEND_ERROR },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const password_reset_token = cookieStore.get(
      process.env.PASSWORD_RESET_COOKIE_NAME!,
    )?.value;

    if (!password_reset_token)
      return NextResponse.json(
        { ok: false, error: ERRORS.PASSWORD_RESET_TOKEN_INVALID },
        { status: 400 },
      );

    let payload;
    try {
      payload = jwt.verify(
        password_reset_token,
        process.env.PASSWORD_RESET_SECRET!,
      ) as any;
    } catch {
      return NextResponse.json(
        { ok: false, error: ERRORS.PASSWORD_RESET_TOKEN_EXPIRED },
        { status: 400 },
      );
    }

    const parsedPassword = PasswordValidatorSchema.safeParse(body.password);

    if (!parsedPassword.success) {
      const message = JSON.parse(parsedPassword.error.issues[0].message);

      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const password = parsedPassword.data;
    const hashedPassword = await bcrypt.hash(password, 12)

    await sql.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, payload.userId]
    )

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
