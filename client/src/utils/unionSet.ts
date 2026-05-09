

export function unionSets<T>(a: Set<T>, b: Iterable<T>) {
  return new Set<T>([...a, ...b])
}