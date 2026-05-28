import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#062763] px-4 py-8 text-white sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-4 sm:grid-cols-3">
          <p className="text-center text-xs font-medium text-white/70 sm:text-left sm:text-sm">
            Funded by the European Union
          </p>
          <div className="flex justify-center">
            <Image
              src="/images/brands.png"
              alt="Partner brands"
              width={380}
              height={80}
              className="h-auto w-auto max-h-16 object-contain sm:max-h-20"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <Link
            href="/login"
            className="mx-auto shrink-0 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:border-[#f7be2a]/60 hover:bg-[#f7be2a] hover:text-[#062763] focus:outline-none focus:ring-2 focus:ring-[#f7be2a]/50 sm:ml-auto sm:mr-0 sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-[0.15em]"
          >
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
