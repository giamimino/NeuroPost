import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();

    const rawSql = `SELECT name, id, bio, username FROM users WHERE name LIKE '${String(query).toLowerCase()}%'`;
    const users = await sql.query(rawSql);

    return NextResponse.json({ ok: true, users }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
