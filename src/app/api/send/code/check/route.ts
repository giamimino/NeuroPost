import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import client from "@/lib/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code || !Number(code) || !email || !String(email))
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 500 },
      );

    const auth = await getAuthUser();
    if (auth.error)
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 401 },
      );

    if (auth.status === "inactive")
      return NextResponse.json(
        { ok: false, error: auth.error },
        { status: 423 },
      );

    const payload = auth.user;

    const key = `email_code:${payload.userId}`;
    const valid = await client.get(key);
    if (!valid)
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.VERIFICATION_CODE_EXPIRED,
        },
        { status: 410 },
      );

    const parsedValid = JSON.parse(valid);
    if (parsedValid.code !== Number(code) || parsedValid.email !== email)
      return NextResponse.json(
        {
          ok: false,
          error: ERRORS.VERIFICAATION_CODE_INVALID,
        },
        { status: 422 },
      );

    await client.del(key);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
