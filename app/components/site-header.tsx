import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

type NavLink = { id: string; label: string };

export function SiteHeader({
  sectionLinks,
  active = "home",
}: {
  sectionLinks?: readonly NavLink[];
  active?: "home" | "application";
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#062763] text-white">
      <div className="relative mx-auto max-w-6xl px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <ProjectLogo />
          </Link>

          {sectionLinks ? (
            <nav
              aria-label="Page sections"
              className="hidden flex-1 justify-center gap-2 md:flex lg:gap-4"
            >
              {sectionLinks.map((link) => (
                <a
                  key={link.id}
                  href={`/#${link.id}`}
                  className="shrink-0 rounded-2xl border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-[#f7be2a]/50 hover:bg-white/10 hover:text-[#f7d46b] lg:text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : (
            <nav
              aria-label="Main navigation"
              className="hidden flex-1 justify-center gap-2 md:flex"
            >
              <NavPill href="/" active={active === "home"}>
                Home
              </NavPill>
              <NavPill href="/application" active={active === "application"}>
                Application
              </NavPill>
            </nav>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {sectionLinks ? (
              <MobileNav links={sectionLinks} />
            ) : (
              <MobileNav
                links={[
                  { id: "home", label: "Home" },
                  { id: "application", label: "Application" },
                ]}
                hrefMap={{ home: "/", application: "/application" }}
              />
            )}
            <EuLogo />
          </div>
        </div>
      </div>
    </header>
  );
}

function NavPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-2xl border px-3 py-1.5 text-xs font-semibold transition lg:text-sm ${
        active
          ? "border-[#f7be2a]/50 bg-white/15 text-[#f7d46b]"
          : "border-white/20 text-white/85 hover:border-[#f7be2a]/50 hover:bg-white/10 hover:text-[#f7d46b]"
      }`}
    >
      {children}
    </Link>
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
