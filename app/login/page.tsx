import { LoginForm } from "../components/login-form";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Login | SMECC2E",
  description:
    "Sign in to the SMECC2E coordinator dashboard to review applications and manage programme data.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-[#f0f4f8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,39,99,0.08),transparent_50%)]" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <LoginForm />
        <p className="mt-8 max-w-sm text-center text-xs leading-5 text-slate-500">
          Access is limited to coordinators, reviewers, and administrators
          registered by your institution.
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
