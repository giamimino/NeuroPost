

// search index

import { SearchIndexRefsType, SearchIndexType } from "./neon";

export interface RedisSearchIndexKeyword extends SearchIndexType {
  cachedAt: number,
}
