"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { C } from "@/lib/theme";

const PRO_FEATURES = [
  "Detaillierte Teilscores mit Begründungen",
  "Verhandlungsguide mit Preisargumenten",
  "Finanzierungsanfrage direkt stellen",
  "Immobilien im Portfolio speichern",
  "Immobilien vergleichen (Side-by-Side)",
  "Persönliche Investment-Strategie",
  "KI-gestützte Empfehlungen",
  "Unbegrenzte Analysen",
];

export function UpgradeBox() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) return;
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
            Alle Features freischalten
          </h3>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            Mit ImmoScorer Pro erhalten Sie Zugang zu allen Funktionen:
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
        Monatlich kündbar. Keine versteckten Kosten.
      </p>
    </div>
  );
}
