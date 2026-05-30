import { ApplicantChangePasswordForm } from "../../components/applicant-auth-forms";
import { SiteFooter } from "../../components/site-footer";

export const metadata = {
  title: "Set Password | Applicant | SMECC2E",
  description: "Set your applicant dashboard password.",
};

export default function ApplicantChangePasswordPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#f0f4f8]">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <ApplicantChangePasswordForm />
      </div>
      <SiteFooter hideLogin />
    </main>
  );
}
