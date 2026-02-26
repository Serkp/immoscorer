"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAnalyses, deleteAnalysis } from "@/lib/db";
import { C, scoreColor } from "@/lib/theme";

interface SavedAnalysis {
  id: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
}

function getInput(a: SavedAnalysis) {
  return a.inputs as {
    street?: string; city?: string; price?: number; rent?: number;
    area?: number; locationGrade?: string; energyClass?: string;
    hausgeld?: number; year?: number; renovations?: string[];
  };
}

function getResult(a: SavedAnalysis) {
  return a.result as {
    totalScore?: number;
    subscores?: Array<{ key: string; label: string; value: number }>;
    kpis?: { netYield?: number; grossYield?: number; factor?: number; sqmPrice?: number };
  };
}

export default function ComparePage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getAnalyses(user!.id, { status: "saved", saveType: "comparison" });
        setAnalyses(((data || []) as SavedAnalysis[]).slice(0, 4));
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleDelete(id: string) {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setToast("Objekt aus Vergleich entfernt");
      setTimeout(() => setToast(null), 3000);
    } catch { /* silent */ }
  }

  // Build comparison data
  const compData = useMemo(() => {
    return analyses.map((a) => {
      const inp = getInput(a);
      const res = getResult(a);
      const price = inp.price || 0;
      const rent = inp.rent || 0;
      const hausgeld = inp.hausgeld || 0;
      const area = inp.area || 0;
      const grossYield = price > 0 ? ((rent * 12) / price) * 100 : 0;
      const netYield = price > 0 ? (((rent - hausgeld) * 12) / price) * 100 : 0;
      const factor = rent > 0 ? price / (rent * 12) : 999;
      const subscores = res.subscores || [];
      return {
        id: a.id,
        street: inp.street || "—",
        city: inp.city || "",
        price,
        rent,
        area,
        year: inp.year || 0,
        energyClass: inp.energyClass || "—",
        locationGrade: inp.locationGrade || "—",
        grossYield,
        netYield,
        factor,
        score: res.totalScore || 0,
        subscores,
      };
    });
  }, [analyses]);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;
  }

  // Empty state
  if (analyses.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien-Vergleich</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>Vergleichen Sie bis zu 4 Objekte nebeneinander.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <h2 className="text-base font-bold" style={{ color: C.text }}>
            Noch keine Objekte im Vergleich
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
            Starten Sie eine Analyse und speichern Sie das Ergebnis.
          </p>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Neue Analyse starten →
          </Link>
        </div>
      </div>
    );
  }

  // Helper: determine best values
  const bestScore = Math.max(...compData.map((d) => d.score));
  const bestGrossYield = Math.max(...compData.map((d) => d.grossYield));
  const bestNetYield = Math.max(...compData.map((d) => d.netYield));
  const bestFactor = Math.min(...compData.map((d) => d.factor));
  const bestPrice = Math.min(...compData.map((d) => d.price));

  // Best subscore per key
  function isBestSubscore(key: string, value: number) {
    const vals = compData.map((d) => d.subscores.find((s) => s.key === key)?.value || 0);
    return value === Math.max(...vals) && value > 0;
  }

  type RowDef = {
    label: string;
    values: string[];
    isBest: boolean[];
    separator?: boolean;
  };

  const rows: RowDef[] = [
    // Property details
    { label: "Adresse", values: compData.map((d) => d.street.length > 25 ? d.street.slice(0, 25) + "…" : d.street), isBest: compData.map(() => false) },
    { label: "Stadt", values: compData.map((d) => d.city), isBest: compData.map(() => false) },
    { label: "Kaufpreis", values: compData.map((d) => `${d.price.toLocaleString("de-DE")} €`), isBest: compData.map((d) => d.price === bestPrice) },
    { label: "Kaltmiete", values: compData.map((d) => `${d.rent.toLocaleString("de-DE")} €`), isBest: compData.map(() => false) },
    { label: "Wohnfläche", values: compData.map((d) => d.area ? `${d.area} m²` : "—"), isBest: compData.map(() => false) },
    { label: "Baujahr", values: compData.map((d) => d.year ? String(d.year) : "—"), isBest: compData.map(() => false) },
    { label: "Energieklasse", values: compData.map((d) => d.energyClass), isBest: compData.map(() => false) },
    // Separator
    { label: "", values: [], isBest: [], separator: true },
    // Scores
    { label: "GESAMT-SCORE", values: compData.map((d) => `${d.score}/100`), isBest: compData.map((d) => d.score === bestScore) },
    ...(() => {
      if (compData.length === 0 || compData[0].subscores.length === 0) return [];
      const scoreLabels = [
        { key: "investment", label: "Investitions-Score" },
        { key: "rentability", label: "Vermietbarkeits-Score" },
        { key: "risk", label: "Risiko-Score" },
        { key: "financing", label: "Finanzierungs-Score" },
        { key: "projection", label: "Zukunfts-Score" },
        { key: "energy", label: "Energie-Score" },
      ];
      return scoreLabels.map(({ key, label }) => ({
        label,
        values: compData.map((d) => {
          const sub = d.subscores.find((s) => s.key === key);
          return sub ? `${sub.value}/100` : "—";
        }),
        isBest: compData.map((d) => {
          const sub = d.subscores.find((s) => s.key === key);
          return sub ? isBestSubscore(key, sub.value) : false;
        }),
      }));
    })(),
    // Separator
    { label: "", values: [], isBest: [], separator: true },
    // KPIs
    { label: "Bruttorendite", values: compData.map((d) => `${d.grossYield.toFixed(1)} %`), isBest: compData.map((d) => d.grossYield === bestGrossYield) },
    { label: "Nettorendite", values: compData.map((d) => `${d.netYield.toFixed(1)} %`), isBest: compData.map((d) => d.netYield === bestNetYield) },
    { label: "Kaufpreisfaktor", values: compData.map((d) => `${d.factor.toFixed(1)}x`), isBest: compData.map((d) => d.factor === bestFactor) },
    { label: "Lageklasse", values: compData.map((d) => d.locationGrade), isBest: compData.map(() => false) },
  ];

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien-Vergleich</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>Vergleichen Sie bis zu 4 Objekte nebeneinander.</p>
        </div>
        {analyses.length < 4 && (
          <Link
            href="/analysis"
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            + Objekt hinzufügen
          </Link>
        )}
      </div>

      {/* Comparison Table - Desktop */}
      <div className="hidden md:block">
        <Card className="overflow-x-auto">
          <div style={{ minWidth: `${200 + compData.length * 200}px` }}>
            {/* Header row with score rings */}
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `200px repeat(${compData.length}, 1fr)`,
                background: C.border,
              }}
            >
              <div className="p-4" style={{ background: C.bg2 }} />
              {compData.map((d) => (
                <div key={d.id} className="p-4 flex flex-col items-center gap-2" style={{ background: C.bg2 }}>
                  <ScoreRing value={d.score} size={64} />
                  <p className="text-xs font-bold text-center truncate w-full" style={{ color: C.text }}>
                    {d.street.length > 20 ? d.street.slice(0, 20) + "…" : d.street}
                  </p>
                  <p className="text-[10px]" style={{ color: C.dim }}>{d.city}</p>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {rows.map((row, rowIdx) => {
              if (row.separator) {
                return (
                  <div
                    key={`sep-${rowIdx}`}
                    className="h-px"
                    style={{ background: `linear-gradient(90deg, ${C.accent}40, ${C.blue}40)` }}
                  />
                );
              }

              const isScoreRow = row.label === "GESAMT-SCORE";

              return (
                <div
                  key={row.label}
                  className="grid gap-px"
                  style={{
                    gridTemplateColumns: `200px repeat(${compData.length}, 1fr)`,
                    background: C.border,
                  }}
                >
                  <div
                    className="p-3 flex items-center"
                    style={{ background: rowIdx % 2 === 0 ? C.surface2 : C.bg2 }}
                  >
                    <span
                      className={`text-xs ${isScoreRow ? "font-bold" : "font-medium"}`}
                      style={{ color: isScoreRow ? C.text : C.sub }}
                    >
                      {row.label}
                    </span>
                  </div>
                  {row.values.map((val, i) => (
                    <div
                      key={i}
                      className="p-3 flex items-center justify-center"
                      style={{
                        background: row.isBest[i]
                          ? "rgba(52,211,153,0.08)"
                          : rowIdx % 2 === 0 ? C.surface2 : C.bg2,
                      }}
                    >
                      <span
                        className={`${isScoreRow ? "text-base font-bold" : "text-sm font-semibold"}`}
                        style={{ color: row.isBest[i] ? C.green : isScoreRow ? scoreColor(compData[i]?.score || 0) : C.text }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Delete row */}
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `200px repeat(${compData.length}, 1fr)`,
                background: C.border,
              }}
            >
              <div className="p-3" style={{ background: C.bg2 }} />
              {compData.map((d) => (
                <div key={d.id} className="p-3 flex items-center justify-center" style={{ background: C.bg2 }}>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-[11px] font-medium transition-all hover:opacity-80"
                    style={{ color: C.dim }}
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {compData.map((d) => (
          <Card key={d.id} className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <ScoreRing value={d.score} size={56} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: C.text }}>{d.street}</p>
                <p className="text-xs" style={{ color: C.dim }}>{d.city}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MobileMetric label="Kaufpreis" value={`${d.price.toLocaleString("de-DE")} €`} best={d.price === bestPrice} />
              <MobileMetric label="Kaltmiete" value={`${d.rent.toLocaleString("de-DE")} €`} best={false} />
              <MobileMetric label="Wohnfläche" value={d.area ? `${d.area} m²` : "—"} best={false} />
              <MobileMetric label="Baujahr" value={d.year ? String(d.year) : "—"} best={false} />
              <MobileMetric label="Bruttorendite" value={`${d.grossYield.toFixed(1)} %`} best={d.grossYield === bestGrossYield} />
              <MobileMetric label="Nettorendite" value={`${d.netYield.toFixed(1)} %`} best={d.netYield === bestNetYield} />
              <MobileMetric label="Kaufpreisfaktor" value={`${d.factor.toFixed(1)}x`} best={d.factor === bestFactor} />
              <MobileMetric label="Lageklasse" value={d.locationGrade} best={false} />
            </div>

            {/* Subscores */}
            <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: C.border }}>
              {d.subscores.map((sub) => (
                <div key={sub.key} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.sub }}>{sub.label}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isBestSubscore(sub.key, sub.value) ? C.green : C.text }}
                  >
                    {sub.value}/100
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleDelete(d.id)}
              className="w-full text-center text-[11px] font-medium py-2 transition-all hover:opacity-80"
              style={{ color: C.dim }}
            >
              Entfernen
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MobileMetric({ label, value, best }: { label: string; value: string; best: boolean }) {
  return (
    <div
      className="rounded-lg p-2.5 text-center"
      style={{
        background: best ? "rgba(52,211,153,0.08)" : C.surface,
        border: best ? `1px solid ${C.greenBorder}` : `1px solid transparent`,
      }}
    >
      <p className="text-xs font-bold" style={{ color: best ? C.green : C.text }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}
