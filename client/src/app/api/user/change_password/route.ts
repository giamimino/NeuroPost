import { ERRORS } from "@/constants/error-handling";
import { getAuthUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PasswordValidator } from "@/utils/validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword)
      return NextResponse.json(
        { ok: false, error: ERRORS.REQUIRED_FIELDS },
        { status: 400 },
      );

    const passwordValidator = PasswordValidator(newPassword);
    if (passwordValidator.error)
      return NextResponse.json(
        { ok: false, error: passwordValidator.error },
        { status: 422 },
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

    const users = await sql.query(`SELECT password FROM users WHERE id = $1`, [
      payload.userId,
    ]);

    const user = users[0];

    if (!user)
      return NextResponse.json(
        { ok: false, error: ERRORS.USER_NOT_FOUND },
        { status: 404 },
      );

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid)
      return NextResponse.json({
        ok: false,
        error: ERRORS.CURRENT_PASSWORD_INCORRECT,
      });

    const hashPassword = await bcrypt.hash(newPassword, 12);

    await sql.query(`UPDATE users SET password = $1 WHERE id = $2`, [
      hashPassword,
      payload.userId,
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
