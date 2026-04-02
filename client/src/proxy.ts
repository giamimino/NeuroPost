import { NextRequest, NextResponse } from "next/server";
import AuthMiddleware from "./middlewares/auth.middleware";
import RateLimitMiddleware from "./middlewares/rateLimit.middleware";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    const rateLimitRes = RateLimitMiddleware(req)
    return rateLimitRes
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
