import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url)
    const { limit } = Object.fromEntries(searchParams.entries())

    const rawSql = `SELECT id, title, description, image, created_at FROM posts WHERE author_id = $1 LIMIT $2`;
    const posts = await sql.query(rawSql, [id, Number(limit) || 18]);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
