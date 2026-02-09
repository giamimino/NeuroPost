
export const ApiConfig: Record<string, RequestInit & { enabled?: boolean}> = {
  get: {
    method: "GET"
  },
  post: {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  },
  delete: {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  },
  dataFetcher: {
    cache: "no-store",
    method: "GET",
    enabled: true
  }
}