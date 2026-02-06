
export const ApiConfig: Record<string, RequestInit> = {
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
  }
}