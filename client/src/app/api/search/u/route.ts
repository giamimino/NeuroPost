import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();

    if(!query.trim()) {
      return NextResponse.json({ ok: true, users: []}, { status: 200 })
    }

    const search = `%${String(query).toLowerCase()}%`

    const users = await sql`
      SELECT name, id, bio, username 
      FROM users 
      WHERE name LIKE ${search}
        OR username LIKE ${search}
      LIMIT 20
    `;

    return NextResponse.json({ ok: true, users }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
