import { ApiConfig } from "@/configs/api-configs";
import { redirect } from "next/navigation";

export async function apiFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if(res.status === 423) {
    redirect("/verify")
  } 

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh/token", {
      ...ApiConfig.post,
      credentials: "include",
    });

    if (!refreshRes.ok) {
      window.location.href = "/auth/login";
      return;
    }

    res = await fetch(url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}
