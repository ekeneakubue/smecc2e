import { Suspense } from "react";
import { CoordinatorFinancial } from "../../components/coordinator-financial";

export const metadata = {
  title: "Financial management | Coordinator | SMECC2E",
  description: "SMECC2E coordinator financial management.",
};

export default function CoordinatorFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-600">
          Loading financial management…
        </div>
      }
    >
      <CoordinatorFinancial />
    </Suspense>
  );
}
