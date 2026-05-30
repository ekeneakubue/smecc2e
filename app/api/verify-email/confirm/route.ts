import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/email-verification-store";
import {
  APPLICANT_SESSION_COOKIE,
  clearApplicantSessionCookieOptions,
} from "@/lib/applicant-session";
import {
  VERIFIED_EMAIL_COOKIE,
  VERIFY_TEMP_PASSWORD_COOKIE,
  verifiedEmailCookieOptions,
} from "@/lib/verification-session";

function verificationSuccessUrl(request: Request, email: string): URL {
  const url = new URL("/application/verify/success", request.url);
  url.searchParams.set("email", email);
  return url;
}

function wantsJsonResponse(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("format") === "json") return true;

  const secFetchMode = request.headers.get("sec-fetch-mode");
  if (secFetchMode === "cors") return true;

  const accept = request.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");
  const wantsJson = accept.includes("application/json");

  return wantsJson && !wantsHtml;
}

function applyVerificationCookies(
  response: NextResponse,
  email: string,
  tempPassword: string | null
): NextResponse {
  const clearSession = clearApplicantSessionCookieOptions();
  response.cookies.set(APPLICANT_SESSION_COOKIE, clearSession.value, {
    httpOnly: clearSession.httpOnly,
    sameSite: clearSession.sameSite,
    secure: clearSession.secure,
    path: clearSession.path,
    maxAge: clearSession.maxAge,
  });

  const opts = verifiedEmailCookieOptions(email);
  response.cookies.set(VERIFIED_EMAIL_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  if (tempPassword) {
    response.cookies.set(VERIFY_TEMP_PASSWORD_COOKIE, tempPassword, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/application/verify/success",
      maxAge: 60 * 10,
    });
  }

  return response;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const json = wantsJsonResponse(request);

  if (!token) {
    if (json) {
      return NextResponse.json(
        { error: "Missing verification token." },
        { status: 400 }
      );
    }
    return NextResponse.redirect(
      new URL("/applicant/login?error=missing_token", request.url)
    );
  }

  const result = await consumeVerificationToken(token);
  if ("error" in result) {
    if (json) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const loginUrl = new URL("/applicant/login", request.url);
    loginUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(loginUrl);
  }

  const successUrl = verificationSuccessUrl(request, result.email);

  if (json) {
    const response = NextResponse.json({
      ok: true,
      email: result.email,
      tempPassword: result.tempPassword,
      redirectTo: `${successUrl.pathname}${successUrl.search}`,
    });
    return applyVerificationCookies(response, result.email, result.tempPassword);
  }

  const response = NextResponse.redirect(successUrl);
  return applyVerificationCookies(response, result.email, result.tempPassword);
}
