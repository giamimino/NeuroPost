import { ERRORS } from "@/constants/error-handling";
import client from "@/lib/client";
import { NextResponse } from "next/server";

const REQUESTS_REDIS_KEY = `GLOBAL_MAX_RATE_LIMIT`;

const GLOBAL_MAX_RATE = 1000;
const RATE_LIMIT_WINDOW = 60;

export default async function GlobalRateLimitMiddleware() {
  const requests = await client.get(REQUESTS_REDIS_KEY)
  if(!requests) {
    await client.set(REQUESTS_REDIS_KEY, 0, { expiration: { type: "EX", value: RATE_LIMIT_WINDOW} })
  }
  const globalRequests = Number(requests) || 0

  if (Number(globalRequests) > GLOBAL_MAX_RATE)
    return NextResponse.json(
      { ok: false, error: ERRORS.RATE_LIMITED },
      { status: 429 },
    );

  await client.set(REQUESTS_REDIS_KEY, Number(globalRequests) + 1, { expiration: { type: "KEEPTTL"}});
}
