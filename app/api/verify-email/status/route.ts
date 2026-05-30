import { NextResponse } from "next/server";
import {
  isEmailVerified,
  isValidEmail,
  normalizeEmail,
} from "@/lib/email-verification-store";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { getVerifiedEmailFromCookie } from "@/lib/verification-session";

export async function GET(request: Request) {
  try {
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
  } catch (err) {
    console.error("GET /api/verify-email/status", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Could not check verification status." },
      { status: 500 }
    );
  }
}
