export type ScholarsManagementSection =
  | "by_category"
  | "onboarding"
  | "supervision"
  | "progress_reporting"
  | "internship"
  | "publication_thesis"
  | "grievance"
  | "third_parties"
  | "alumni";

export type ScholarsManagementNavId = ScholarsManagementSection;

export type ScholarsManagementNavItem = {
  id: ScholarsManagementNavId;
  label: string;
  href: string;
  section: ScholarsManagementSection;
};

export const SCHOLARS_MANAGEMENT_SECTION_LABELS: Record<
  ScholarsManagementSection,
  string
> = {
  by_category: "Scholars (By Category)",
  onboarding: "On-boarding",
  supervision: "Supervision",
  progress_reporting: "Progress Reporting",
  internship: "Internship",
  publication_thesis: "Publication & Thesis",
  grievance: "Grievance",
  third_parties: "Third-Parties",
  alumni: "Alumni",
};

export function buildScholarsManagementNav(
  basePath: string
): ScholarsManagementNavItem[] {
  const root = basePath.replace(/\/$/, "");
  const scholarsBase = `${root}/scholars`;

  return (
    Object.keys(SCHOLARS_MANAGEMENT_SECTION_LABELS) as ScholarsManagementSection[]
  ).map((section) => ({
    id: section,
    label: SCHOLARS_MANAGEMENT_SECTION_LABELS[section],
    section,
    href:
      section === "by_category"
        ? scholarsBase
        : `${scholarsBase}?section=${section}`,
  }));
}

export function parseScholarsManagementSection(
  sectionParam: string | null
): ScholarsManagementSection {
  if (
    sectionParam &&
    sectionParam in SCHOLARS_MANAGEMENT_SECTION_LABELS &&
    sectionParam !== "by_category"
  ) {
    return sectionParam as ScholarsManagementSection;
  }
  return "by_category";
}

export function isScholarsManagementSubActive(
  item: ScholarsManagementNavItem,
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  const root = basePath.replace(/\/$/, "");
  if (pathname !== `${root}/scholars`) return false;
  if (item.section === "by_category") {
    return !sectionParam || sectionParam === "by_category";
  }
  return sectionParam === item.section;
}

export function isScholarsManagementGroupActive(
  items: ScholarsManagementNavItem[],
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  return items.some((item) =>
    isScholarsManagementSubActive(item, pathname, sectionParam, basePath)
  );
}
