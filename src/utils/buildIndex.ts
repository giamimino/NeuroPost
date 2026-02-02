import { Index } from "@/types/neon";
import { NormalizedIndex } from "@/types/search";

function BuildIndex(index: Index[]) {
  let result = [];

  for (const idx of index) {
    result.push(idx.index);
  }

  return result as NormalizedIndex[];
}

export { BuildIndex };
