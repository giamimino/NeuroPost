import { indexSearchWordNormalize } from "./indexSearchWordNormalize.js";
import MapToObject from "./mapToObject.js";
import { sql } from "../lib/db.js";
import {
  SearchIndexRefType,
  SearchIndexWordMapType,
  SearchIndexWordType,
  SearchIndexWorkerPostType,
} from "../types/worker.js";
import SearchIndexEditCheckWord from "./validation/checkWord.validation.js";

export default async function indexPostEdit(
  post: SearchIndexWorkerPostType,
  oldWords: SearchIndexWordType,
) {
  console.time("total");

  try {
    const fields = ["title", "description"] as const;
    const indexedWords: SearchIndexWordMapType = new Map();

    for (const field of fields) {
      const normalizedWords = indexSearchWordNormalize(post[field]).split(" ");

      for (const word of normalizedWords) {
        indexedWords.set(word, {
          ...indexedWords.get(word),
          [field]: true,
        });
      }
    }

    const oldIndexedWords: SearchIndexWordMapType = new Map(
      Object.entries(oldWords),
    );

    const changedWords: SearchIndexWordMapType = new Map();

    for (const [key, value] of indexedWords) {
      const oldWord = oldIndexedWords.get(key);

      if (!oldWord) {
        changedWords.set(key, value);
        continue;
      }

      const check = SearchIndexEditCheckWord(value, oldWord);

      if (check.isChanged) {
        changedWords.set(key, check.word);
      }
    }

    const deletedWords = new Map<string, SearchIndexRefType>();

    for (const [key, value] of oldIndexedWords) {
      if (!indexedWords.has(key)) {
        deletedWords.set(key, {});
        continue;
      }
      const index = indexedWords.get(key);

      if (!index) continue;

      const check = SearchIndexEditCheckWord(value, index);

      if (check.isChanged) {
        deletedWords.set(key, check.word);
      }
    }

    const query = new Set<string>();

    for (const key of [...changedWords.keys(), ...deletedWords.keys()]) {
      query.add(key);
    }

    const refs = (await sql.query(
      `SELECT refs, word FROM search_index WHERE word = ANY($1)`,
      [[...query]],
    )) as { refs: Record<number, SearchIndexRefType>; word: string }[];

    const updatedRefs = new Map<string, Map<string, SearchIndexRefType>>();

    for (const ref of refs) {
      if (changedWords.has(ref.word)) {
        const word = changedWords.get(ref.word);

        if (!word) continue;

        const updated = { ...ref.refs, [post.id]: word };
        const next = new Map(Object.entries(updated));

        updatedRefs.set(ref.word, next);
      } else if (deletedWords.has(ref.word)) {
        const word = deletedWords.get(ref.word);

        if (!word) continue;
        const updated = { ...ref.refs };

        if (!word.title && !word.description) {
          delete updated[post.id];
        } else {
          updated[post.id] = word;
        }

        const next = new Map(Object.entries(updated));

        updatedRefs.set(ref.word, next);
      }
    }

    for(const [word, ref] of changedWords) {
      if(!updatedRefs.has(word)) {
        updatedRefs.set(
          word,
          new Map([[String(post.id), ref]])
        )
      } 
    }

    const placeholder = Array.from(updatedRefs.entries())
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}::jsonb)`)
      .join(", ");
    const insertParams: string[] = [];

    for (const [indexKey, index] of updatedRefs) {
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
  } finally {
    console.timeEnd("total");
  }
}
