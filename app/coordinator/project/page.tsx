import { Suspense } from "react";
import { CoordinatorProject } from "../../components/coordinator-project";

export const metadata = {
  title: "Project management | Coordinator | SMECC2E",
  description: "SMECC2E coordinator project management.",
};

export default function CoordinatorProjectPage() {
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
