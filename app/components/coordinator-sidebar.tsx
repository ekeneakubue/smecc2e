"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isDashboardNavActive, type CoordinatorNavId } from "@/lib/coordinator-nav";
import { useDashboardPortal } from "./dashboard-portal-provider";

function NavIcon({ section }: { section: CoordinatorNavId }) {
  const className = "h-5 w-5 shrink-0";
  switch (section) {
    case "overview":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "users":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "regions":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "institutions":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "applicants":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "scholars":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    case "programs":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
  }
}

export function CoordinatorSidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const { basePath, label, nav } = useDashboardPortal();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as {
          user?: { name: string; role: string };
        };
        if (data.user) setSessionUser(data.user);
      })
      .catch(() => undefined);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  const section = isHydrated ? searchParams.get("section") : null;

  const close = () => {
    setSidebarOpen(false);
    onNavigate?.();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-200 bg-white p-2 text-[#062763] shadow-sm lg:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-white/10 bg-[#062763] text-white transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="relative h-10 w-10 shrink-0 rounded-lg bg-white p-1">
            <Image
              src="/images/logo1.png"
              alt="SMECC2E"
              fill
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#f7be2a]">
              SMECC2E
            </p>
            <p className="text-sm font-bold leading-tight text-white">{label}</p>
          </div>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label="Dashboard"
        >
          {nav.map((item) => {
            const active = isDashboardNavActive(
              item.id,
              pathname,
              section,
              basePath
            );
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={close}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[#f7be2a] text-[#062763]"
                    : "text-white hover:bg-white/15"
                }`}
              >
                <NavIcon section={item.id} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-white/10 px-4 py-4">
          {sessionUser && (
            <div className="rounded-lg bg-white/10 px-3 py-2.5">
              <p className="truncate text-sm font-semibold text-white">
                {sessionUser.name}
              </p>
              <p className="text-xs text-[#f7be2a]">{sessionUser.role}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              close();
              void handleLogout();
            }}
            disabled={loggingOut}
            className="block w-full rounded-lg border border-[#f7be2a]/50 px-3 py-2 text-center text-xs font-semibold text-[#f7be2a] transition hover:bg-[#f7be2a] hover:text-[#062763] disabled:opacity-50"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href="/application"
            onClick={close}
            className="block rounded-lg border border-white/30 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Application form
          </Link>
          <Link
            href="/"
            onClick={close}
            className="block rounded-lg px-3 py-2 text-center text-xs font-semibold text-white/95 transition hover:bg-white/15 hover:text-white"
          >
            Public site
          </Link>
        </div>
      </aside>
    </>
  );
}
