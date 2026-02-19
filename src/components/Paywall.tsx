"use client";

import { useState } from "react";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { C } from "@/lib/theme";

const FEATURES = [
  "Unbegrenzte Immobilien-Analysen",
  "Portfolio & Vergleichstools",
  "KI-gestützte Empfehlungen",
] as const;

export function Paywall() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[480px] py-16 space-y-8">
      <div className="flex flex-col items-center gap-4">
        <AIOrb size={48} active />
        <h2 className="text-xl font-bold text-center" style={{ color: C.text }}>
          Ihre 3 kostenlosen Analysen wurden verwendet
        </h2>
        <p className="text-sm text-center leading-relaxed" style={{ color: C.sub }}>
          Schalten Sie alle Funktionen frei — unbegrenzte Analysen, Portfolio-Verwaltung,
          Vergleichstools und strategische Empfehlungen.
        </p>
      </div>

      <Card className="p-6 space-y-5" glow>
        {/* Price */}
        <div className="text-center space-y-1">
          <p className="text-3xl font-bold" style={{ color: C.text }}>
            9,99 € <span className="text-sm font-medium" style={{ color: C.sub }}>/ Monat</span>
          </p>
          <p className="text-xs" style={{ color: C.dim }}>
            Monatlich kündbar. Keine Mindestlaufzeit.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-xs"
            style={{
              background: C.redDim,
              color: C.red,
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
            color: "#fff",
          }}
        >
          {loading ? "Wird geladen..." : "Jetzt freischalten"}
        </button>

        {/* Feature bullets */}
        <ul className="space-y-3 pt-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0"
                style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
              >
                &#10003;
              </span>
              <span className="text-sm" style={{ color: C.sub }}>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
