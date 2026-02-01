import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const rawSql = `SELECT id, title, description, image, created_at FROM posts WHERE author_id = $1`;
    const posts = await sql.query(rawSql, [id]);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
