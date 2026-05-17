import { SearchIndexRefType } from "@/types/neon";

function getScore(ref: SearchIndexRefType) {
  let score = 0;
  if (ref.title) score += 3;
  if (ref.description) score += 1;
  return score;
}

export { getScore };
