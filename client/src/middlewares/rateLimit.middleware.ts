import { ERRORS } from "@/constants/error-handling";
import { NextRequest, NextResponse } from "next/server";

const ipRequestMap = new Map<string, number[]>();

const rules = [
  { match: /^\/api\/auth/, limit: 3 },
  { match: /^\/api\/follow/, limit: 3 },
  { match: /^\/api\/friend-request/, limit: 10 },
  { match: /^\/api\/pending-friends/, limit: 10 },
  { match: /^\/api\/friends/, limit: 7 },
  { match: /^\/api\/index/, limit: 30 },
  { match: /^\/api\/notifications/, limit: 30 },
  { match: /^\/api\/post/, limit: 10 },
  { match: /^\/api\/r2/, limit: 20 },
  { match: /^\/api\/redis/, limit: 5 },
  { match: /^\/api\/redis/, limit: 5 },
  { match: /^\/api\/search/, limit: 13 },
  { match: /^\/api\/send/, limit: 2 },
  { match: /^\/api\/tags/, limit: 10 },
  { match: /^\/api\/user/, limit: 7 },
];

const RATE_LIMIT_WINDOW = 60 * 1000;

const getRule = (path: string) => {
  return rules.find((r) => r.match.test(path));
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
    // @ts-ignore
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
