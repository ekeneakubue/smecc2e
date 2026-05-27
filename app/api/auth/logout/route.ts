import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  clearAuthSessionCookieOptions,
} from "@/lib/auth-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const opts = clearAuthSessionCookieOptions();
  response.cookies.set(AUTH_SESSION_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}
