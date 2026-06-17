import { NextRequest, NextResponse } from "next/server";
import { decodeJwt, isTokenExpired, isAdminRole, getRoleFromPayload } from "@/lib/auth/session";

const COOKIE_NAME = "zogreo_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? decodeJwt(token) : null;
  const isAuthenticated = payload !== null && !isTokenExpired(payload);
  const role = payload ? getRoleFromPayload(payload) : null;

  // Guard (portal) — must be authenticated
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/offer") ||
    pathname.startsWith("/profile")
  ) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Admin users shouldn't be in the portal
    if (role && isAdminRole(role)) {
      return NextResponse.redirect(new URL("/admin/applications", req.url));
    }
  }

  // Guard (admin) — must be authenticated + staff role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!role || !isAdminRole(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (isAuthenticated && role) {
      const dest = isAdminRole(role) ? "/admin/applications" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/apply/:path*",
    "/documents/:path*",
    "/payments/:path*",
    "/offer/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
