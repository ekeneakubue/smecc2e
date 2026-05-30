import {
  emailButton,
  emailLayout,
  escapeHtml,
} from "./email-layout";
import { VERIFICATION_TOKEN_TTL_HOURS } from "./email-verification-store";
import {
  getEmailFrom,
  getResendClient,
  type SendEmailResult,
} from "./resend-client";

function verificationExpiryLabel(): string {
  const hours = VERIFICATION_TOKEN_TTL_HOURS;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

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

export function buildApplicantLoginUrl(): string {
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}/applicant/login`;
}

export async function sendVerificationEmail(
  email: string,
  verifyUrl: string,
  tempPassword: string | null
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    console.log("[SMECC2E] Email verification link (Resend not configured):");
    console.log(verifyUrl);
    return { sent: false, devLink: verifyUrl };
  }

  const loginUrl = buildApplicantLoginUrl();
  const passwordBlock = tempPassword
    ? `
    <div style="margin:20px 0;padding:20px 22px;border-radius:12px;background:#e8f0ff;border:2px solid #c7d9f5;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#062763;">Your applicant dashboard access</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#334155;">
        After verifying your email, sign in with this <strong>temporary password</strong>:
      </p>
      <div style="margin:0 0 14px;padding:22px 20px;border-radius:10px;background:#062763;border:3px solid #f7be2a;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f7be2a;">Temporary password</p>
        <p style="margin:0;font-family:Consolas,Monaco,'Courier New',monospace;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:0.18em;line-height:1.35;word-break:break-all;">${escapeHtml(tempPassword)}</p>
      </div>
      <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
        You will be asked to set a new password before continuing your application.
      </p>
    </div>
    `
    : `
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      After verifying, sign in to your applicant dashboard with your existing password at
      <a href="${escapeHtml(loginUrl)}" style="color:#062763;font-weight:600;">${escapeHtml(loginUrl)}</a>.
    </p>
    `;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:20px;color:#062763;">Verify your email</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Thank you for starting your <strong>SMECC2E</strong> scholarship application.
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Please verify your email address (<strong>${escapeHtml(email)}</strong>) to access your applicant dashboard and continue your application.
    </p>
    ${passwordBlock}
    ${emailButton(verifyUrl, "Verify email")}
    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">
      Or copy this link into your browser:<br />
      <a href="${escapeHtml(verifyUrl)}" style="color:#062763;word-break:break-all;">${escapeHtml(verifyUrl)}</a>
    </p>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
      This link expires in ${verificationExpiryLabel()}. If you did not request this, you can ignore this email.
    </p>
  `;

  const textPassword = tempPassword
    ? [
        "",
        "======================================",
        "YOUR TEMPORARY PASSWORD",
        tempPassword,
        "======================================",
        "",
        "Verify your email using the link below, then sign in with this password.",
      ].join("\n")
    : ["", `After verifying, sign in at: ${loginUrl}`].join("\n");

  const text = [
    "Thank you for starting your SMECC2E application.",
    "",
    "Please verify your email address by opening the link below:",
    verifyUrl,
    textPassword,
    "",
    `This link expires in ${verificationExpiryLabel()}.`,
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
        preheader: tempPassword
          ? "Verify your email and use your temporary password to access the applicant dashboard."
          : "Confirm your email to continue your SMECC2E application.",
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
