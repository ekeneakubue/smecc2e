export type CoordinatorNavId =
  | "overview"
  | "users"
  | "regions"
  | "institutions"
  | "applicants"
  | "scholars"
  | "programs";

export type CoordinatorNavItem = {
  id: CoordinatorNavId;
  label: string;
  href: string;
};

export const COORDINATOR_NAV: CoordinatorNavItem[] = [
  { id: "overview", label: "Overview", href: "/coordinator" },
  { id: "users", label: "Users", href: "/coordinator/users" },
  { id: "regions", label: "Regions", href: "/coordinator/regions" },
  {
    id: "institutions",
    label: "Institutions",
    href: "/coordinator/institutions",
  },
  { id: "applicants", label: "Applicants", href: "/coordinator/applicants" },
  { id: "scholars", label: "Scholars", href: "/coordinator/scholars" },
  {
    id: "programs",
    label: "Programs",
    href: "/coordinator/programs",
  },
];

export const COORDINATOR_SECTION_TITLES: Record<CoordinatorNavId, string> = {
  overview: "Overview",
  users: "Users",
  regions: "Regions",
  institutions: "Institutions",
  applicants: "Applicants",
  scholars: "Scholars",
  programs: "Programs",
};

export function isCoordinatorNavId(value: string | null): value is CoordinatorNavId {
  return (
    value === "overview" ||
    value === "users" ||
    value === "regions" ||
    value === "institutions" ||
    value === "applicants" ||
    value === "scholars" ||
    value === "programs"
  );
}
