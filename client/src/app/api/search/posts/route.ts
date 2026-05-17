import {
  searchIndexCache,
  setSearchIndexCache,
} from "@/cache/searchIndex.cache";
import { ERRORS } from "@/constants/error-handling";
import { sql } from "@/lib/db";
import client from "@/lib/redis/client";
import { SearchIndexRefsType } from "@/types/neon";
import { RedisSearchIndexKeyword } from "@/types/redis";
import { indexSearchWordNormalize } from "@/utils/functions/indexSearchWordNormalize";
import { getScore } from "@/utils/getScore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const { limit, query, offset } = Object.fromEntries(searchParams.entries());

    if (!query || !query.trim())
      return NextResponse.json(
        { ok: false, error: ERRORS.GENERIC_ERROR },
        { status: 400 },
      );

    const parsedOffset = Number(offset) ?? 0;
    const parsedLimit = Number(limit) || 20;

    const normalizedQuery = indexSearchWordNormalize(query);
    const words = normalizedQuery.split(" ");

    const cachedRefs: RedisSearchIndexKeyword[] = [];

    for (const word of words) {
      if (!searchIndexCache) break;
      if (searchIndexCache.has(word)) {
        const index = searchIndexCache.get(word)!;
        cachedRefs.push(index);
      }
    }

    const cachedWords = new Set(cachedRefs.map((c) => c.word));

    let checkWords = words.filter((word) => !cachedWords.has(word));
    const keys = checkWords.map((w) => `search:index:${w}`);

    const redisCachedRefs = keys.length > 0 ? await client.mGet(keys) : [];

    for (const cachedRef of redisCachedRefs) {
      let parsed: null | RedisSearchIndexKeyword = null;
      if (typeof cachedRef === "string") {
        try {
          parsed = JSON.parse(cachedRef) as RedisSearchIndexKeyword;
        } catch {
          parsed = null;
        }
      } else if (cachedRef !== null) {
        parsed = cachedRef;
      }

      if (!parsed) continue;

      cachedRefs.push(parsed);
      checkWords = checkWords.filter((word) => word !== parsed.word);
    }

    let refs;

    if (checkWords.length > 0) {
      refs = await sql.query(
        `SELECT word, refs FROM search_index WHERE word = ANY($1)`,
        [checkWords],
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

    const cacheRefsValues: [string, RedisSearchIndexKeyword][] = [];

    for (const ref of cachedRefs) {
      cacheRefsValues.push([ref.word, ref]);
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
    if (searchIndexCache === null) {
      setSearchIndexCache(new Map());
    }

    cacheRefsValues.forEach(([key, value]) => {
      searchIndexCache!.set(key, value);
    });

    const postScores = new Map<number, number>();
    
    if (searchIndexCache) {
      for (const word of words) {
        const cachedIndex = searchIndexCache.get(word);

        if (!cachedIndex) continue;
        
        for (const [postId, post] of Object.entries(cachedIndex.refs)) {
          const id = Number(postId);

          const oldScore = postScores.get(id) ?? 0;
          const score = getScore(post);

          postScores.set(id, oldScore + score);
        }
      }
    }

    const sorted = [...postScores].sort((a, b) => b[1] - a[1]);

    const postIds = sorted.slice(parsedOffset, parsedLimit + parsedOffset);

    const posts = await sql.query(
      `SELECT * FROM posts WHERE id = ANY($1) LIMIT $2`,
      [postIds.map((post) => post[0]), parsedLimit],
    );
    
    const hasMore = !(postIds.length < parsedLimit)

    return NextResponse.json({ ok: true, posts, hasMore }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, message: "" }, { status: 500 });
  }
}
