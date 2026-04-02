import { NextRequest, NextResponse } from "next/server";
import AuthMiddleware from "./middlewares/auth.middleware";
import { ERRORS } from "./constants/error-handling";

const ipRequestMap = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQ = 5;

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      // @ts-ignore
      (typeof req.ip === "string" ? req.ip : "") ||
      "unknown";

    if (!ipRequestMap.has(ip)) {
      ipRequestMap.set(ip, []);
    }

    const currentTime = Date.now();

    const timestamps = ipRequestMap
      .get(ip)!
      .filter((ts) => currentTime - ts < RATE_LIMIT_WINDOW);

    if (timestamps.length >= MAX_REQ) {
      return NextResponse.json(
        { error: ERRORS.TOO_MANY_REQUESTS },
        { status: 429 },
      );
    }

    timestamps.push(currentTime);
    ipRequestMap.set(ip, timestamps);
  }

  if (pathname.startsWith("/profile") && pathname.startsWith("/auth")) {
    const authRes = AuthMiddleware(req);
    return authRes;
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
