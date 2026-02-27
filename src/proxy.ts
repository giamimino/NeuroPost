import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const start = Date.now();
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.REFRESH_COOKIE_NAME!)?.value;
  const pathname = req.nextUrl.pathname;

  if (!token && pathname.startsWith("/profile")) {
    console.log("No token, redirect to login");
    console.log(`/middleware 200 ${Date.now() - start}ms`);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token && pathname.startsWith("/auth")) {
    console.log("Already logged in, redirect to home");
    console.log(`/middleware 200 ${Date.now() - start}ms`);
    return NextResponse.redirect(new URL("/", req.url));
  }

  console.log(`/middleware 200 ${Date.now() - start}ms`);
  return NextResponse.next();
}
export const config = {
  matcher: ["/profile/:path*", "/auth/:path*"],
};
