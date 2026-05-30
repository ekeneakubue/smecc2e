import { NextResponse } from "next/server";
import {
  APPLICANT_SESSION_COOKIE,
  clearApplicantSessionCookieOptions,
} from "@/lib/applicant-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const opts = clearApplicantSessionCookieOptions();
  response.cookies.set(APPLICANT_SESSION_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return response;
}
