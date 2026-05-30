import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VerifyEmailConfirm } from "../../components/verify-email-confirm";

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

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-slate-600">
          Loading…
        </div>
      }
    >
      <VerifyEmailConfirm token={trimmed} />
    </Suspense>
  );
}
