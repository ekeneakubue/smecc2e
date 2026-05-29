"use client";

import { createContext, useContext, useMemo } from "react";
import {
  DASHBOARD_PORTALS,
  type DashboardPortalKey,
} from "@/lib/dashboard-portal";
import { buildDashboardNav } from "@/lib/coordinator-nav";

type DashboardPortalContextValue = {
  portalKey: DashboardPortalKey;
  basePath: string;
  label: string;
  nav: ReturnType<typeof buildDashboardNav>;
};

const DashboardPortalContext = createContext<DashboardPortalContextValue | null>(
  null
);

export function DashboardPortalProvider({
  portalKey,
  children,
}: {
  portalKey: DashboardPortalKey;
  children: React.ReactNode;
}) {
  const config = DASHBOARD_PORTALS[portalKey];
  const value = useMemo(
    () => ({
      portalKey,
      basePath: config.basePath,
      label: config.label,
      nav: buildDashboardNav(config.basePath),
    }),
    [portalKey, config.basePath, config.label]
  );

  return (
    <DashboardPortalContext.Provider value={value}>
      {children}
    </DashboardPortalContext.Provider>
  );
}

export function useDashboardPortal(): DashboardPortalContextValue {
  const ctx = useContext(DashboardPortalContext);
  if (!ctx) {
    throw new Error("useDashboardPortal must be used within DashboardPortalProvider");
  }
  return ctx;
}
