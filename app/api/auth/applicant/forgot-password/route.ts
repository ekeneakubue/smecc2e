import { NextResponse } from "next/server";
import { getApplicantAccount } from "@/lib/applicant-account-service";
import { createPasswordResetToken } from "@/lib/applicant-password-reset-store";
import { isValidEmail, normalizeEmail } from "@/lib/email-normalize";
import {
  buildPasswordResetUrl,
  sendPasswordResetEmail,
} from "@/lib/send-password-reset-email";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

const GENERIC_SUCCESS =
  "If an account exists for that email, we sent password reset instructions. Check your inbox and spam folder.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalized = normalizeEmail(email);
    const account = await getApplicantAccount(normalized);

    if (account) {
      const { token } = await createPasswordResetToken(normalized);
      const resetUrl = buildPasswordResetUrl(token);
      const mailResult = await sendPasswordResetEmail(normalized, resetUrl);

      return NextResponse.json({
        ok: true,
        message: mailResult.sent
          ? GENERIC_SUCCESS
          : mailResult.error ??
            "Resend is not configured. Use the reset link below to continue.",
        sent: mailResult.sent,
        devLink: mailResult.devLink,
      });
    }

    return NextResponse.json({
      ok: true,
      message: GENERIC_SUCCESS,
      sent: true,
    });
  } catch (err) {
    console.error("POST /api/auth/applicant/forgot-password", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Could not process your request.";
    const isMissingTable =
      message.includes("applicant_password_reset_tokens") ||
      message.includes("applicantPasswordResetToken") ||
      message.includes("does not exist");
    const isMissingClient =
      message.includes("Cannot read properties of undefined") ||
      message.includes("is not a function");
    if (isMissingTable) {
      return NextResponse.json(
        {
          error:
            "Password reset is not initialized. Run: npx prisma db push (or migrate deploy), then restart the dev server.",
        },
        { status: 503 }
      );
    }
    if (isMissingClient) {
      return NextResponse.json(
        {
          error:
            "Password reset is not initialized. Run: npx prisma generate (restart the dev server first).",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Could not process your request. Please try again." },
      { status: 500 }
    );
  }
}
