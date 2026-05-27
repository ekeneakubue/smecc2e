import { NextResponse } from "next/server";
import {
  isEmailVerified,
  isValidEmail,
  normalizeEmail,
} from "@/lib/email-verification-store";
import { getVerifiedEmailFromCookie } from "@/lib/verification-session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ verified: false });
  }

  const normalized = normalizeEmail(email);
  const cookieEmail = await getVerifiedEmailFromCookie();
  const verified =
    (await isEmailVerified(normalized)) || cookieEmail === normalized;

  return NextResponse.json({ verified, email: normalized });
}
