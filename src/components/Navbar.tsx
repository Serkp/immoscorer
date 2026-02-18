"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold cursor-pointer transition-all"
            style={{
              background: menuOpen ? C.surface3 : C.surface2,
              color: C.sub,
              border: `1px solid ${menuOpen ? C.borderHover : C.border}`,
            }}
          >
            {initials || "U"}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 shadow-xl animate-fade-up"
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
              }}
            >
              {/* User info */}
              <div className="px-3 py-2 border-b" style={{ borderColor: C.border }}>
                <p className="text-xs font-semibold truncate" style={{ color: C.text }}>
                  {user?.user_metadata?.full_name || "Benutzer"}
                </p>
                <p className="text-[11px] truncate" style={{ color: C.dim }}>
                  {user?.email}
                </p>
              </div>

              <button
                disabled
                className="w-full text-left px-3 py-2 text-xs transition-colors opacity-40 cursor-not-allowed"
                style={{ color: C.sub }}
              >
                Abo verwalten
              </button>

              <div className="mx-3 h-px" style={{ background: C.border }} />

              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                }}
                className="w-full text-left px-3 py-2 text-xs transition-colors hover:opacity-80"
                style={{ color: C.red }}
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
