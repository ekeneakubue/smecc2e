import { Suspense } from "react";
import { CoordinatorProject } from "../../components/coordinator-project";

export const metadata = {
  title: "Project management | Administrator | SMECC2E",
  description: "SMECC2E administrator project management.",
};

export default function AdministratorProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-600">
          Loading project management…
        </div>
      }
    >
      <CoordinatorProject />
    </Suspense>
  );
}
