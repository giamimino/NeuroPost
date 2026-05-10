import { indexSearchWordNormalize } from "./functions/indexSearchWordNormalize";

export default function indexPost(post: {
  id: number;
  title: string;
  description: string;
}) {
  const fields = ["title", "description"] as const;

  const indexedWords = new Map<
    string,
    { title?: boolean; description?: boolean }
  >();

  for (const field of fields) {
    const normalizedWords = indexSearchWordNormalize(post[field]).split(" ");

    for (const word of normalizedWords) {
      indexedWords.set(word, { ...indexedWords.get(word), [field]: true });
    }
  }

  return indexedWords
}
