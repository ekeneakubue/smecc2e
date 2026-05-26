"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = {
  id: string;
  label: string;
};

export function MobileNav({
  links,
  hrefMap,
}: {
  links: readonly NavLink[];
  hrefMap?: Record<string, string>;
}) {
  const getHref = (id: string) => hrefMap?.[id] ?? `#${id}`;
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
      >
        {open ? (
          <svg
            aria-hidden
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            aria-hidden
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-nav-menu"
          aria-label="Page sections"
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] rounded-xl border border-white/15 bg-[#062763] p-2"
        >
          {links.map((link) =>
            hrefMap ? (
              <Link
                key={link.id}
                href={getHref(link.id)}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-[#f7d46b]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.id}
                href={getHref(link.id)}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-[#f7d46b]"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
