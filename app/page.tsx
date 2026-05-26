import Image from "next/image";
import { MobileNav } from "./components/mobile-nav";
import { ScrollToTop } from "./components/scroll-to-top";

const purposeItems = [
  "Scholarships & mobility",
  "Academic supervision",
  "Financial transactions",
  "Project management",
  "Reporting & compliance",
  "Dissemination & stakeholder engagement",
];

const strategicObjectives = [
  "Ensure EU audit-compliant transparency",
  "Enable real-time monitoring of mobility and scholarships",
  "Improve cross-institution collaboration",
  "Automate reporting and reduce administrative burden",
  "Track long-term impact (alumni + tracer studies)",
];

const expectedOutcomes = [
  "Fully digital scholarship lifecycle",
  "Real-time mobility tracking",
  "Automated financial and audit reporting",
  "Centralized knowledge repository",
  "Alumni tracking system",
];

const sectionLinks = [
  { id: "background", label: "Background" },
  { id: "purpose", label: "Purpose" },
  { id: "objectives", label: "Objectives" },
  { id: "scope", label: "Scope" },
  { id: "outcomes", label: "Outcomes" },
] as const;

export default function Home() {
  return (
    <main className="bg-white text-slate-800">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#062763] text-white">
        <div className="relative mx-auto max-w-6xl px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <ProjectLogo />
            <DesktopNav />
            <div className="flex items-center gap-2 sm:gap-3">
              <MobileNav links={sectionLinks} />
              <EuLogo />
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10 bg-[#062763] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(247,190,42,0.2),transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl text-center">
            <p className="mb-3 inline-block rounded-full border border-[#f7be2a]/40 bg-[#f7be2a]/15 px-2 py-1 text-[#f7d46b] sm:mb-4 sm:px-4 sm:py-2">
              <span className="text-[0.5rem] font-bold uppercase leading-snug tracking-[0.1em] sm:hidden">
                EU-Supported Capacity Building Programme
              </span>
              <span className="hidden text-xs font-bold uppercase tracking-[0.3em] sm:inline">
                EU-Supported Capacity Building Programme
              </span>
            </p>
            <h1 className="text-balance text-2xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              <span className="sm:hidden">SMECC2E Integrated Mobility, Scholarship, Project &amp;
              Knowledge Management Portal</span>
              <span className="hidden sm:inline">
                SMECC2E Integrated Mobility, Scholarship, Project &amp;
                Knowledge Management Portal
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-blue-50/85 sm:mt-6 sm:text-lg sm:leading-8">
              <span className="sm:hidden">
                Secure portal for scholarships, mobility, finance, reporting,
                and consortium collaboration.
              </span>
              <span className="hidden sm:inline">
                A secure, auditable, and scalable integrated portal for
                scholarships, mobility, academic tracking, financial
                accountability, reporting, and dissemination across the
                consortium.
              </span>
            </p>
            <a
              href="/application"
              className="mt-6 inline-block rounded-full bg-[#f7be2a] px-6 py-2.5 text-xs font-extrabold uppercase tracking-[0.15em] text-[#062763] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#f7be2a]/40 sm:mt-8 sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
            >
              Start Application
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-10 sm:space-y-8 sm:px-8 sm:py-16">
        <ContentSection id="background" title="Background" variant="blue">
          <p className="text-sm leading-7 text-blue-50/90 sm:text-lg sm:leading-8">
            <span className="sm:hidden">
              EU-supported programme unifying scholarships, mobility, academic
              tracking, finance, and reporting.
            </span>
            <span className="hidden sm:inline">
              SMECC2E is a multi-partner EU-supported capacity building and
              mobility programme requiring a unified digital ecosystem to manage
              scholarships, mobility, academic tracking, financial accountability,
              reporting, and dissemination.
            </span>
          </p>
        </ContentSection>

        <ContentSection id="purpose" title="Purpose" variant="muted">
          <p className="mb-4 text-sm leading-7 text-slate-600 sm:mb-6 sm:text-lg sm:leading-8">
            <span className="sm:hidden">
              End-to-end portal lifecycle management for:
            </span>
            <span className="hidden sm:inline">
              To develop a secure, auditable, and scalable integrated portal that
              supports end-to-end lifecycle management of:
            </span>
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            {purposeItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#f7be2a]" />
                {item}
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="objectives" title="Strategic Objectives" variant="default">
          <ul className="space-y-2 sm:space-y-3">
            {strategicObjectives.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:gap-4 sm:p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#062763] text-xs font-black text-white sm:h-9 sm:w-9 sm:text-sm">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-xs leading-6 text-slate-600 sm:pt-1 sm:text-base sm:leading-7">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </ContentSection>

        <ContentSection id="scope" title="Scope" variant="blue">
          <p className="text-sm leading-7 text-blue-50/90 sm:text-lg sm:leading-8">
            <span className="sm:hidden">
              All consortium institutions, hosts, students, staff, evaluators,
              and stakeholders.
            </span>
            <span className="hidden sm:inline">
              Covers all consortium institutions, third-party internship hosts,
              students, staff, evaluators, and external stakeholders.
            </span>
          </p>
        </ContentSection>

        <ContentSection id="outcomes" title="Expected Outcomes" variant="blue">
          <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {expectedOutcomes.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#f7be2a]/40 bg-white/10 px-3 py-3 text-xs font-medium leading-5 text-white sm:px-4 sm:py-4 sm:text-base sm:leading-6"
              >
                {item}
              </li>
            ))}
          </ul>
        </ContentSection>
      </div>

      <footer className="border-t border-white/10 bg-[#062763] px-4 py-6 text-center text-white sm:py-8">
        <p className="text-xs font-medium text-white/70 sm:text-sm">
          Funded by the European Union
        </p>
      </footer>

      <ScrollToTop />
    </main>
  );
}

function DesktopNav() {
  return (
    <nav
      aria-label="Page sections"
      className="hidden flex-1 justify-center gap-2 md:flex lg:gap-4"
    >
      {sectionLinks.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          className="shrink-0 rounded-2xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-[#f7be2a]/50 hover:bg-white/10 hover:text-[#f7d46b] lg:text-sm"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function ContentSection({
  id,
  title,
  variant,
  children,
}: {
  id: string;
  title: string;
  variant: "default" | "muted" | "blue";
  children: React.ReactNode;
}) {
  const variants = {
    default: "border-slate-200 bg-white",
    muted: "border-slate-200 bg-slate-50",
    blue: "border-white/15 bg-[#062763] text-white",
  };

  const isBlue = variant === "blue";

  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-2xl border p-4 sm:scroll-mt-32 sm:p-8 lg:p-10 ${variants[variant]}`}
    >
      <div
        className={`mb-4 flex flex-wrap items-center gap-3 border-b pb-4 sm:mb-6 sm:gap-4 sm:pb-5 ${isBlue ? "border-white/15" : "border-slate-100"}`}
      >
        <h2
          className={`text-xl font-black sm:text-3xl ${isBlue ? "text-white" : "text-[#062763]"}`}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ProjectLogo() {
  return (
    <div className="relative h-14 w-[3.5rem] shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 sm:h-20 sm:w-[5.05rem] sm:rounded-xl sm:p-2 md:h-24 md:w-[6.06rem] lg:h-28 lg:w-[7.07rem]">
      <Image
        src="/images/logo1.png"
        alt="SMECC2E logo"
        fill
        className="object-contain p-0.5 sm:p-1"
        sizes="(max-width: 640px) 56px, (max-width: 1024px) 96px, 112px"
        priority
      />
    </div>
  );
}

function EuLogo() {
  return (
    <div className="relative h-14 w-[3.75rem] shrink-0 rounded-lg border border-slate-200 bg-white p-1.5 sm:h-20 sm:w-[5.4rem] sm:rounded-xl sm:p-2 md:h-24 md:w-[6.48rem] lg:h-28 lg:w-[7.56rem]">
      <Image
        src="/images/logo2.png"
        alt="European Union funding logo"
        fill
        className="object-contain p-0.5 sm:p-1"
        sizes="(max-width: 640px) 60px, (max-width: 1024px) 103px, 121px"
        priority
      />
    </div>
  );
}
