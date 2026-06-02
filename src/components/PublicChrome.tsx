import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

/* Geteilte öffentliche Kopf- und Fußzeile für Wissens- und Rechtsseiten. */

export function PublicHeader() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: C.navBg,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-4 md:px-5 py-3"
        style={{ maxWidth: 1100 }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <AIOrb size={26} active />
          <span className="text-base font-bold" style={{ color: C.text }}>
            ImmoScorer
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/wissen"
            className="hidden sm:inline text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: C.sub }}
          >
            Wissen
          </Link>
          <Link
            href="/"
            className="text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            Kostenlos starten
          </Link>
        </nav>
      </div>
    </header>
  );
}

const FOOTER_LINKS = [
  { href: "/wissen", label: "Wissen" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerruf" },
];

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="px-5 py-8" style={{ borderTop: `1px solid ${C.border}` }}>
      <div
        className="mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        style={{ maxWidth: 1100 }}
      >
        <Link href="/" className="flex items-center gap-2">
          <AIOrb size={20} />
          <span className="text-sm font-semibold" style={{ color: C.text }}>
            ImmoScorer
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: C.sub }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs" style={{ color: C.dim }}>
          © {year} ImmoScorer
        </p>
      </div>
    </footer>
  );
}
