import {
  emailButton,
  emailLayout,
  escapeHtml,
} from "./email-layout";
import { getAppBaseUrl } from "./send-verification-email";
import {
  getEmailFrom,
  getResendClient,
  type SendEmailResult,
} from "./resend-client";
import { VERIFICATION_TOKEN_TTL_HOURS } from "./verification-constants";

function resetExpiryLabel(): string {
  const hours = VERIFICATION_TOKEN_TTL_HOURS;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function buildPasswordResetUrl(token: string): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}/applicant/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[SMECC2E] Password reset link (Resend not configured):");
    console.log(resetUrl);
    return { sent: false, devLink: resetUrl };
  }

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:20px;color:#062763;">Reset your password</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      We received a request to reset the password for your SMECC2E applicant dashboard account
      (<strong>${escapeHtml(email)}</strong>).
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155;">
      Click the button below to choose a new password. If you did not request this, you can ignore this email.
    </p>
    ${emailButton(resetUrl, "Reset password")}
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
      Or copy this link into your browser:<br />
      <a href="${escapeHtml(resetUrl)}" style="color:#062763;word-break:break-all;">${escapeHtml(resetUrl)}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
      This link expires in ${resetExpiryLabel()}.
    </p>
  `;

  const text = [
    "We received a request to reset your SMECC2E applicant dashboard password.",
    "",
    "Open the link below to choose a new password:",
    resetUrl,
    "",
    `This link expires in ${resetExpiryLabel()}.`,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: [email],
      subject: "Reset your applicant password — SMECC2E",
      text,
      html: emailLayout({
        title: "Reset your password",
        preheader: "Choose a new password for your SMECC2E applicant dashboard.",
        bodyHtml,
      }),
    });

    if (error) {
      console.error("[SMECC2E] Resend password reset email failed:", error);
      return {
        sent: false,
        devLink: resetUrl,
        error:
          error.message ??
          "Could not send email. Use the link below to reset (development mode).",
      };
    }

    return { sent: true };
  } catch (err) {
    console.error("[SMECC2E] Failed to send password reset email:", err);
    return {
      sent: false,
      devLink: resetUrl,
      error:
        "Could not send email. Use the link below to reset (development mode).",
    };
  }
}
