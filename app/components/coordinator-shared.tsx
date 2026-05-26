import {
  applicantDisplayName,
  COORDINATOR_APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationRecord,
  type ApplicationStatus,
} from "@/lib/application-types";

const disadvantagedLabels: Record<string, string> = {
  disadvantagedFinancially: "Financially disadvantaged background",
  disadvantagedDisability: "Disability",
  disadvantagedRefugee: "Refugee/displaced person",
  disadvantagedConflict: "Conflict-affected region",
  disadvantagedMinority: "Minority/underrepresented community",
  disadvantagedOther: "Other",
};

export function formatDisadvantaged(app: ApplicationRecord): string {
  const items = Object.entries(disadvantagedLabels)
    .filter(([key]) => app[key as keyof ApplicationRecord])
    .map(([, label]) => label);
  if (app.disadvantagedOther && app.disadvantagedOtherSpecify) {
    const i = items.indexOf("Other");
    if (i !== -1) items[i] = `Other: ${app.disadvantagedOtherSpecify}`;
  }
  return items.join("; ") || "—";
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    draft: "bg-slate-200 text-slate-800",
    pending: "bg-amber-200 text-amber-950",
    under_review: "bg-sky-200 text-sky-950",
    approved: "bg-emerald-200 text-emerald-950",
    rejected: "bg-red-200 text-red-950",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 sm:grid-cols-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-800">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-950 sm:col-span-2">
        {value || "—"}
      </dd>
    </div>
  );
}

export function ApplicationDetailPanel({
  selected,
  updatingStatus,
  onStatusChange,
}: {
  selected: ApplicationRecord;
  updatingStatus: boolean;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  return (
    <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#062763]">
            {applicantDisplayName(selected) || "—"}
          </h2>
          <p className="text-sm font-semibold text-slate-900">{selected.id}</p>
        </div>
        <StatusBadge status={selected.status} />
      </div>

      <div className="mt-4">
        <label className="block text-xs font-bold text-slate-800">
          Update status
        </label>
        <select
          value={selected.status}
          disabled={updatingStatus}
          onChange={(e) =>
            onStatusChange(selected.id, e.target.value as ApplicationStatus)
          }
          className="mt-1 w-full rounded-lg border-2 border-[#062763]/30 bg-white px-3 py-2 text-sm font-semibold text-[#062763] outline-none focus:border-[#062763] focus:ring-2 focus:ring-[#062763]/15 disabled:opacity-50"
        >
          {COORDINATOR_APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-900">
        Submitted {formatDate(selected.submittedAt)} · Updated{" "}
        {formatDate(selected.updatedAt)}
      </p>

      <section className="mt-6">
        <h3 className="text-sm font-extrabold text-[#062763]">Registration</h3>
        <dl>
          <DetailRow label="Email" value={selected.email} />
          <DetailRow label="Nationality" value={selected.nationality} />
          <DetailRow
            label="Country of residence"
            value={selected.countryOfResidence}
          />
          <DetailRow label="Region" value={selected.region} />
        </dl>
      </section>

      <section className="mt-4">
        <h3 className="text-sm font-extrabold text-[#062763]">Section A — Mobility</h3>
        <dl>
          <DetailRow label="Type of mobility" value={selected.typeOfMobility} />
          <DetailRow label="Thematic area" value={selected.thematicArea} />
          <DetailRow
            label="Host institution"
            value={selected.preferredHostInstitution}
          />
          <DetailRow
            label="Programme"
            value={selected.proposedAcademicProgramme}
          />
        </dl>
      </section>

      <section className="mt-4">
        <h3 className="text-sm font-extrabold text-[#062763]">Section B — Personal</h3>
        <dl>
          <DetailRow label="Gender" value={selected.gender} />
          <DetailRow label="Date of birth" value={selected.dateOfBirth} />
          <DetailRow label="State / province" value={selected.stateProvince} />
          <DetailRow label="Home address" value={selected.homeAddress} />
          <DetailRow label="Personal email" value={selected.personalEmail} />
          <DetailRow label="Phone" value={selected.phoneNumber} />
          <DetailRow label="Passport / ID" value={selected.passportOrIdNumber} />
          <DetailRow
            label="ID document"
            value={selected.passportFileName ?? "Not uploaded"}
          />
          <DetailRow label="Next of kin" value={selected.nextOfKinName} />
        </dl>
      </section>

      <section className="mt-4">
        <h3 className="text-sm font-extrabold text-[#062763]">Section C — Inclusion</h3>
        <dl>
          <DetailRow
            label="Disadvantaged group"
            value={selected.belongsToDisadvantagedGroup}
          />
          {selected.belongsToDisadvantagedGroup === "Yes" && (
            <>
              <DetailRow
                label="Categories"
                value={formatDisadvantaged(selected)}
              />
              <DetailRow
                label="Supporting doc"
                value={selected.disadvantagedDocFileName ?? "Not uploaded"}
              />
            </>
          )}
        </dl>
      </section>
    </div>
  );
}
