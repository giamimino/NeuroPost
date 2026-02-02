import { ApiConfig } from "@/configs/api-configs"

const matchStatus = [401, 400, 500]

export async function apiFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include"
  })

  if(matchStatus.some((status) => status === res.status)) {
    const refreshRes = await fetch("/api/auth/refresh/token", {...ApiConfig.post, credentials: "include"})

    if(!refreshRes.ok) {
      window.location.href = "/auth/login"
      return
    }

    res = await fetch(url, {
      ...options,
      credentials: "include"
    })
  }

  return res
}