"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/analysis", label: "Analyse" },
  { href: "/properties", label: "Meine Immobilien" },
  { href: "/compare", label: "Vergleich" },
  { href: "/strategies", label: "Strategien" },
  { href: "/guide", label: "Wissensbereich" },
  { href: "/assistant", label: "KI-Assistent" },
  { href: "/expose", label: "Expos\u00E9-Analyse" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href="/" className="text-lg font-bold tracking-tight text-[var(--fg)]">
          Immo<span className="text-[var(--accent)]">Scorer</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--accent-light)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-slate-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
