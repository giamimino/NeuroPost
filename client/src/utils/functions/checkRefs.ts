export function checkSearchIndexRefs(
  initialValue: string[],
  keys: string[],
  redisCache: (string | null)[],
) {
  const result = [];
  for (let i = 0; i < keys.length; i++) {
    if (redisCache[i] === null) {
      result.push(initialValue[i]);
    }
  }

  return result;
}
