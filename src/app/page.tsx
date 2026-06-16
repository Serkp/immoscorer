"use client";

import { useState, useEffect, useRef, Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { C } from "@/lib/theme";
import { useTheme } from "@/lib/ThemeContext";

/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
}

/* ════════════════════════════════════════════
   SVG ICONS (inline, lightweight)
   ════════════════════════════════════════════ */

const Icons = {
  clock: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  chart: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 5-8" />
    </svg>
  ),
  folder: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  user: (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  score: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 1.5" />
    </svg>
  ),
  bulb: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M9 21h6M12 3a6 6 0 014 10.5V17H8v-3.5A6 6 0 0112 3z" />
    </svg>
  ),
  bank: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  ),
  mapPin: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  layers: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  book: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
    </svg>
  ),
  ai: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.cyan} strokeWidth={1.6}>
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
    </svg>
  ),
  trend: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.cyan} strokeWidth={1.6}>
      <path d="M3 17l6-6 4 4 8-8M17 7h4v4" />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.cyan} strokeWidth={1.6}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  check: (c: string) => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={c} strokeWidth={2.4}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.red} strokeWidth={2.4} opacity={0.5}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  chevron: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  input: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M4 6h16M4 12h10M4 18h6" />
    </svg>
  ),
  zap: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  rocket: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={1.6}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3M22 2l-7.5 7.5" />
      <path d="M9.59 9.41A10 10 0 015 3c-1.5 5-3 8-3 8l5 5s3-1.5 8-3a10 10 0 01-5.41-3.59z" />
    </svg>
  ),
};

/* ════════════════════════════════════════════
   FAQ ACCORDION ITEM
   ════════════════════════════════════════════ */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
        style={{ color: C.text }}
      >
        <span className="text-[15px] font-semibold pr-4">{q}</span>
        <span
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            flexShrink: 0,
            color: C.sub,
          }}
        >
          {Icons.chevron}
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? "200px" : "0",
          opacity: open ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease, opacity 0.3s ease",
        }}
      >
        <p className="pb-5 text-sm leading-relaxed" style={{ color: C.sub }}>
          {a}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MINI RECHNER
   ════════════════════════════════════════════ */

function MiniRechner({ onCta }: { onCta: () => void }) {
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");

  const p = parseFloat(price.replace(/\./g, "").replace(",", "."));
  const r = parseFloat(rent.replace(/\./g, "").replace(",", "."));
  const hasResult = p > 0 && r > 0;

  const yearly = r * 12;
  const rendite = hasResult ? (yearly / p) * 100 : 0;
  const faktor = hasResult ? p / yearly : 0;

  const ratingColor =
    rendite >= 5 ? C.green : rendite >= 4 ? C.blue : rendite >= 3 ? C.amber : C.red;
  const ratingLabel =
    rendite >= 5
      ? "Hervorragend"
      : rendite >= 4
        ? "Gut"
        : rendite >= 3
          ? "Moderat"
          : "Kritisch";
  const ratingBg =
    rendite >= 5
      ? C.greenDim
      : rendite >= 4
        ? "rgba(76,154,255,0.12)"
        : rendite >= 3
          ? C.amberDim
          : C.redDim;

  return (
    <div
      className="w-full rounded-2xl p-5 md:p-6"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <AIOrb size={24} active />
        <span className="text-sm font-bold" style={{ color: C.text }}>
          Schnell-Check
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: C.sub }}>
        2 Zahlen eingeben — sofort wissen ob sich&apos;s lohnt.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.sub }}>
            Kaufpreis (€)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="185.000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm"
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              color: C.text,
            }}
          />
        </div>
        <div>
          <label className="text-[11px] font-medium mb-1.5 block" style={{ color: C.sub }}>
            Kaltmiete (€/Mon.)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="680"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm"
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              color: C.text,
            }}
          />
        </div>
      </div>

      {/* Results or placeholder */}
      {hasResult ? (
        <div style={{ animation: "fadeUp 0.35s ease both" }}>
          {/* Metric boxes */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              {
                label: "Bruttorendite",
                value: rendite.toFixed(2) + " %",
                good: rendite >= 4,
              },
              {
                label: "Faktor",
                value: faktor.toFixed(1) + " \u00D7",
                good: faktor <= 25,
              },
              {
                label: "Jahresmiete",
                value: fmt(yearly) + " \u20AC",
                good: true,
              },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: C.surface2,
                  border: `1px solid ${m.good ? C.greenBorder : C.amberBorder}`,
                }}
              >
                <div className="text-[10px] font-medium mb-1" style={{ color: C.sub }}>
                  {m.label}
                </div>
                <div className="text-sm font-bold" style={{ color: m.good ? C.green : C.amber }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div
            className="rounded-xl p-3 flex items-center gap-3 mb-4"
            style={{ background: ratingBg, border: `1px solid ${ratingColor}22` }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: `${ratingColor}22`, color: ratingColor }}
            >
              {rendite.toFixed(0)}%
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: ratingColor }}>
                {ratingLabel}
              </div>
              <div className="text-[11px]" style={{ color: C.sub }}>
                Bruttorendite-Einschätzung
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onCta}
            className="block w-full text-center rounded-xl py-2.5 text-sm font-bold transition-all"
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            Vollständige Analyse starten &rarr;
          </button>
          <p className="text-center text-[11px] mt-2" style={{ color: C.dim }}>
            Unbegrenzt kostenlos &middot; kein Account nötig
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: C.surface2, border: `1px solid ${C.border}` }}
        >
          <p className="text-xs leading-relaxed" style={{ color: C.dim }}>
            Geben Sie Kaufpreis und Miete ein — sofortige Einschätzung in Echtzeit
          </p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   LANDING PAGE
   ════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <AuthProvider>
      <Suspense>
        <LandingContent />
      </Suspense>
      <LandingFooter />
    </AuthProvider>
  );
}

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [showAuthModal, setShowAuthModal] = useState(resetSuccess);
  const { theme, toggle } = useTheme();

  // Auto-open modal when ?reset=success is in URL
  useEffect(() => {
    if (resetSuccess) {
      setShowAuthModal(true);
    }
  }, [resetSuccess]);

  function handleCta() {
    // Ohne Login direkt ins Tool — Account/Speichern ist optional.
    router.push("/analysis");
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
        resetSuccess={resetSuccess}
      />
      {/* ── Ambient Background ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent} 0%, transparent 70%)`,
            opacity: 0.08,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.cyan} 0%, transparent 70%)`,
            opacity: 0.03,
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ════════════════════════════════════
            1. NAVBAR
           ════════════════════════════════════ */}
        <nav
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
            <div className="flex items-center gap-2.5">
              <AIOrb size={28} active />
              <span className="text-base font-bold" style={{ color: C.text }}>
                ImmoScorer
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/check"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: C.accent }}
              >
                🎤 Sprach-Check
              </Link>
              <Link
                href="/besichtigung"
                className="hidden md:inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: C.accent }}
              >
                🏠 Besichtigung
              </Link>
              <Link
                href="/wissen"
                className="hidden sm:inline-block text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: C.sub }}
              >
                Wissen
              </Link>
              <button
                onClick={toggle}
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                style={{ color: C.dim }}
                title={theme === "dark" ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
              >
                {theme === "dark" ? (
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:inline-block text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                style={{ border: `1px solid ${C.border}`, color: C.text }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.borderHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                Anmelden
              </button>
              <button
                onClick={() => router.push("/analysis")}
                className="text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                  color: "#fff",
                }}
              >
                Kostenlos testen
              </button>
            </div>
          </div>
        </nav>

        {/* ════════════════════════════════════
            2. HERO
           ════════════════════════════════════ */}
        <section className="px-4 md:px-5 pt-12 pb-16 md:pt-24 md:pb-28">
          <style>{`@media(min-width:768px){.hero-grid{grid-template-columns:1fr 440px!important}}`}</style>
          <div
            className="hero-grid mx-auto grid gap-10 md:gap-12 items-start w-full"
            style={{ maxWidth: 1100, gridTemplateColumns: "1fr" }}
          >
            {/* Left: Text */}
            <FadeIn>
              <div>
                {/* Pill */}
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <AIOrb size={16} active />
                  <span className="text-xs font-medium" style={{ color: C.sub }}>
                    KI-gestützte Immobilienanalyse für Kapitalanleger
                  </span>
                </div>

                {/* H1 */}
                <h1
                  className="text-3xl md:text-[44px] font-extrabold leading-[1.15] mb-5"
                  style={{ color: C.text }}
                >
                  Ihre nächste Immobilie — in Sekunden{" "}
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    bewertet
                  </span>
                  .
                </h1>

                {/* Subtext */}
                <p
                  className="text-base md:text-lg leading-relaxed mb-3"
                  style={{ color: C.sub, maxWidth: 520 }}
                >
                  Kaufpreis und Miete eingeben — und in Sekunden sehen, ob sich
                  eine Immobilie als Kapitalanlage lohnt. Anschließend Ihr
                  Portfolio speichern und alles im Blick behalten.
                </p>
                <p className="text-sm mb-8" style={{ color: C.dim }}>
                  Kein Excel. Kein Bauchgefühl. Kein Berater nötig.
                </p>

                {/* CTA */}
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={handleCta}
                    className="inline-block text-sm font-bold px-7 py-3 rounded-xl transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                      color: "#fff",
                    }}
                  >
                    Kostenlos starten
                  </button>
                  <Link
                    href="/check"
                    className="inline-flex items-center gap-2 text-sm font-bold px-7 py-3 rounded-xl transition-all"
                    style={{ border: `1px solid ${C.border}`, color: C.text }}
                  >
                    🎤 Per Sprache prüfen
                  </Link>
                  <span className="text-xs w-full sm:w-auto" style={{ color: C.dim }}>
                    Unbegrenzt &middot; kein Abo nötig
                  </span>
                </div>
              </div>
            </FadeIn>

            {/* Right: Mini-Rechner */}
            <FadeIn delay={0.15}>
              <MiniRechner onCta={handleCta} />
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════
            3. WARUM IMMOSCORER
           ════════════════════════════════════ */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto" style={{ maxWidth: 680 }}>
            <FadeIn className="text-center mb-14">
              <div
                className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.sub,
                }}
              >
                Warum ImmoScorer?
              </div>
              <h2
                className="text-2xl md:text-3xl font-extrabold mb-4"
                style={{ color: C.text }}
              >
                Die einfachste Art, Immobilien zu bewerten
              </h2>
              <p className="text-sm md:text-base" style={{ color: C.sub }}>
                Was früher Stunden mit Excel, Maklergesprächen und Bauchgefühl
                gekostet hat — in unter 10 Sekunden.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {(
                [
                  {
                    icon: Icons.clock,
                    title: "10 Sekunden statt 10 Stunden",
                    desc: "2 Zahlen eingeben, sofort ein Ergebnis. Keine Spreadsheets, keine komplexen Formeln.",
                  },
                  {
                    icon: Icons.chart,
                    title: "6 Scores statt 1 Bauchgefühl",
                    desc: "Investitionsqualität, Vermietbarkeit, Risiko, Finanzierbarkeit, Zukunftspotenzial, Energie — jeder Score mit klarer Begründung.",
                  },
                  {
                    icon: Icons.folder,
                    title: "Ihre persönliche Investoren-Zentrale",
                    desc: "Immobilien speichern, vergleichen, Favoriten markieren. Portfolio im Blick mit Scores, Trends und Empfehlungen.",
                  },
                  {
                    icon: Icons.user,
                    title: "Für Einsteiger gebaut, von Profis genutzt",
                    desc: "Jeder Score wird erklärt. Jede Empfehlung ist verständlich. Kein Fachchinesisch.",
                  },
                ] as const
              ).map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.05}>
                  <div
                    className="flex gap-4 rounded-2xl p-5"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: C.accentDim }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold mb-1"
                        style={{ color: C.text }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: C.sub }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            4. ALLE FUNKTIONEN
           ════════════════════════════════════ */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto" style={{ maxWidth: 1100 }}>
            <FadeIn className="text-center mb-14">
              <h2
                className="text-2xl md:text-3xl font-extrabold mb-4"
                style={{ color: C.text }}
              >
                Eine Plattform. Alles drin.
              </h2>
              <p className="text-sm md:text-base" style={{ color: C.sub }}>
                Heute und in Zukunft — wir bauen ständig neue Funktionen.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Icons.score,
                  title: "Intelligenter Score",
                  desc: "0\u2013100 Gesamtbewertung aus 6 gewichteten Teilscores.",
                  live: true,
                },
                {
                  icon: Icons.bulb,
                  title: "Strategische Empfehlungen",
                  desc: "Konkrete Handlungsempfehlungen pro Kategorie.",
                  live: true,
                },
                {
                  icon: Icons.bank,
                  title: "Finanzierbarkeits-Check",
                  desc: "Prüft ob Banken das Objekt finanzieren. LTV-Simulation, Zins-Coverage.",
                  live: true,
                },
                {
                  icon: Icons.mapPin,
                  title: "Automatische Lage-Analyse",
                  desc: "Adresse eingeben — Lageklasse, Walk-Score, ÖPNV automatisch.",
                  live: true,
                },
                {
                  icon: Icons.layers,
                  title: "Portfolio & Vergleich",
                  desc: "Immobilien speichern, Favoriten, Objekte nebeneinander vergleichen.",
                  live: true,
                },
                {
                  icon: Icons.book,
                  title: "Investoren-Wissen",
                  desc: "Renditeberechnung, Steuerhebel, Finanzierungsstrategien kompakt erklärt.",
                  live: true,
                },
                {
                  icon: Icons.ai,
                  title: "KI-Exposé-Analyse",
                  desc: "Exposé-Text einfügen — KI extrahiert Daten, erkennt Red Flags.",
                  live: false,
                },
                {
                  icon: Icons.trend,
                  title: "Markttrends & Lage-Entwicklung",
                  desc: "Preisentwicklung, Bevölkerungswachstum, Infrastruktur-Projekte.",
                  live: false,
                },
                {
                  icon: Icons.bell,
                  title: "Benachrichtigungen & Updates",
                  desc: "Neue Objekte, Marktveränderungen, Score-Updates.",
                  live: false,
                },
              ].map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.05}>
                  <div
                    className="rounded-2xl p-5 h-full transition-all"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.borderHover;
                      e.currentTarget.style.boxShadow = `0 0 20px ${C.accentDim}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: C.accentDim }}
                      >
                        {f.icon}
                      </div>
                      <span
                        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{
                          background: f.live
                            ? C.greenDim
                            : "rgba(0,212,255,0.1)",
                          color: f.live ? C.green : C.cyan,
                          border: `1px solid ${f.live ? C.greenBorder : "rgba(0,212,255,0.2)"}`,
                        }}
                      >
                        {f.live ? "Live" : "Bald"}
                      </span>
                    </div>
                    <h3
                      className="text-sm font-bold mb-1.5"
                      style={{ color: C.text }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: C.sub }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            5. SO EINFACH GEHT'S
           ════════════════════════════════════ */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto" style={{ maxWidth: 760 }}>
            <FadeIn className="text-center mb-14">
              <h2
                className="text-2xl md:text-3xl font-extrabold mb-4"
                style={{ color: C.text }}
              >
                So einfach geht&apos;s
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  n: "1",
                  title: "Daten eingeben",
                  desc: "Kaufpreis, Miete und Adresse.",
                },
                {
                  n: "2",
                  title: "KI analysiert",
                  desc: "6 Bewertungskategorien in unter 5 Sekunden.",
                },
                {
                  n: "3",
                  title: "Handeln",
                  desc: "Score + Empfehlungen nutzen: verhandeln, finanzieren, entscheiden.",
                },
              ].map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.05}>
                  <div
                    className="rounded-2xl p-6 text-center h-full"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-extrabold"
                      style={{
                        background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                        color: "#fff",
                      }}
                    >
                      {s.n}
                    </div>
                    <h3
                      className="text-sm font-bold mb-2"
                      style={{ color: C.text }}
                    >
                      {s.title}
                    </h3>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: C.sub }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            6. PRICING
           ════════════════════════════════════ */}
        <section id="pricing" className="px-5 py-20 md:py-28">
          <div className="mx-auto" style={{ maxWidth: 760 }}>
            <FadeIn className="text-center mb-14">
              <h2
                className="text-2xl md:text-3xl font-extrabold mb-4"
                style={{ color: C.text }}
              >
                Kostenlos starten. Sofort loslegen.
              </h2>
              <p className="text-sm md:text-base" style={{ color: C.sub }}>
                Keine Kreditkarte. Keine Verpflichtung. Kein Risiko.
              </p>
            </FadeIn>

            <div className="flex justify-center">
              {/* FREE */}
              <FadeIn>
                <div
                  className="rounded-2xl p-6 md:p-7 flex flex-col"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    maxWidth: 360,
                    width: "100%",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: C.dim }}
                  >
                    Free
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: C.text }}
                    >
                      0 €
                    </span>
                  </div>
                  <p className="text-xs mb-6" style={{ color: C.sub }}>
                    Für immer kostenlos. Zum Reinschnuppern.
                  </p>

                  <div className="space-y-3 mb-8 flex-1">
                    {[
                      "Unbegrenzte Schnell-Analysen",
                      "Gesamtscore + KI-Empfehlung",
                      "Automatische Lage-Analyse",
                      "Schnell-Check ohne Account",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        {Icons.check(C.green)}
                        <span className="text-sm" style={{ color: C.text }}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCta}
                    className="block w-full text-center text-sm font-bold py-3 rounded-xl transition-all"
                    style={{ border: `1px solid ${C.border}`, color: C.text }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = C.borderHover)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = C.border)
                    }
                  >
                    Kostenlos starten
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            7. FAQ
           ════════════════════════════════════ */}
        <section className="px-5 py-20 md:py-28">
          <div className="mx-auto" style={{ maxWidth: 680 }}>
            <FadeIn className="text-center mb-10">
              <h2
                className="text-2xl md:text-3xl font-extrabold"
                style={{ color: C.text }}
              >
                Häufige Fragen
              </h2>
            </FadeIn>

            <FadeIn>
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                {[
                  {
                    q: "Wie funktioniert der Score?",
                    a: "Der ImmoScorer bewertet anhand von 6 gewichteten Kriterien: Investitionsqualität (30 %), Vermietbarkeit (15 %), Risiko (15 %), Finanzierbarkeit (15 %), Zukunftspotenzial (15 %) und Energieeffizienz (10 %).",
                  },
                  {
                    q: "Brauche ich Immobilien-Erfahrung?",
                    a: "Nein. Jeder Score wird klar erklärt. Für Einsteiger gebaut, von Profis genutzt.",
                  },
                  {
                    q: "Was ist bei Free enthalten?",
                    a: "Unbegrenzte Analysen mit Gesamtscore und KI-Empfehlung. Detaillierte Teilscores, Verhandlungsguide, Portfolio und Vergleich sind Pro-Features für 9,99 €/Monat.",
                  },
                  {
                    q: "Kann ich jederzeit kündigen?",
                    a: "Ja. Monatlich kündbar, keine Mindestlaufzeit, ein Klick im Kundenportal.",
                  },
                  {
                    q: "Welche Daten brauche ich?",
                    a: "Minimal: Kaufpreis und Kaltmiete. Optimal zusätzlich: Hausgeld, Fläche, Baujahr, Energieklasse.",
                  },
                  {
                    q: "Ersetzt ImmoScorer einen Gutachter?",
                    a: "Nein. ImmoScorer ist ein Analyse-Tool, kein Verkehrswertgutachten.",
                  },
                ].map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ════════════════════════════════════
            8. FINAL CTA
           ════════════════════════════════════ */}
        <section className="px-5 py-20 md:py-28">
          <FadeIn>
            <div
              className="mx-auto rounded-2xl p-6 md:p-14 text-center"
              style={{
                maxWidth: 680,
                background: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: `0 0 60px ${C.accentDim}`,
              }}
            >
              <div className="flex justify-center mb-6">
                <AIOrb size={48} active />
              </div>
              <h2
                className="text-xl md:text-2xl font-extrabold mb-4"
                style={{ color: C.text }}
              >
                Ihre nächste Immobilie verdient eine fundierte Analyse.
              </h2>
              <p className="text-sm mb-8" style={{ color: C.sub }}>
                Kostenlos und unbegrenzt. In 10 Sekunden wissen ob sich&apos;s
                lohnt.
              </p>
              <button
                onClick={handleCta}
                className="inline-block text-sm font-bold px-8 py-3.5 rounded-xl transition-all"
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                  color: "#fff",
                }}
              >
                Jetzt kostenlos starten
              </button>
            </div>
          </FadeIn>
        </section>

        {/* Footer wird server-gerendert in LandingPage (siehe LandingFooter),
            damit die internen /wissen-Links im initialen HTML stehen. */}
      </div>
    </div>
  );
}

/* Server-gerenderter Footer — bewusst AUSSERHALB des Suspense/useSearchParams-
   Bereichs von LandingContent platziert, damit die internen /wissen-Links im
   initialen HTML erscheinen (crawlbar, interne Link-Kraft). */
function LandingFooter() {
  const wissenLinks = [
    { href: "/check", label: "Sprach-Check (Beta)" },
    { href: "/besichtigung", label: "Besichtigungs-Begleiter (Beta)" },
    { href: "/wissen", label: "Wissensbereich" },
    {
      href: "/wissen/kennzahlen/rendite-berechnen",
      label: "Immobilienrendite berechnen",
    },
    {
      href: "/wissen/grundlagen/score-verstehen",
      label: "Immobilien-Score verstehen",
    },
    {
      href: "/wissen/finanzierung/finanzierung-strukturieren",
      label: "Immobilie finanzieren",
    },
    {
      href: "/wissen/grundlagen/erste-immobilie",
      label: "Erste Immobilie als Kapitalanlage",
    },
  ];

  return (
    <footer
      className="px-5 py-8"
      style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
    >
      <div className="mx-auto" style={{ maxWidth: 1100 }}>
        {/* Wissens-Links (interne Verlinkung für SEO + Entdeckbarkeit) */}
        <div
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-6 pb-6"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          {wissenLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: C.sub }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Marke + Rechtliches + Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AIOrb size={20} />
            <span className="text-sm font-semibold" style={{ color: C.text }}>
              ImmoScorer
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {[
              { href: "/wissen", label: "Wissen" },
              { href: "/impressum", label: "Impressum" },
              { href: "/datenschutz", label: "Datenschutz" },
              { href: "/agb", label: "AGB" },
              { href: "/widerruf", label: "Widerruf" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs transition-opacity hover:opacity-80"
                style={{ color: C.sub }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: C.dim }}>
            © {new Date().getFullYear()} ImmoScorer. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
