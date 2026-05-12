import { indexSearchWordNormalize } from "./indexSearchWordNormalize.js";
import MapToObject from "./mapToObject.js";
import { sql } from "../lib/db.js";

export default async function indexPost(post: {
  id: number;
  title: string;
  description: string;
}) {
  const start = new Date();
  try {
    const fields = ["title", "description"] as const;

    const indexedWords = new Map<
      string,
      Map<number, { title?: boolean; description?: boolean }>
    >();

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

    for (const existing of existingWords) {
      if (!existing) continue;

      const next = new Map(indexedWords.get(existing.word));

      if (next) {
        let refs = existing.refs;

        if (typeof refs === "string") {
          try {
            refs = JSON.parse(refs);
          } catch {
            refs = {};
          }
        }

        for (const ref in refs) {
          next.set(Number(ref), refs[ref]);
        }
      }

      indexedWords.set(existing.word, next);
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

    console.log(`${Date.now() - start.getTime()}ms`);

    return { ok: true }
  } catch (err) {
    console.log(err);
    console.log(`${Date.now() - start.getTime()}ms`);
  }
}
