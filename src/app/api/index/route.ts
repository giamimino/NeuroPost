import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const indexes = await sql`SELECT * FROM search_index`

    return NextResponse.json({ ok: true, indexes }, {status: 200})
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 })
  }
}