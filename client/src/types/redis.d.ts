

// search index

import { SearchIndexType } from "./neon";

export interface RedisSearchIndexKeyword extends SearchIndexType {
  cachedAt: number,
}
