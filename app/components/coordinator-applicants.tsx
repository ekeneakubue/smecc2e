"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  applicantDisplayName,
  applicantPrimaryEmail,
  COORDINATOR_APPLICATION_STATUSES,
  isApplicationStatus,
  STATUS_LABELS,
  type ApplicationRecord,
  type ApplicationStatus,
} from "@/lib/application-types";
import {
  buildApplicantsManagementNav,
  type ApplicantsManagementNavItem,
} from "@/lib/coordinator-applicants-nav";
import { useDashboardPortal } from "./dashboard-portal-provider";
import {
  ApplicationDetailPanel,
  formatDate,
  StatusBadge,
} from "./coordinator-shared";

function applicantsPageTitle(
  statusFilter: ApplicationStatus | "all",
  managementNav: ApplicantsManagementNavItem[]
): string {
  if (statusFilter === "all") return "Applicants";
  const match = managementNav.find((item) => item.statusFilter === statusFilter);
  return match?.label ?? STATUS_LABELS[statusFilter];
}

function statusFilterFromParam(
  statusFromUrl: string | null | undefined
): ApplicationStatus | "all" {
  return statusFromUrl && isApplicationStatus(statusFromUrl)
    ? statusFromUrl
    : "all";
}

export function CoordinatorApplicants({
  statusFromUrl = null,
}: {
  statusFromUrl?: string | null;
}) {
  const { basePath } = useDashboardPortal();
  const managementNav = useMemo(
    () => buildApplicantsManagementNav(basePath),
    [basePath]
  );

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    () => statusFilterFromParam(statusFromUrl)
  );
  const [mobilityFilter, setMobilityFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) return;
      const data = (await res.json()) as { applications: ApplicationRecord[] };
      setApplications(data.applications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    setStatusFilter(statusFilterFromParam(statusFromUrl));
  }, [statusFromUrl]);

  const pageTitle = applicantsPageTitle(statusFilter, managementNav);

  const mobilityOptions = useMemo(() => {
    const set = new Set(
      applications.map((a) => a.typeOfMobility).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [applications]);

  const filteredApplicants = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (mobilityFilter !== "all" && app.typeOfMobility !== mobilityFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        app.id,
        applicantDisplayName(app),
        applicantPrimaryEmail(app),
        app.nationality,
        app.preferredHostInstitution,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [applications, search, statusFilter, mobilityFilter]);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { application: ApplicationRecord };
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? data.application : a))
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:pl-6">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-lg font-bold text-[#062763] sm:text-xl">
            {pageTitle}
          </h1>
          <p className="text-sm font-semibold text-slate-800">
            SMECC2E mobility & scholarship coordination
          </p>
        </div>
        <button
          type="button"
          onClick={loadApplications}
          disabled={loading}
          className="shrink-0 rounded-lg border-2 border-[#062763]/25 px-4 py-2 text-sm font-semibold text-[#062763] transition hover:bg-[#062763]/5 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end sm:p-5">
          <div className="min-w-48 flex-1">
            <label className="block text-xs font-bold text-slate-800">
              Search
            </label>
            <input
              type="search"
              placeholder="Name, email, ID, institution…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-[#062763] focus:ring-2 focus:ring-[#062763]/15"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApplicationStatus | "all")
              }
              className="mt-1 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#062763] outline-none focus:border-[#062763] focus:ring-2 focus:ring-[#062763]/15"
            >
              <option value="all">All statuses</option>
              {COORDINATOR_APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800">
              Mobility type
            </label>
            <select
              value={mobilityFilter}
              onChange={(e) => setMobilityFilter(e.target.value)}
              className="mt-1 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#062763] outline-none focus:border-[#062763] focus:ring-2 focus:ring-[#062763]/15"
            >
              <option value="all">All types</option>
              {mobilityOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
            <h2 className="text-base font-bold text-[#062763]">
              Applications ({filteredApplicants.length})
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              Click an applicant to expand details.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#e8f0ff] text-xs font-bold uppercase tracking-wide text-[#062763]">
                <tr>
                  <th className="w-10 px-2 py-3" aria-hidden />
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Mobility</th>
                  <th className="px-4 py-3">Host / Programme</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center font-semibold text-slate-900"
                    >
                      No applications match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app) => {
                    const isExpanded = expandedId === app.id;
                    return (
                      <Fragment key={app.id}>
                        <tr
                          onClick={() =>
                            setExpandedId(isExpanded ? null : app.id)
                          }
                          className={`cursor-pointer transition hover:bg-[#062763]/5 ${
                            isExpanded ? "bg-[#062763]/8" : ""
                          }`}
                        >
                          <td className="px-2 py-3 text-center">
                            <svg
                              className={`mx-auto h-4 w-4 text-[#062763] transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">
                              {applicantDisplayName(app) || "—"}
                            </p>
                            <p className="text-xs font-semibold text-slate-800">
                              {app.id}
                            </p>
                            <p className="text-xs font-semibold text-slate-900">
                              {applicantPrimaryEmail(app)}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {app.typeOfMobility || "—"}
                          </td>
                          <td className="max-w-40 px-4 py-3 font-medium text-slate-900">
                            <p className="truncate">
                              {app.preferredHostInstitution || "—"}
                            </p>
                            {app.proposedAcademicProgramme && (
                              <p className="truncate text-xs font-semibold text-slate-900">
                                {app.proposedAcademicProgramme}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {formatDate(app.submittedAt)}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={6} className="p-0">
                              <div
                                className="border-t border-slate-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ApplicationDetailPanel
                                  selected={app}
                                  updatingStatus={updatingStatus}
                                  onStatusChange={handleStatusChange}
                                  collapsibleSections
                                  embedded
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
