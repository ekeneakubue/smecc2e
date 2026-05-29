import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";
import {
  DASHBOARD_PORTALS,
  isDashboardPath,
  portalForRole,
  portalKeyFromPath,
  safeDashboardRedirect,
} from "@/lib/dashboard-portal";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const isLoggedIn = Boolean(session);

  if (isDashboardPath(pathname)) {
    const portalKey = portalKeyFromPath(pathname);
    if (!portalKey) {
      return NextResponse.next();
    }

    const portal = DASHBOARD_PORTALS[portalKey];
    const roleAllowed =
      isLoggedIn &&
      session?.role &&
      portal.allowedRoles.includes(session.role);

    if (!roleAllowed) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname === "/login" && isLoggedIn && session?.role) {
    const portalKey = portalForRole(session.role);
    if (portalKey) {
      const redirect = request.nextUrl.searchParams.get("redirect");
      const fallback = DASHBOARD_PORTALS[portalKey].basePath;
      const target = safeDashboardRedirect(redirect, fallback);
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coordinator/:path*", "/administrator/:path*", "/login"],
};
