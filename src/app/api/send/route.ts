import { Resend } from "resend";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { ERRORS } from "@/constants/error-handling";
import { VerifyEmailTamplate } from "@/components/email-templates";
import { createEmailVerifyToken } from "@/lib/jwt";
import { sql } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );
    if (auth.user.status === "active")
      return NextResponse.json(
        { ok: false, error: ERRORS.ACCOUNT_ACTIVE },
        { status: 403 },
      );
    const payload = auth.user;

    const users = await sql.query(
      `SELECT id, username, email FROM users WHERE id = $1 LIMIT 1`,
      [payload.userId],
    );
    const user = users[0];

    if (!user)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    const emailVerifyToken = createEmailVerifyToken({ id: payload.userId });
    const url = `${process.env.DOMAIN_URL!}verify?token=${emailVerifyToken}`;

    const { data, error } = await resend.emails.send({
      from: "neuropost@greenmindmail.shop",
      to: user.email,
      subject: "NeuroPost verify",
      react: VerifyEmailTamplate({ username: user.username, url }),
    });

    if (error)
      return NextResponse.json(
        { ok: false, error: ERRORS.EMAIL_VERIFICATION_SEND_ERROR },
        { status: 500 },
      );

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
