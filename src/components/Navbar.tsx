"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { getAnalyses } from "@/lib/db";
import { C } from "@/lib/theme";

const NAV = [
  { href: "/analysis", label: "Analyse" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/compare", label: "Vergleich" },
  { href: "/strategies", label: "Strategien" },
  { href: "/guide", label: "Wissen" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
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

  // Load compare count
  useEffect(() => {
    if (!user) { setCompareCount(0); return; }
    getAnalyses(user.id, { status: "saved", saveType: "comparison" })
      .then((data) => setCompareCount(data?.length || 0))
      .catch(() => {});
  }, [user, pathname]);

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
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
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
                className="relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap"
                style={{
                  background: active ? C.surface3 : "transparent",
                  color: active ? C.text : C.sub,
                }}
              >
                {n.label}
                {n.href === "/compare" && compareCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold px-1"
                    style={{ background: C.accent, color: "#fff" }}
                  >
                    {compareCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Anmelden button (only when not logged in) */}
        {!user && (
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-all hover:opacity-80"
            style={{
              background: C.accentDim,
              color: C.accent,
              border: "1px solid rgba(124,106,255,0.3)",
            }}
          >
            Anmelden
          </button>
        )}

        {/* Auth Modal */}
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />

        {/* Avatar + Dropdown (only when logged in) */}
        {user ? (
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
        ) : null}
      </div>
    </nav>
  );
}
