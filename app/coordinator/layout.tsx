import { Suspense } from "react";
import { CoordinatorSidebar } from "../components/coordinator-sidebar";

export const metadata = {
  title: "Coordinator Dashboard | SMECC2E",
  description:
    "Review and manage SMECC2E scholarship and mobility applications.",
};

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-white">
      <Suspense fallback={null}>
        <CoordinatorSidebar />
      </Suspense>
      {children}
    </div>
  );
}
