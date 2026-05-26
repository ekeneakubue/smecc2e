"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. Please request a new one from the application form.");
      return;
    }

    fetch(`/api/verify-email/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          redirectTo?: string;
        };
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
          return;
        }
        setStatus("success");
        setMessage("Your email has been verified. Redirecting to registration…");
        const target = data.redirectTo ?? "/application?page=2&verified=1";
        setTimeout(() => router.replace(target), 1500);
      })
      .catch(() => {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      });
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm sm:px-10">
      {status === "loading" && (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#062763]/20 border-t-[#062763]" />
          <h1 className="mt-6 text-xl font-bold text-[#062763]">
            Verifying your email…
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please wait while we confirm your verification link.
          </p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-bold text-[#062763]">Email verified</h1>
          <p className="mt-2 text-sm font-medium text-slate-700">{message}</p>
        </>
      )}
      {status === "error" && (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            <span className="text-xl font-bold">!</span>
          </div>
          <h1 className="mt-6 text-xl font-bold text-[#062763]">
            Verification failed
          </h1>
          <p className="mt-2 text-sm text-red-700">{message}</p>
          <Link
            href="/application?page=2"
            className="mt-6 inline-block rounded-lg bg-[#062763] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0a3a8a]"
          >
            Back to application
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f0f4f8] px-4 py-12">
      <Suspense
        fallback={
          <div className="text-center text-sm font-medium text-slate-600">
            Loading…
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
