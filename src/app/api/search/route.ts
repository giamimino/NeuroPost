import { GENERIC_ERROR } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import { getScore } from "@/utils/getScore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query }: { query: string } = await req.json();
    const url = new URL(req.url);
    const indexFetch = await fetch(`${url.origin}/api/index`);
    const indexData = await indexFetch.json();
    if (!indexFetch.ok)
      return NextResponse.json(
        { ok: false, message: GENERIC_ERROR },
        { status: 400 },
      );

    const index = Object.assign({}, ...indexData.indexes);
    const queryWords = query.toLowerCase().replace(/[.,]/g, "").split(/\s+/);
    const postScores: Record<string, number> = {};

    for (const word of queryWords) {
      if (!index[word]) continue;
      for (const postId of Object.keys(index[word])) {
        const id = Number(postId);
        if (!postScores[id]) postScores[id] = 0;
        postScores[id] = getScore(id, index[word]);
      }
    }

    const result = postScores;

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { ids } = Object.fromEntries(searchParams.entries());

    const arrIds = ids
      ? ids.split(",").map(Number).filter(Number.isInteger)
      : [];

    const rawSql = `SELECT * FROM posts WHERE id IN (${arrIds})`;
    const posts = await sql.query(rawSql);

    return NextResponse.json({ success: true, posts }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}