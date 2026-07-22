import type { ReactNode } from "react";
import Link from "next/link";
import { C } from "@/lib/theme";

/* Eigene, leichte Chrome für den öffentlichen Rechner-Bereich — server-gerendert,
   crawlbare interne Links (analog zu /kapitalanlage und /wissen). */

const NAV = [
  { href: "/analysis", label: "Tool" },
  { href: "/rendite-rechner", label: "Renditerechner" },
  { href: "/check", label: "Sprach-Check" },
  { href: "/besichtigung", label: "Besichtigung" },
  { href: "/kapitalanlage", label: "Kapitalanlage" },
  { href: "/wissen", label: "Wissen" },
];

const LEGAL = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
];

export default function RechnerLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(8,9,14,.82)", backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: C.text, textDecoration: "none" }}>
            Immo<span style={{ color: C.accent }}>Scorer</span>
          </Link>
          <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 14, color: C.sub, textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer style={{ borderTop: `1px solid ${C.border}`, marginTop: 40 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
          <span style={{ color: C.dim, fontSize: 13 }}>© {new Date().getFullYear()} ImmoScorer</span>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, color: C.sub, textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
