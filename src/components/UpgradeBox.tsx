"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { C } from "@/lib/theme";

const PRO_FEATURES = [
  "Nettorendite & Kaufpreisfaktor",
  "6 detaillierte Teilscores",
  "Verhandlungsguide mit Zielpreis",
  "Strategische Empfehlungen",
  "Immobilien speichern & vergleichen",
  "Portfolio für vorhandene Immobilien",
  "Personalisierte Investitionsstrategie",
  "Kostenlose Finanzierungsanfrage",
];

interface UpgradeBoxProps {
  score?: number;
  onNeedAuth?: () => void;
}

export function UpgradeBox({ score, onNeedAuth }: UpgradeBoxProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      onNeedAuth?.();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const subtitle = score != null
    ? score >= 75
      ? `Ihr Score: ${score} — ein starkes Objekt. Erfahren Sie genau warum und wie Sie den Kaufpreis optimal verhandeln.`
      : score >= 50
        ? `Ihr Score: ${score} — es gibt Potenzial. Erfahren Sie wo die Stärken und Schwächen liegen.`
        : `Ihr Score: ${score} — hier ist Vorsicht geboten. Erfahren Sie welche Risiken bestehen und ob sich Verhandlung lohnt.`
    : "Mit ImmoScorer Pro erhalten Sie Zugang zu allen Funktionen:";

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: C.bg2,
        border: `1px solid ${C.accent}`,
        boxShadow: `0 0 40px ${C.accentDim}, 0 0 80px rgba(124,106,255,0.05)`,
      }}
    >
      {/* Lock icon + title */}
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: C.accentDim }}
        >
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: C.text }}>
            Vollständige Analyse freischalten
          </h3>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: C.sub }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Feature list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {PRO_FEATURES.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm" style={{ color: C.text }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-xl py-3.5 text-base font-bold transition-all hover:opacity-90 disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
          color: "#fff",
        }}
      >
        {loading ? "Wird geladen..." : "Jetzt Pro freischalten — 9,99 €/Mon."}
      </button>
      <p className="text-xs text-center" style={{ color: C.dim }}>
        Monatlich kündbar · Sofort Zugang
      </p>
    </div>
  );
}

/* ── Sticky Upgrade Banner (fixed bottom) ── */

interface StickyBannerProps {
  score?: number;
  onNeedAuth?: () => void;
}

export function StickyUpgradeBanner({ score, onNeedAuth }: StickyBannerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function handleCheckout() {
    if (!user) {
      onNeedAuth?.();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (dismissed) return null;

  const bannerText = score != null
    ? score >= 75
      ? `Ihr Score: ${score} — Erfahren Sie warum dieses Top-Objekt überzeugt.`
      : score >= 50
        ? `Ihr Score: ${score} — Erfahren Sie wo Stärken und Schwächen liegen.`
        : `Ihr Score: ${score} — Erfahren Sie welche Risiken bestehen.`
    : "Schalten Sie die vollständige Analyse frei.";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[1000]"
      style={{
        background: "rgba(8,9,14,0.95)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(124,106,255,0.3)",
      }}
    >
      <div className="mx-auto max-w-[1100px] px-6 py-4 flex items-center gap-4">
        {/* Lock icon */}
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" className="shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: C.text }}>
            Vollständige Analyse freischalten
          </p>
          <p className="text-xs truncate" style={{ color: C.sub }}>
            {bannerText}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
            color: "#fff",
          }}
        >
          {loading ? "..." : "Pro freischalten — 9,99 €/Mon."}
        </button>

        <span className="text-[11px] whitespace-nowrap hidden sm:block" style={{ color: C.dim }}>
          Monatlich kündbar
        </span>

        {/* Close X */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-lg transition-colors hover:opacity-70"
          style={{ color: C.dim }}
        >
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
