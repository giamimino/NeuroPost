import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const { limit } = Object.fromEntries(searchParams.entries());

    const rawSql = `SELECT p.id, p.title, p.description, p.created_at, json_build_object('fileurl', m.fileurl, 'type', m.type, 'thumb_url', m.thumb_url) AS media FROM posts p JOIN media m ON m.post_id = p.id WHERE author_id = $1 LIMIT $2`;
    const posts = await sql.query(rawSql, [id, Number(limit) || 18]);

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
