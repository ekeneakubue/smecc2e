export type FinancialManagementSection =
  | "budgets"
  | "person_month"
  | "scholarship_disbursement"
  | "institutional_disbursement"
  | "special_needs_disbursement"
  | "overall_finance"
  | "audit";

export type FinancialManagementNavId = FinancialManagementSection;

export type FinancialManagementNavItem = {
  id: FinancialManagementNavId;
  label: string;
  href: string;
  section: FinancialManagementSection;
};

export const FINANCIAL_MANAGEMENT_SECTION_LABELS: Record<
  FinancialManagementSection,
  string
> = {
  budgets: "Budgets",
  person_month: "Person-Month (Per Partner)",
  scholarship_disbursement: "Scholarship-Disbursement",
  institutional_disbursement: "Institutional-Disbursement",
  special_needs_disbursement: "Special Needs-Disbursement",
  overall_finance: "Overall Finance",
  audit: "Audit",
};

export function buildFinancialManagementNav(
  basePath: string
): FinancialManagementNavItem[] {
  const root = basePath.replace(/\/$/, "");
  const financeBase = `${root}/finance`;

  return (
    Object.keys(
      FINANCIAL_MANAGEMENT_SECTION_LABELS
    ) as FinancialManagementSection[]
  ).map((section) => ({
    id: section,
    label: FINANCIAL_MANAGEMENT_SECTION_LABELS[section],
    section,
    href:
      section === "budgets"
        ? financeBase
        : `${financeBase}?section=${section}`,
  }));
}

export function parseFinancialManagementSection(
  sectionParam: string | null
): FinancialManagementSection {
  if (
    sectionParam &&
    sectionParam in FINANCIAL_MANAGEMENT_SECTION_LABELS &&
    sectionParam !== "budgets"
  ) {
    return sectionParam as FinancialManagementSection;
  }
  return "budgets";
}

export function isFinancialManagementSubActive(
  item: FinancialManagementNavItem,
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  const root = basePath.replace(/\/$/, "");
  if (pathname !== `${root}/finance`) return false;
  if (item.section === "budgets") {
    return !sectionParam || sectionParam === "budgets";
  }
  return sectionParam === item.section;
}

export function isFinancialManagementGroupActive(
  items: FinancialManagementNavItem[],
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  return items.some((item) =>
    isFinancialManagementSubActive(item, pathname, sectionParam, basePath)
  );
}
