import nodemailer from "nodemailer";

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
): Promise<{ sent: boolean; devLink?: string; error?: string }> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ?? "SMECC2E <smecc2e@unn.edu.ng>";

  if (!host || !user || !pass) {
    console.log("[SMECC2E] Email verification link (SMTP not configured):");
    console.log(verifyUrl);
    return { sent: false, devLink: verifyUrl };
  }

  try {
    const port = Number(process.env.SMTP_PORT ?? "587");
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: email,
      subject: "Verify your email — SMECC2E application",
      text: [
        "Thank you for starting your SMECC2E application.",
        "",
        "Please verify your email address by opening the link below:",
        verifyUrl,
        "",
        "This link expires in 24 hours.",
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>Thank you for starting your <strong>SMECC2E</strong> application.</p>
        <p>Please verify your email address to continue <strong>registration (stage 2)</strong> of your application:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#062763;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify email &amp; continue registration</a></p>
        <p style="font-size:14px;color:#555;">Or copy this link:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="font-size:12px;color:#888;">This link expires in 24 hours.</p>
      `,
    });

    return { sent: true };
  } catch (err) {
    console.error("[SMECC2E] Failed to send verification email:", err);
    return {
      sent: false,
      devLink: verifyUrl,
      error: "Could not send email. Use the link below to verify (development mode).",
    };
  }
}
