import { ERRORS } from "@/constants/error-handling";
import { NextRequest, NextResponse } from "next/server";
import { RateLimitRules } from "./rules/ratelimit.rule";

const ipRequestMap = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 60 * 1000;

const getRule = (path: string) => {
  return RateLimitRules.find((r) => r.match.test(path));
};

export default function RateLimitMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const rule = getRule(path) ?? { match: /.*/, limit: 5 };

  if (!rule)
    return NextResponse.json(
      { ok: false, error: ERRORS.GENERIC_ERROR },
      { status: 400 },
    );

  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    // @ts-ignore -- its okay
    (typeof req.ip === "string" ? req.ip : "") ||
    "unknown";
  const key = `${ip}:${rule.match}`;

  if (!ipRequestMap.has(key)) {
    ipRequestMap.set(key, []);
  }

  const currentTime = Date.now();

  const timestamps = ipRequestMap
    .get(key)!
    .filter((ts) => currentTime - ts < RATE_LIMIT_WINDOW);

  if (timestamps.length > rule.limit) {
    return NextResponse.json(
      { error: ERRORS.TOO_MANY_REQUESTS },
      { status: 429 },
    );
  }

  timestamps.push(currentTime);
  ipRequestMap.set(key, timestamps);
}
