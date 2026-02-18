"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

const NAV = [
  { href: "/analysis", label: "Analyse" },
  { href: "/properties", label: "Immobilien" },
  { href: "/compare", label: "Vergleich" },
  { href: "/strategies", label: "Strategien" },
  { href: "/guide", label: "Wissen" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        background: "rgba(8,9,14,0.85)",
        borderColor: C.border,
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5">
        {/* Brand */}
        <Link href="/analysis" className="flex items-center gap-2.5 shrink-0">
          <AIOrb size={26} active />
          <span className="text-sm font-bold tracking-tight" style={{ color: C.text }}>
            ImmoScorer
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px shrink-0" style={{ background: C.border }} />

        {/* Nav items */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap"
                style={{
                  background: active ? C.surface3 : "transparent",
                  color: active ? C.text : C.sub,
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* PRO pill */}
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide"
          style={{
            background: C.greenDim,
            color: C.green,
            border: `1px solid ${C.greenBorder}`,
          }}
        >
          PRO
        </span>

        {/* Avatar */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
          style={{ background: C.surface3, color: C.sub }}
        >
          U
        </div>
      </div>
    </nav>
  );
}
