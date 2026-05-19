
export interface SearchIndexRefType {
  title?: boolean,
  description?: boolean
}

export type SearchIndexWordType = Record<string, SearchIndexRefType>
export type SearchIndexWordMapType = Map<string, SearchIndexRefType>

export interface SearchIndexWorkerPostType {
  id: number,
  title: string,
  description: string,
}