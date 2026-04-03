import { NextRequest, NextResponse } from "next/server";
import AuthMiddleware from "./middlewares/auth.middleware";
import RateLimitMiddleware from "./middlewares/rateLimit.middleware";
import GlobalRateLimitMiddleware from "./middlewares/globalRateLimit.middleware";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    const globalRateLimitRes = GlobalRateLimitMiddleware();
    if (globalRateLimitRes) return globalRateLimitRes;

    const rateLimitRes = RateLimitMiddleware(req);
    if (rateLimitRes) return rateLimitRes;
  }

  if (pathname.startsWith("/profile") || pathname.startsWith("/auth")) {
    const authRes = AuthMiddleware(req);
    if (authRes) return authRes;
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
