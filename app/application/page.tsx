import { Suspense } from "react";
import { ApplicationForm } from "../components/application-form";
import { ScrollToTop } from "../components/scroll-to-top";
import { SiteFooter } from "../components/site-footer";

export const metadata = {
  title: "Application | SMECC2E",
  description:
    "Apply for SMECC2E mobility and scholarship opportunities through the programme application form.",
};

export default function ApplicationPage() {
  return (
    <main className="min-h-dvh bg-[#f0f4f8] text-slate-800">
      <div className="mx-auto w-[80%] py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-600">
              Loading application form…
            </div>
          }
        >
          <ApplicationForm />
        </Suspense>
      </div>

      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
