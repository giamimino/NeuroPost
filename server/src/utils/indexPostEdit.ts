import { indexSearchWordNormalize } from "./indexSearchWordNormalize.js";
import MapToObject from "./mapToObject.js";
import { sql } from "../lib/db.js";
import {
  SearchIndexRefType,
  SearchIndexWorkerPostType,
} from "../types/worker.js";
import SearchIndexEditCheckWord from "./validation/checkWord.validation.js";

export default async function indexPostEdit(post: SearchIndexWorkerPostType) {
  console.time("total");

  try {
    const fields = ["title", "description"] as const;

    const indexedWords = new Map<string, Map<number, SearchIndexRefType>>();

    for (const field of fields) {
      const normalizedWords = indexSearchWordNormalize(post[field]).split(" ");

      for (const word of normalizedWords) {
        indexedWords.set(word, new Map());

        const next = new Map(indexedWords.get(word));

        next.set(post.id, { [field]: true });

        indexedWords.set(word, next);
      }
    }

    const params = Array.from(indexedWords.keys());

    const existingWords = await sql.query(
      `SELECT refs, word FROM search_index WHERE word = ANY($1)`,
      [params],
    );

    const checkWords = new Map<string, SearchIndexRefType>();

    for (const word of existingWords) {
      let refs = word.refs;

      if (typeof refs === "string") {
        refs = JSON.parse(refs);
      }

      const ref = refs[post.id];
      const index = indexedWords.get(word.word)
      
      if(!index || !ref) continue
      
      const indexedRef = index.get(post.id)

      if(!indexedRef) continue

      const check = SearchIndexEditCheckWord(indexedRef, ref)

      checkWords.set(word.word, check)
    }

    const placeholder = Array.from(indexedWords.entries())
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}::jsonb)`)
      .join(", ");
    const insertParams: string[] = [];

    for (const [indexKey, index] of indexedWords) {
      if (index) {
        insertParams.push(indexKey);

        const value = JSON.stringify(MapToObject(index));
        insertParams.push(value);
      }
    }

    const rawSql = `
      INSERT INTO search_index (word, refs) 
      VALUES ${placeholder}
      ON CONFLICT (word)
      DO UPDATE SET refs = EXCLUDED.refs
    `;

    await sql.query(rawSql, insertParams);

    return { ok: true };
  } catch (err) {
    console.log(err);
    console.timeEnd("total");
  }
}
