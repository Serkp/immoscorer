import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

/* Öffentliche Hülle für den Wissens-Bereich (außerhalb des eingeloggten
   App-Shells). Eigener Header + Footer, damit /wissen als öffentliche,
   indexierbare Marketing-/Content-Seite funktioniert. */
export default function WissenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
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

      {/* Content */}
      <main
        className="mx-auto px-4 md:px-5 py-8 md:py-12"
        style={{ maxWidth: 1100 }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="px-5 py-8" style={{ borderTop: `1px solid ${C.border}` }}>
        <div
          className="mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ maxWidth: 1100 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <AIOrb size={20} />
            <span className="text-sm font-semibold" style={{ color: C.text }}>
              ImmoScorer
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/wissen"
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: C.sub }}
            >
              Wissensbereich
            </Link>
            <Link
              href="/"
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: C.sub }}
            >
              Immobilie analysieren
            </Link>
          </nav>
          <p className="text-xs" style={{ color: C.dim }}>
            © 2026 ImmoScorer
          </p>
        </div>
      </footer>
    </div>
  );
}
