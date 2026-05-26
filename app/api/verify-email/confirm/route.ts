import { NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/email-verification-store";
import {
  VERIFIED_EMAIL_COOKIE,
  verifiedEmailCookieOptions,
} from "@/lib/verification-session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token." },
      { status: 400 }
    );
  }

  const result = consumeVerificationToken(token);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    email: result.email,
    redirectTo: "/application?page=2&verified=1",
  });

  const opts = verifiedEmailCookieOptions(result.email);
  response.cookies.set(VERIFIED_EMAIL_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return response;
}
