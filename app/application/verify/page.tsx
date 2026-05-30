import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyEmailSuccess } from "../../components/verify-email-success";
import { consumeVerificationToken } from "@/lib/email-verification-store";
import {
  APPLICANT_SESSION_COOKIE,
  clearApplicantSessionCookieOptions,
} from "@/lib/applicant-session";
import {
  VERIFIED_EMAIL_COOKIE,
  verifiedEmailCookieOptions,
} from "@/lib/verification-session";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const trimmed = token?.trim();

  if (!trimmed) {
    redirect("/applicant/login?error=missing_token");
  }

  let result: { email: string; tempPassword: string | null } | { error: string };
  try {
    result = await consumeVerificationToken(trimmed);
  } catch (err) {
    console.error("GET /application/verify", err);
    redirect("/applicant/login?error=verification_failed");
  }

  if ("error" in result) {
    redirect("/applicant/login?error=verification_failed");
  }

  const cookieStore = await cookies();

  const clearSession = clearApplicantSessionCookieOptions();
  cookieStore.set(APPLICANT_SESSION_COOKIE, clearSession.value, {
    httpOnly: clearSession.httpOnly,
    sameSite: clearSession.sameSite,
    secure: clearSession.secure,
    path: clearSession.path,
    maxAge: clearSession.maxAge,
  });

  const opts = verifiedEmailCookieOptions(result.email);
  cookieStore.set(VERIFIED_EMAIL_COOKIE, opts.value, {
    httpOnly: opts.httpOnly,
    sameSite: opts.sameSite,
    secure: opts.secure,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return (
    <VerifyEmailSuccess
      email={result.email}
      tempPassword={result.tempPassword}
    />
  );
}
