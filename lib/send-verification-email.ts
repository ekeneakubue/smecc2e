import {
  emailButton,
  emailLayout,
  escapeHtml,
} from "./email-layout";
import {
  getEmailFrom,
  getResendClient,
  type SendEmailResult,
} from "./resend-client";

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERIFICATION_APP_URL ??
    "http://localhost:3000"
  );
}

export function buildVerificationUrl(token: string): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}/application/verify?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(
  email: string,
  verifyUrl: string
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[SMECC2E] Email verification link (Resend not configured):");
    console.log(verifyUrl);
    return { sent: false, devLink: verifyUrl };
  }

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:20px;color:#062763;">Verify your email</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Thank you for starting your <strong>SMECC2E</strong> scholarship application.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Please verify your email address (<strong>${escapeHtml(email)}</strong>) to continue <strong>registration (stage 2)</strong> of your application.
    </p>
    ${emailButton(verifyUrl, "Verify email & continue registration")}
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
      Or copy this link into your browser:<br />
      <a href="${escapeHtml(verifyUrl)}" style="color:#062763;word-break:break-all;">${escapeHtml(verifyUrl)}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
      This link expires in 24 hours. If you did not request this, you can ignore this email.
    </p>
  `;

  const text = [
    "Thank you for starting your SMECC2E application.",
    "",
    "Please verify your email address by opening the link below:",
    verifyUrl,
    "",
    "This link expires in 24 hours.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: [email],
      subject: "Verify your email — SMECC2E application",
      text,
      html: emailLayout({
        title: "Verify your email",
        preheader: "Confirm your email to continue your SMECC2E application.",
        bodyHtml,
      }),
    });

    if (error) {
      console.error("[SMECC2E] Resend verification email failed:", error);
      return {
        sent: false,
        devLink: verifyUrl,
        error:
          error.message ??
          "Could not send email. Use the link below to verify (development mode).",
      };
    }

    return { sent: true };
  } catch (err) {
    console.error("[SMECC2E] Failed to send verification email:", err);
    return {
      sent: false,
      devLink: verifyUrl,
      error:
        "Could not send email. Use the link below to verify (development mode).",
    };
  }
}
