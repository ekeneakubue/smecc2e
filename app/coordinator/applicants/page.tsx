import { Suspense } from "react";
import { CoordinatorApplicants } from "../../components/coordinator-applicants";

export const metadata = {
  title: "Applicants | Coordinator | SMECC2E",
  description: "Review and manage SMECC2E scholarship applications.",
};

export default function CoordinatorApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-600">
          Loading applicants…
        </div>
      }
    >
      <CoordinatorApplicants />
    </Suspense>
  );
}
