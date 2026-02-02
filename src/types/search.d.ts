export type NormalizedIndex = Record<
  string,
  Record<
    string,
    {
      title?: boolean;
      description?: boolean;
    }[]
  >
>;
