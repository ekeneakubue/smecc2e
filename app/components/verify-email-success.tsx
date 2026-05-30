import Link from "next/link";
import { applicantVerifiedLoginPath } from "@/lib/applicant-login-paths";

type VerifyEmailSuccessProps = {
  email: string;
  tempPassword: string | null;
};

export function VerifyEmailSuccess({
  email,
  tempPassword,
}: VerifyEmailSuccessProps) {
  const loginHref = applicantVerifiedLoginPath(email);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f0f4f8] px-4 py-12">
      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-emerald-950">
                Verification successful
              </h1>
              <p className="mt-1 text-sm text-emerald-900">
                Your email <strong>{email}</strong> has been verified.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          {tempPassword ? (
            <>
              <p className="text-sm font-medium text-slate-700">
                Save your temporary password below. You will need it to sign in.
              </p>
              <div className="rounded-xl border-[3px] border-[#f7be2a] bg-[#062763] px-5 py-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#f7be2a]">
                  Temporary password
                </p>
                <p className="mt-2 break-all font-mono text-2xl font-extrabold tracking-wider text-white sm:text-3xl">
                  {tempPassword}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Sign in to change your password, then continue your application.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Sign in with your existing password to continue your application.
            </p>
          )}

          <Link
            href={loginHref}
            className="flex w-full items-center justify-center rounded-lg bg-[#062763] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3580]"
          >
            {tempPassword ? "Sign in to change your password" : "Sign in to continue"}
          </Link>
        </div>
      </div>
    </main>
  );
}
