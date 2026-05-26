import { Resend } from "resend";

let resend: Resend | null = null;

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export function getEmailFrom(): string {
  return (
    process.env.RESEND_FROM?.trim() ??
    "SMECC2E <onboarding@resend.dev>"
  );
}

export type SendEmailResult = {
  sent: boolean;
  devLink?: string;
  error?: string;
};
