import { NextResponse } from "next/server";
import {
  createVerificationToken,
  isValidEmail,
  normalizeEmail,
} from "@/lib/email-verification-store";
import {
  buildVerificationUrl,
  sendVerificationEmail,
} from "@/lib/send-verification-email";

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
    const { token } = createVerificationToken(normalized);
    const verifyUrl = buildVerificationUrl(token);
    const mailResult = await sendVerificationEmail(normalized, verifyUrl);

    return NextResponse.json({
      ok: true,
      email: normalized,
      message: mailResult.sent
        ? `A verification link has been sent to ${normalized}. Check your inbox and spam folder.`
        : mailResult.error ??
          `Resend is not configured. Use the verification link below to continue.`,
      sent: mailResult.sent,
      devLink: mailResult.devLink,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not send verification email. Please try again." },
      { status: 500 }
    );
  }
}
