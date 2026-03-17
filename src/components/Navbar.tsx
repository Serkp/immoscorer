"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { C } from "@/lib/theme";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analysis", label: "Analyse" },
  { href: "/expose-analyse", label: "Exposé-Analyse" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/compare", label: "Vergleich" },
  { href: "/financing", label: "Finanzierung" },
  { href: "/strategies", label: "Strategien" },
  { href: "/wissen", label: "Wissen" },
  { href: "/ki-berater", label: "KI-Berater" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s: string) => s[0]?.toUpperCase())
    .join("");

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: "rgba(8,9,14,0.85)", borderColor: C.border }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-5">
          {/* Brand */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 shrink-0">
            <AIOrb size={26} active />
            <span className="text-sm font-bold tracking-tight" style={{ color: C.text }}>ImmoScorer</span>
          </Link>

          <div className="hidden md:block h-5 w-px shrink-0" style={{ background: C.border }} />

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href}
                  className="relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap"
                  style={{ background: active ? C.surface3 : "transparent", color: active ? C.text : C.sub }}>
                  {n.label}
                </Link>
              );
            })}
          </div>

          <div className="flex-1" />

          {/* Anmelden button */}
          {!user && (
            <button onClick={() => setShowAuthModal(true)}
              className="rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition-all hover:opacity-80"
              style={{ background: C.accentDim, color: C.accent, border: "1px solid rgba(124,106,255,0.3)" }}>
              Anmelden
            </button>
          )}

          <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />

          {/* Desktop Avatar + Dropdown */}
          {user ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold cursor-pointer transition-all"
                style={{ background: menuOpen ? C.surface3 : C.surface2, color: C.sub, border: `1px solid ${menuOpen ? C.borderHover : C.border}` }}>
                {initials || "U"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl py-1 shadow-xl animate-fade-up"
                  style={{ background: C.bg2, border: `1px solid ${C.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.4)` }}>
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <p className="text-xs font-semibold truncate" style={{ color: C.text }}>
                      {user?.user_metadata?.full_name || "Benutzer"}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: C.dim }}>{user?.email}</p>
                  </div>
                  <div className="py-1" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <DropdownItem href="/settings/profile" label="Profil" icon="user" onClick={() => setMenuOpen(false)} />
                    <DropdownItem href="/settings" label="Einstellungen" icon="settings" onClick={() => setMenuOpen(false)} />
                    <DropdownItem href="/settings/security" label="Sicherheit" icon="lock" onClick={() => setMenuOpen(false)} />
                  </div>
                  <div className="py-1">
                    <button onClick={async () => { setMenuOpen(false); await signOut(); window.location.href = "/"; }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-all rounded-lg mx-0"
                      style={{ color: C.red }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.surface; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Mobile: Avatar + Hamburger */}
          {user && (
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-all"
              style={{ color: C.sub }}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menü öffnen"
            >
              {mobileOpen ? (
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90] md:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed top-0 right-0 z-[100] md:hidden h-full w-[280px] flex flex-col"
            style={{
              background: C.bg2,
              borderLeft: `1px solid ${C.border}`,
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
              animation: "slideInRight 0.25s ease-out",
            }}
          >
            {/* User info header */}
            <div className="px-5 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: C.surface3, color: C.text, border: `1px solid ${C.border}` }}
                >
                  {initials || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: C.text }}>
                    {user?.user_metadata?.full_name || "Benutzer"}
                  </p>
                  <p className="text-xs truncate" style={{ color: C.dim }}>{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-3">
              {NAV.map((n) => {
                const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="flex items-center h-12 px-5 text-[15px] font-medium transition-colors"
                    style={{
                      color: active ? C.text : C.sub,
                      background: active ? C.surface2 : "transparent",
                      borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {n.label}
                  </Link>
                );
              })}

              <div className="my-3 mx-5 h-px" style={{ background: C.border }} />

              <Link
                href="/settings/profile"
                className="flex items-center h-12 px-5 text-[15px] font-medium transition-colors"
                style={{ color: C.sub }}
                onClick={() => setMobileOpen(false)}
              >
                Profil
              </Link>
              <Link
                href="/settings"
                className="flex items-center h-12 px-5 text-[15px] font-medium transition-colors"
                style={{ color: C.sub }}
                onClick={() => setMobileOpen(false)}
              >
                Einstellungen
              </Link>
              <Link
                href="/settings/security"
                className="flex items-center h-12 px-5 text-[15px] font-medium transition-colors"
                style={{ color: C.sub }}
                onClick={() => setMobileOpen(false)}
              >
                Sicherheit
              </Link>
            </div>

            {/* Logout at bottom */}
            <div className="px-5 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={async () => {
                  setMobileOpen(false);
                  await signOut();
                  window.location.href = "/";
                }}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all"
                style={{ color: C.red, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Abmelden
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DropdownItem({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick: () => void }) {
  const iconSvg = icon === "user" ? (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ) : icon === "settings" ? (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
  ) : (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
  );

  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-xs transition-all rounded-lg"
      style={{ color: C.sub }}
      onMouseEnter={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.sub; }}>
      {iconSvg}
      {label}
    </Link>
  );
}
