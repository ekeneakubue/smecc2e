import { Suspense } from "react";
import { DashboardPortalProvider } from "../components/dashboard-portal-provider";
import { CoordinatorSidebar } from "../components/coordinator-sidebar";
import { IdleSessionGuard } from "../components/idle-session-guard";

export const metadata = {
  title: "Administrator Dashboard | SMECC2E",
  description:
    "Review and manage SMECC2E scholarship and mobility applications.",
};

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardPortalProvider portalKey="administrator">
      <IdleSessionGuard />
      <div className="min-h-dvh bg-white">
        <Suspense fallback={null}>
          <CoordinatorSidebar />
        </Suspense>
        <div className="min-h-dvh lg:pl-64">{children}</div>
      </div>
    </DashboardPortalProvider>
  );
}
