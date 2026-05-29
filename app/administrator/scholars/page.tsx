import { Suspense } from "react";
import { CoordinatorScholars } from "../../components/coordinator-scholars";

export const metadata = {
  title: "Scholars | Administrator | SMECC2E",
  description: "View approved SMECC2E scholarship scholars.",
};

export default function AdministratorScholarsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-600">
          Loading scholars…
        </div>
      }
    >
      <CoordinatorScholars />
    </Suspense>
  );
}
