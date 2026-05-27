import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#062763] px-4 py-8 text-white sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-left text-xs font-medium text-white/70 sm:text-sm">
            Funded by the European Union
          </p>
          <Link
            href="/login"
            className="shrink-0 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#f7be2a]/60 hover:bg-[#f7be2a] hover:text-[#062763] focus:outline-none focus:ring-2 focus:ring-[#f7be2a]/50 sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-[0.15em]"
          >
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
