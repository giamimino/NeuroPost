import { NextResponse } from "next/server";
import crypto from "crypto";
import client from "@/lib/client";
import { ERRORS } from "@/constants/error-handling";
import { cookies } from "next/headers";
import { createPasswordResetToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    const hash = crypto.createHash("sha256").update(token).digest("hex");

    const key = `reset:${hash}`;

    const user = await client.get(key);
    if (!user)
      return NextResponse.json(
        { ok: false, error: ERRORS.VERIFICATION_TOKEN_INVALID },
        { status: 404 },
      );

    const parsedUser = JSON.parse(user);

    const cookieStore = await cookies();
    const password_reset_token = createPasswordResetToken({
      ...parsedUser,
      token,
    });

    cookieStore.set(
      process.env.PASSWORD_RESET_COOKIE_NAME!,
      password_reset_token,
      {
        httpOnly: true,
        maxAge: 60 * 15,
        secure: true,
        sameSite: "strict",
        path: "/",
      },
    );

    return NextResponse.json(
      { ok: true, user: { username: parsedUser.username } },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
