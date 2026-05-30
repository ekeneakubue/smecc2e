import { NextResponse } from "next/server";
import { resetApplicantPassword } from "@/lib/applicant-account-service";
import { applicantPasswordChangedLoginPath } from "@/lib/applicant-login-paths";
import { consumePasswordResetToken } from "@/lib/applicant-password-reset-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    const token = body.token?.trim() ?? "";
    const newPassword = body.newPassword?.trim() ?? "";
    const confirmPassword = body.confirmPassword?.trim() ?? "";

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }
    if (!newPassword) {
      return NextResponse.json(
        { error: "Enter a new password." },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const consumed = await consumePasswordResetToken(token);
    if ("error" in consumed) {
      return NextResponse.json(
        { error: consumed.error, code: consumed.code },
        { status: 400 }
      );
    }

    await resetApplicantPassword(consumed.email, newPassword);

    return NextResponse.json({
      ok: true,
      redirectTo: applicantPasswordChangedLoginPath(consumed.email),
      message: "Your password has been updated. Sign in with your new password.",
    });
  } catch (err) {
    console.error("POST /api/auth/applicant/reset-password", err);
    const message =
      err instanceof Error ? err.message : "Could not reset password.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
