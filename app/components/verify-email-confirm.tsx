"use client";

import Link from "next/link";
import { useState } from "react";
import { VerifyEmailSuccess } from "./verify-email-success";
import { APPLICANT_LOGIN_PATH } from "@/lib/applicant-login-paths";
import { VERIFICATION_TOKEN_TTL_HOURS } from "@/lib/verification-constants";

type VerifyEmailConfirmProps = {
  token: string;
};

type ConfirmState = "confirm" | "loading" | "success" | "error";

export function VerifyEmailConfirm({ token }: VerifyEmailConfirmProps) {
  const [state, setState] = useState<ConfirmState>("confirm");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerify = async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/verify-email/confirm?token=${encodeURIComponent(token)}&format=json`,
        { method: "POST" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        email?: string;
        tempPassword?: string | null;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        setErrorMessage(
          data.error ??
            "This verification link is invalid or has expired. Please request a new one."
        );
        setState("error");
        return;
      }

      setEmail(data.email ?? "");
      setTempPassword(data.tempPassword ?? null);
      setState("success");
    } catch {
      setErrorMessage("A network error occurred. Please try again.");
      setState("error");
    }
  };

  if (state === "success" && email) {
    return <VerifyEmailSuccess email={email} tempPassword={tempPassword} />;
  }

  const expiryLabel =
    VERIFICATION_TOKEN_TTL_HOURS === 1
      ? "1 hour"
      : `${VERIFICATION_TOKEN_TTL_HOURS} hours`;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f0f4f8] px-4 py-12">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
        {state === "loading" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#062763]/20 border-t-[#062763]" />
            <h1 className="mt-6 text-xl font-bold text-[#062763]">
              Verifying your email…
            </h1>
          </>
        )}

        {state === "confirm" && (
          <>
            <h1 className="text-xl font-bold text-[#062763]">Verify your email</h1>
            <p className="mt-3 text-sm text-slate-600">
              Click the button below to confirm your email address. This link
              remains valid for {expiryLabel}.
            </p>
            <button
              type="button"
              onClick={() => void handleVerify()}
              className="mt-6 w-full rounded-lg bg-[#062763] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3580]"
            >
              Verify email
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
              <span className="text-xl font-bold">!</span>
            </div>
            <h1 className="mt-6 text-xl font-bold text-[#062763]">
              Verification failed
            </h1>
            <p className="mt-3 text-sm text-red-700">{errorMessage}</p>
            <Link
              href="/application?page=2"
              className="mt-6 inline-block rounded-lg bg-[#062763] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0a3580]"
            >
              Request a new verification email
            </Link>
            <Link
              href={APPLICANT_LOGIN_PATH}
              className="mt-3 block text-sm font-semibold text-[#062763] hover:underline"
            >
              Go to application login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
