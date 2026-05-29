import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  refreshedAuthSessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth-session";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const opts = await refreshedAuthSessionCookieOptions(session);
  response.cookies.set(AUTH_SESSION_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return response;
}
