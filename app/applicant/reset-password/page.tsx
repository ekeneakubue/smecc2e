import { ApplicantResetPasswordForm } from "../../components/applicant-auth-forms";
import { SiteFooter } from "../../components/site-footer";

export const metadata = {
  title: "Reset Password | SMECC2E",
  description: "Choose a new password for your SMECC2E applicant dashboard.",
};

export default function ApplicantResetPasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#f0f4f8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,39,99,0.08),transparent_50%)]" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <ApplicantResetPasswordForm />
      </div>
      <SiteFooter hideLogin />
    </main>
  );
}
