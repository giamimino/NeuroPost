import { SearchIndexRefsType } from "@/types/neon";
import { RedisSearchIndexKeyword } from "@/types/redis";

type searchIndex = Map<string, RedisSearchIndexKeyword>;

export let searchIndexCache: searchIndex | null = null;

export const setSearchIndexCache = (cache: searchIndex) => {
  searchIndexCache = cache
}