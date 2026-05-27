"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicationRecord } from "@/lib/application-types";
import { THEMATIC_AREA_OPTIONS } from "@/lib/thematic-areas";
import type { UniversityRecord } from "@/lib/universities";

const inputClass =
  "mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-[#062763] focus:ring-2 focus:ring-[#062763]/15 disabled:opacity-50";

export function CoordinatorInstitutions() {
  const [universities, setUniversities] = useState<UniversityRecord[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionsLoadError, setInstitutionsLoadError] = useState<
    string | null
  >(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newInstitutionName, setNewInstitutionName] = useState("");
  const [selectedThematicAreas, setSelectedThematicAreas] = useState<string[]>(
    []
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadUniversities = useCallback(async () => {
    try {
      const res = await fetch("/api/universities", { cache: "no-store" });
      const data = (await res.json()) as {
        universities?: UniversityRecord[];
        error?: string;
      };
      if (!res.ok) {
        setInstitutionsLoadError(
          data.error ?? "Failed to load institutions."
        );
        return;
      }
      setInstitutionsLoadError(null);
      setUniversities(data.universities ?? []);
    } catch {
      setInstitutionsLoadError("Failed to load institutions.");
    }
  }, []);

  const loadApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) return;
      const data = (await res.json()) as { applications: ApplicationRecord[] };
      setApplications(data.applications ?? []);
    } catch {
      /* keep current */
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadUniversities(), loadApplications()]);
    setLoading(false);
  }, [loadUniversities, loadApplications]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const universityStats = useMemo(() => {
    return universities.map((university) => {
      const apps = applications.filter(
        (a) => a.preferredHostInstitution === university.name
      );
      return {
        university,
        programmeCount: university.programs?.length ?? 0,
        applicants: apps.length,
        approved: apps.filter((a) => a.status === "approved").length,
        programmes: (university.programs ?? []).map((p) => p.name),
        thematicAreas: university.thematicAreas,
      };
    });
  }, [applications, universities]);

  const toggleThematicArea = (area: string) => {
    setSelectedThematicAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
    setCreateError(null);
  };

  const totalProgrammes = useMemo(
    () => universityStats.reduce((sum, u) => sum + u.programmeCount, 0),
    [universityStats]
  );

  const resetCreateForm = () => {
    setNewInstitutionName("");
    setSelectedThematicAreas([]);
    setCreateError(null);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setCreateOpen(false);
    resetCreateForm();
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newInstitutionName.trim();
    if (!name) {
      setCreateError("Enter an institution name.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ name, thematicAreas: selectedThematicAreas }),
      });
      const data = (await res.json()) as {
        universities?: UniversityRecord[];
        error?: string;
      };
      if (!res.ok) {
        setCreateError(data.error ?? "Could not create institution.");
        return;
      }
      if (data.universities) setUniversities(data.universities);
      resetCreateForm();
      setCreateOpen(false);
    } catch {
      setCreateError("Could not create institution.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:pl-6">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-lg font-bold text-[#062763] sm:text-xl">
            Institutions
          </h1>
          <p className="text-sm font-semibold text-slate-800">
            SMECC2E host institutions and mobility programmes
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-[#062763] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#062763]/90"
          >
            Create institution
          </button>
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="rounded-lg border-2 border-[#062763]/25 px-4 py-2 text-sm font-semibold text-[#062763] transition hover:bg-[#062763]/5 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
        <div className="space-y-6">
          {institutionsLoadError && (
            <p className="text-sm font-semibold text-red-700" role="alert">
              {institutionsLoadError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className="region-stat-card rounded-xl border border-slate-200 border-t-4 border-t-[#062763] bg-white p-5 shadow-sm"
              style={{ animationDelay: "0ms" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Host institutions
              </p>
              <p className="mt-2 text-3xl font-bold text-[#062763] tabular-nums">
                {universities.length}
              </p>
            </div>
            <div
              className="region-stat-card rounded-xl border border-slate-200 border-t-4 border-t-sky-400 bg-white p-5 shadow-sm"
              style={{ animationDelay: "90ms" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Academic programmes
              </p>
              <p className="mt-2 text-3xl font-bold text-[#062763] tabular-nums">
                {totalProgrammes}
              </p>
            </div>
            <div
              className="region-stat-card rounded-xl border border-slate-200 border-t-4 border-t-amber-400 bg-white p-5 shadow-sm"
              style={{ animationDelay: "180ms" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Applicants (all hosts)
              </p>
              <p className="mt-2 text-3xl font-bold text-[#062763] tabular-nums">
                {loading ? "—" : applications.length}
              </p>
            </div>
            <div
              className="region-stat-card rounded-xl border border-slate-200 border-t-4 border-t-emerald-400 bg-white p-5 shadow-sm"
              style={{ animationDelay: "270ms" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Approved scholars
              </p>
              <p className="mt-2 text-3xl font-bold text-[#062763] tabular-nums">
                {loading
                  ? "—"
                  : applications.filter((a) => a.status === "approved").length}
              </p>
            </div>
          </div>

          {universityStats.length === 0 && !loading ? (
            <p className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm font-semibold text-slate-900">
              No institutions yet. Create one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {universityStats.map(
                (
                  {
                    university,
                    programmeCount,
                    applicants,
                    approved,
                    programmes,
                    thematicAreas,
                  },
                  index
                ) => (
                  <div
                    key={university.id}
                    className="region-stat-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ animationDelay: `${(index + 4) * 90}ms` }}
                  >
                    <h2 className="text-base font-bold leading-snug text-[#062763]">
                      {university.name}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-700 line-clamp-2">
                      {thematicAreas.length > 0
                        ? thematicAreas.join(", ")
                        : "No thematic areas"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {programmeCount} programme
                      {programmeCount === 1 ? "" : "s"}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-[#062763] tabular-nums">
                      {loading ? "—" : applicants}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Applicants
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-800">
                      {loading
                        ? "—"
                        : `${approved} approved scholar${approved === 1 ? "" : "s"}`}
                    </p>
                    <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto border-t border-slate-100 pt-3 text-xs font-medium text-slate-700">
                      {programmes.length === 0 ? (
                        <li className="text-slate-500">No programmes listed</li>
                      ) : (
                        <>
                          {programmes.slice(0, 4).map((p, idx) => (
                            <li
                              key={`${university.id}-${p}-${idx}`}
                              className="line-clamp-1"
                            >
                              {p}
                            </li>
                          ))}
                          {programmes.length > 4 && (
                            <li className="text-slate-500">
                              +{programmes.length - 4} more
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-institution-title"
          onClick={closeCreateModal}
        >
          <div
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="create-institution-title"
              className="text-lg font-bold text-[#062763]"
            >
              Create institution
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              Add a host institution and the thematic areas it covers.
            </p>
            <form onSubmit={handleCreateInstitution} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="institution-name"
                  className="block text-xs font-bold text-slate-800"
                >
                  Institution name
                </label>
                <input
                  id="institution-name"
                  type="text"
                  value={newInstitutionName}
                  onChange={(e) => {
                    setNewInstitutionName(e.target.value);
                    setCreateError(null);
                  }}
                  placeholder="e.g. University of Lagos"
                  disabled={creating}
                  autoFocus
                  className={inputClass}
                />
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-bold text-slate-800">
                  Thematic areas
                </legend>
                <p className="text-xs font-medium text-slate-600">
                  Select all areas this institution covers.
                </p>
                <ul className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  {THEMATIC_AREA_OPTIONS.map((area) => {
                    const checked = selectedThematicAreas.includes(area);
                    const id = `thematic-area-${area.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                    return (
                      <li key={area}>
                        <label
                          htmlFor={id}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition ${
                            checked
                              ? "bg-[#e8f0ff] text-[#062763]"
                              : "text-slate-900 hover:bg-white"
                          } ${creating ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            disabled={creating}
                            onChange={() => toggleThematicArea(area)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#062763] focus:ring-[#062763]/25"
                          />
                          <span>{area}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>

              {createError && (
                <p className="text-sm font-semibold text-red-700" role="alert">
                  {createError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="rounded-lg border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-[#062763] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#062763]/90 disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
