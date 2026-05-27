import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const isLoggedIn = Boolean(session);
  const isCoordinator = session?.role === "Coordinator";

  if (pathname.startsWith("/coordinator")) {
    if (!isLoggedIn || !isCoordinator) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && isCoordinator) {
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target =
      redirect?.startsWith("/coordinator") && !redirect.includes("//")
        ? redirect
        : "/coordinator";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coordinator/:path*", "/login"],
};
