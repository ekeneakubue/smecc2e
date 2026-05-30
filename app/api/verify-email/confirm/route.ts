import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/email-verification-store";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  APPLICANT_SESSION_COOKIE,
  clearApplicantSessionCookieOptions,
} from "@/lib/applicant-session";
import {
  VERIFIED_EMAIL_COOKIE,
  verifiedEmailCookieOptions,
} from "@/lib/verification-session";

function loginErrorUrl(
  request: Request,
  code: "verification_failed" | "expired" | "missing_token",
  email?: string
): URL {
  const url = new URL("/applicant/login", request.url);
  url.searchParams.set("error", code);
  if (email) url.searchParams.set("email", email);
  return url;
}

function applyVerificationCookies(
  response: NextResponse,
  email: string
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

  return response;
}

async function handleConfirm(request: Request, token: string | undefined) {
  const trimmed = token?.trim();

  if (!trimmed) {
    return NextResponse.json(
      { error: "Missing verification token.", code: "missing_token" },
      { status: 400 }
    );
  }

  try {
    const result = await consumeVerificationToken(trimmed);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      email: result.email,
      tempPassword: result.tempPassword,
      alreadyVerified: result.alreadyVerified,
    });
    return applyVerificationCookies(response, result.email);
  } catch (err) {
    console.error("POST /api/verify-email/confirm", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error: connectionError ?? "Could not verify email. Please try again.",
        code: "verification_failed",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  return handleConfirm(request, searchParams.get("token") ?? undefined);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const json = searchParams.get("format") === "json";

  if (!token) {
    if (json) {
      return NextResponse.json(
        { error: "Missing verification token.", code: "missing_token" },
        { status: 400 }
      );
    }
    return NextResponse.redirect(loginErrorUrl(request, "missing_token"));
  }

  if (json) {
    return handleConfirm(request, token);
  }

  const verifyPage = new URL("/application/verify", request.url);
  verifyPage.searchParams.set("token", token);
  return NextResponse.redirect(verifyPage);
}
