export const ApiConfig = {
  get: {
    method: "GET",
  },
  post: {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  },
  postForm: {
    method: "POST",
  },
  delete: {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  },
  dataFetcher: {
    cache: "no-store",
    method: "GET",
    enabled: true,
  },
  put: {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  },
  purForm: {
    method: "PUT",
  },
};
