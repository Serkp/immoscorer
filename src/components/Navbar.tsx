"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";

// Login-frei: alle Tools sind kostenlos und ohne Account nutzbar.
const NAV = [
  { href: "/analysis", label: "Analyse" },
  { href: "/rendite-rechner", label: "Renditerechner" },
  { href: "/check", label: "Sprach-Check" },
  { href: "/besichtigung", label: "Besichtigung" },
  { href: "/kapitalanlage", label: "Kapitalanlage" },
  { href: "/wissen", label: "Wissen" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Mobile-Menü bei Routenwechsel schließen
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Body-Scroll sperren, wenn Mobile-Menü offen
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: C.navBg, borderColor: C.border }}>
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <AIOrb size={26} active />
            <span className="text-sm font-bold tracking-tight" style={{ color: C.text }}>ImmoScorer</span>
          </Link>

          <div className="hidden md:block h-5 w-px shrink-0" style={{ background: C.border }} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
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

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile: Hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-all"
            style={{ color: C.sub }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menü öffnen"
          >
            {mobileOpen ? (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile slide-in */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[90] md:hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 right-0 z-[100] md:hidden h-full w-[280px] flex flex-col"
            style={{ background: C.bg2, borderLeft: `1px solid ${C.border}`, boxShadow: "-8px 0 32px rgba(0,0,0,0.4)", animation: "slideInRight 0.25s ease-out" }}>
            <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <span className="text-sm font-bold" style={{ color: C.text }}>ImmoScorer</span>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              {NAV.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                return (
                  <Link key={n.href} href={n.href}
                    className="flex items-center h-12 px-5 text-[15px] font-medium transition-colors"
                    style={{ color: active ? C.text : C.sub, background: active ? C.surface2 : "transparent", borderLeft: active ? `3px solid ${C.accent}` : "3px solid transparent" }}
                    onClick={() => setMobileOpen(false)}>
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
      style={{ color: C.dim }}
      title={theme === "dark" ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
    >
      {theme === "dark" ? (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
