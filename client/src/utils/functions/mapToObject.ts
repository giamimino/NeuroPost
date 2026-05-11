

export default function MapToObject(map: Map<any, any>): any {
  return Object.fromEntries(
    Array.from(map, ([key, value]) => [
      key,
      value instanceof Map ? MapToObject(value) : value,
    ]),
  );
}
