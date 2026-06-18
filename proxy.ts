import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/auth";

const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "production"
    ? [process.env.NEXT_PUBLIC_APP_URL ?? ""].filter(Boolean)
    : ["http://localhost:3000"];

function withCors(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
  return response;
}

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isProtectedAdminPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") &&
    !PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set("Access-Control-Max-Age", "86400");
    return withCors(res, origin);
  }
  
  if (isProtectedAdminPath(pathname)) {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

    // No cookie at all → redirect to login
    if (!cookieValue) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const sessionId = verifySessionCookie(cookieValue);
    if (!sessionId) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE);
      return response;
    }

    return withCors(NextResponse.next(), origin);
  }

  if (pathname.startsWith("/admin/login")) {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;
    if (cookieValue && verifySessionCookie(cookieValue)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return withCors(NextResponse.next(), origin);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
};