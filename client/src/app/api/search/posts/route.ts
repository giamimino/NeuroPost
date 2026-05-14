import { searchIndexCache, setSearchIndexCache } from "@/cache/searchIndex.cache";
import { ERRORS } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import client from "@/lib/redis/client";
import { SearchIndexRefsType, SearchIndexRefType } from "@/types/neon";
import { RedisSearchIndexKeyword } from "@/types/redis";
import { checkSearchIndexRefs } from "@/utils/functions/checkRefs";
import { indexSearchWordNormalize } from "@/utils/functions/indexSearchWordNormalize";
import { MailOpen } from "lucide-react";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ query: string }> },
) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, query } = Object.fromEntries(searchParams.entries());

    if (!query || !query.trim())
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const normalizedQuery = indexSearchWordNormalize(query);
    const words = normalizedQuery.split(" ");

    const keys = words.map((w) => `search:index:${w}`);
    const cachedRefs = await client.mGet(keys);

    const checkRefs = checkSearchIndexRefs(words, keys, cachedRefs);

    let refs;

    if (checkRefs.length > 0) {
      refs = await sql.query(
        `SELECT word, refs FROM search_index WHERE word = ANY($1)`,
        [checkRefs],
      );

      const mutli = client.multi();

      for (const ref of refs) {
        mutli.set(
          `search:index:${ref.word}`,
          JSON.stringify({ ...ref, cachedAt: Date.now() }),
          {
            expiration: { type: "EX", value: 3600 },
          },
        );
      }

      await mutli.exec();
    }

    const cachedRefsFilter = cachedRefs.filter((i) => i !== null);

    const cacheRefsValues = [];

    for (const ref of cachedRefsFilter) {
      let parsed: RedisSearchIndexKeyword;

      try {
        parsed = JSON.parse(ref);
      } catch {
        continue;
      }

      cacheRefsValues.push([parsed.word, parsed as RedisSearchIndexKeyword]);
    }

    if (typeof refs !== "undefined") {
      for (const ref of refs) {
        let parsed = ref.refs;
        if (typeof ref.refs === "string") {
          try {
            parsed = JSON.parse(parsed) as SearchIndexRefsType;
          } catch {
            continue;
          }
        }

        cacheRefsValues.push([
          ref.word,
          {
            word: ref.word,
            refs: parsed,
            cachedAt: Date.now(),
          } as RedisSearchIndexKeyword,
        ]);
      }
    }
    if(searchIndexCache === null) {
      setSearchIndexCache(new Map())
    }

    cacheRefsValues.forEach(([key, value]) => {
      searchIndexCache!.set(key, value);
    });

    const postIds = []
    if(searchIndexCache) {
      for(const [indexKey, index] of searchIndexCache) {
        if(words.includes(indexKey)) {
          if(!index) continue
  
          for(const ref in index?.refs) {
            postIds.push(Number(ref))
          }
        }
      }

    }
    
    const posts = await sql.query(
      `SELECT * FROM posts WHERE id = ANY($1)`,
      [postIds]
    )

    return NextResponse.json({ ok: true, posts }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
