import type { DashboardUser } from "./dashboard-users";

export type DashboardPortalKey = "coordinator" | "administrator";

export type DashboardPortalConfig = {
  key: DashboardPortalKey;
  basePath: string;
  label: string;
  allowedRoles: DashboardUser["role"][];
};

export const DASHBOARD_PORTALS: Record<
  DashboardPortalKey,
  DashboardPortalConfig
> = {
  coordinator: {
    key: "coordinator",
    basePath: "/coordinator",
    label: "Coordinator",
    allowedRoles: ["Coordinator"],
  },
  administrator: {
    key: "administrator",
    basePath: "/administrator",
    label: "Administrator",
    allowedRoles: ["Administrator"],
  },
};

export function portalKeyFromPath(pathname: string): DashboardPortalKey | null {
  if (pathname.startsWith("/administrator")) return "administrator";
  if (pathname.startsWith("/coordinator")) return "coordinator";
  return null;
}

export function portalForRole(
  role: DashboardUser["role"]
): DashboardPortalKey | null {
  if (role === "Coordinator") return "coordinator";
  if (role === "Administrator") return "administrator";
  return null;
}

export function defaultDashboardPathForRole(role: DashboardUser["role"]): string {
  const key = portalForRole(role);
  return key ? DASHBOARD_PORTALS[key].basePath : "/login";
}

export function isDashboardPath(pathname: string): boolean {
  return portalKeyFromPath(pathname) !== null;
}

export function safeDashboardRedirect(
  redirect: string | null | undefined,
  fallback: string
): string {
  if (!redirect || redirect.includes("//")) return fallback;
  if (
    redirect.startsWith("/coordinator") ||
    redirect.startsWith("/administrator")
  ) {
    return redirect;
  }
  return fallback;
}
