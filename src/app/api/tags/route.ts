import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { dir, limit } = Object.fromEntries(searchParams.entries());
    const directions = ["ASC", "DESC"];

    if (!directions.includes(dir)) {
      throw new Error("Nice try, Hacker.");
    }

    const rawSQL = `SELECT * FROM tags ORDER BY created_at ${dir} LIMIT $1`;
    const tags = await sql.query(rawSQL, [Number(limit) || 10]);

    return NextResponse.json({ ok: true, tags }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong." },
      { status: 500 },
    );
  }
}
