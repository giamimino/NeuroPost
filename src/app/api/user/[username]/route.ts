import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const rawSql = `SELECT id, email, name, username, bio  FROM users where username = $1`;
    const user = await sql.query(rawSql, [username]);

    console.log(user, username);
    

    return NextResponse.json({ ok: true, user }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
