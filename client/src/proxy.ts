import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshCookieName = process.env.REFRESH_COOKIE_NAME;
  if (!refreshCookieName) {
    throw new Error("REFRESH_COOKIE_NAME is not set in production!");
  }
  const token = cookieStore.get(refreshCookieName)?.value;
  const pathname = req.nextUrl.pathname;

  if (!token && pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/auth/register", req.url));
  }

  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/profile/:path*", "/auth/:path*"],
};
