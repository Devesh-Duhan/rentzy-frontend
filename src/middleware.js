import { NextResponse } from "next/server";

// Server-side route protection for the authenticated panels.
// Previously these were client-side useEffect redirects only, which meant the
// dashboard shell HTML was served and rendered before any redirect happened.
//
// This is a UX/bandwidth guard, NOT the security boundary - the backend
// enforces real authorization via JWT + authorizeRole on every API route.

const PROTECTED = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/seller", roles: ["seller", "admin"] },
  { prefix: "/add", roles: ["seller", "admin"] },
  { prefix: "/profile", roles: null },
  { prefix: "/wishlist", roles: null },
  { prefix: "/alerts", roles: null },
  { prefix: "/chat", roles: null },
];

const LOGIN_PAGE = "/login";

const decodeJwt = (token) => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const rule = PROTECTED.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));

  if (!rule) return NextResponse.next();

  // Prefer the current session over a stale legacy cookie left by older mobile sessions.
  const token = request.cookies.get("rentzy_token")?.value || request.cookies.get("token")?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PAGE;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const claims = decodeJwt(token);
  if (!claims) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PAGE;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Expired token - send them back to login rather than into a broken panel
  if (claims.exp && claims.exp * 1000 < Date.now()) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PAGE;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Legacy tokens were issued before the `role` claim existed. We let those
  // through instead of trapping the user in a redirect loop - the backend
  // still authorizes every API call against the database and returns 403.
  if (rule.roles && claims.role && !rule.roles.includes(claims.role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// NOTE: `config.matcher` below must list every prefix used in PROTECTED.
// Next.js only invokes this middleware for matched paths, so an entry added
// to PROTECTED without a matching matcher entry will silently never run.
export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/add/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/alerts/:path*",
    "/chat/:path*",
  ],
};
