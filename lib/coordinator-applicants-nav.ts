import type { ApplicationStatus } from "./application-types";

export type ApplicantsManagementNavId =
  | "programs"
  | "institutions"
  | "regions"
  | "applicants"
  | "evaluation"
  | "interview"
  | "final_evaluation"
  | "offered"
  | "reserved"
  | "rejected"
  | "pre_departure";

export type ApplicantsManagementNavItem = {
  id: ApplicantsManagementNavId;
  label: string;
  href: string;
  /** When set, highlights `/applicants` with this status query. */
  statusFilter?: ApplicationStatus;
};

export function buildApplicantsManagementNav(
  basePath: string
): ApplicantsManagementNavItem[] {
  const root = basePath.replace(/\/$/, "");
  return [
    { id: "programs", label: "Programs", href: `${root}/programs` },
    {
      id: "institutions",
      label: "Institutions",
      href: `${root}/institutions`,
    },
    { id: "regions", label: "Regions", href: `${root}/regions` },
    { id: "applicants", label: "Applicants", href: `${root}/applicants` },
    {
      id: "evaluation",
      label: "Evaluation",
      href: `${root}/applicants?status=evaluation`,
      statusFilter: "evaluation",
    },
    {
      id: "interview",
      label: "Interview",
      href: `${root}/applicants?status=interview`,
      statusFilter: "interview",
    },
    {
      id: "final_evaluation",
      label: "Final Evaluation",
      href: `${root}/applicants?status=final_evaluation`,
      statusFilter: "final_evaluation",
    },
    {
      id: "offered",
      label: "Offered",
      href: `${root}/applicants?status=offered`,
      statusFilter: "offered",
    },
    {
      id: "reserved",
      label: "Reserved",
      href: `${root}/applicants?status=reserved`,
      statusFilter: "reserved",
    },
    {
      id: "rejected",
      label: "Rejected",
      href: `${root}/applicants?status=rejected`,
      statusFilter: "rejected",
    },
    {
      id: "pre_departure",
      label: "Pre-departure",
      href: `${root}/applicants?status=pre_departure`,
      statusFilter: "pre_departure",
    },
  ];
}

export function isApplicantsManagementSubActive(
  item: ApplicantsManagementNavItem,
  pathname: string,
  statusParam: string | null,
  basePath: string
): boolean {
  const root = basePath.replace(/\/$/, "");
  if (item.id === "programs") return pathname === `${root}/programs`;
  if (item.id === "institutions") return pathname === `${root}/institutions`;
  if (item.id === "regions") return pathname === `${root}/regions`;
  if (item.id === "applicants") {
    return pathname === `${root}/applicants` && !statusParam;
  }
  if (item.statusFilter) {
    return (
      pathname === `${root}/applicants` && statusParam === item.statusFilter
    );
  }
  return false;
}

export function isApplicantsManagementGroupActive(
  items: ApplicantsManagementNavItem[],
  pathname: string,
  statusParam: string | null,
  basePath: string
): boolean {
  return items.some((item) =>
    isApplicantsManagementSubActive(item, pathname, statusParam, basePath)
  );
}
