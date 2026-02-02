import client from "@/lib/client";
import { sql } from "@/lib/db";
import { Index } from "@/types/neon";
import { NormalizedIndex } from "@/types/search";
import { BuildIndex } from "@/utils/buildIndex";
import { NextResponse } from "next/server";

let cache: NormalizedIndex[] | null = null;

export async function GET() {
  try {
    if (cache)
      return NextResponse.json({ ok: true, cached: true, indexes: cache, ramCache: true });
    const cached = await client.get("search:index");

    if (cached) {
      cache = JSON.parse(cached);
      return NextResponse.json(
        { ok: true, cached: true, indexes: JSON.parse(cached), ramCache: false },
        { status: 200 },
      );
    }

    const data = (await sql`SELECT * FROM search_index`) as Index[];
    const index = BuildIndex(data);
    await client.set("search:index", JSON.stringify(index), {
      expiration: { type: "EX", value: 60 * 20 },
    });
    cache = index

    return NextResponse.json(
      { ok: true, indexes: index, cached: false, ramCache: false },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
