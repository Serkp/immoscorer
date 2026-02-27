"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAnalyses, deleteAnalysis } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";

/* ── Flat-column analysis row from Supabase ── */
interface AnalysisRow {
  id: string;
  address: string;
  city: string;
  purchase_price: number;
  monthly_rent: number;
  area_sqm: number;
  building_year: number;
  energy_class: string;
  location_grade: string;
  management_fee: number;
  renovation_count: number;
  total_score: number;
  investment_score: number;
  rentability_score: number;
  risk_score: number;
  financing_score: number;
  future_score: number;
  energy_score: number;
  gross_yield: number;
  net_yield: number;
  price_factor: number;
  created_at: string;
  /* legacy JSONB (fallback) */
  inputs?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

/** Normalize row — supports both flat columns and legacy JSONB */
function normalize(a: AnalysisRow) {
  // If flat columns are populated, use them
  if (a.total_score != null && a.total_score > 0) {
    const price = a.purchase_price || 0;
    const area = a.area_sqm || 0;
    return {
      id: a.id,
      address: a.address || "—",
      city: a.city || "",
      price,
      rent: a.monthly_rent || 0,
      area,
      year: a.building_year || 0,
      energyClass: a.energy_class || "—",
      locationGrade: a.location_grade || "—",
      hausgeld: a.management_fee || 0,
      renoCount: a.renovation_count || 0,
      score: a.total_score || 0,
      investmentScore: a.investment_score || 0,
      rentabilityScore: a.rentability_score || 0,
      riskScore: a.risk_score || 0,
      financingScore: a.financing_score || 0,
      projectionScore: a.future_score || 0,
      energyScore: a.energy_score || 0,
      grossYield: a.gross_yield || 0,
      netYield: a.net_yield || 0,
      factor: a.price_factor || 0,
      sqmPrice: area > 0 ? price / area : 0,
    };
  }
  // Legacy JSONB fallback — inp may use camelCase keys (new format) or snake_case
  const inp = (a.inputs || {}) as Record<string, number | string | string[]>;
  const res = (a.result || {}) as Record<string, number>;
  const price = Number(inp.purchasePrice ?? inp.price) || 0;
  const rent = Number(inp.monthlyRent ?? inp.rent) || 0;
  const hausgeld = Number(inp.managementFee ?? inp.hausgeld) || 0;
  const area = Number(inp.areaSqm ?? inp.area) || 0;
  return {
    id: a.id,
    address: String(inp.address || inp.street || "—"),
    city: String(inp.city || ""),
    price,
    rent,
    area,
    year: Number(inp.buildingYear ?? inp.year) || 0,
    energyClass: String(inp.energyClass || "—"),
    locationGrade: String(inp.locationGrade || "—"),
    hausgeld,
    renoCount: Number(inp.renovationCount) || (Array.isArray(inp.renovations) ? inp.renovations.length : 0),
    score: res.totalScore || 0,
    investmentScore: res.investmentScore || 0,
    rentabilityScore: res.rentabilityScore || 0,
    riskScore: res.riskScore || 0,
    financingScore: res.financingScore || 0,
    projectionScore: res.futureScore || 0,
    energyScore: res.energyScore || 0,
    grossYield: res.grossYield || (price > 0 ? ((rent * 12) / price) * 100 : 0),
    netYield: res.netYield || (price > 0 ? (((rent - hausgeld) * 12) / price) * 100 : 0),
    factor: res.priceFactor || (rent > 0 ? price / (rent * 12) : 0),
    sqmPrice: area > 0 ? price / area : 0,
  };
}

export default function ComparePage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getAnalyses(user!.id, { status: "saved", saveType: "comparison" });
        setAnalyses(((data || []) as AnalysisRow[]).slice(0, 4));
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleDelete(id: string) {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setDeleteConfirm(null);
      setToast("Objekt aus Vergleich entfernt");
      setTimeout(() => setToast(null), 3000);
    } catch { /* silent */ }
  }

  const cards = useMemo(() => analyses.map(normalize), [analyses]);

  // Best values for highlighting
  const bestScore = cards.length > 0 ? Math.max(...cards.map((d) => d.score)) : 0;
  const bestGrossYield = cards.length > 0 ? Math.max(...cards.map((d) => d.grossYield)) : 0;
  const bestNetYield = cards.length > 0 ? Math.max(...cards.map((d) => d.netYield)) : 0;
  const bestFactor = cards.length > 0 ? Math.min(...cards.filter((d) => d.factor > 0).map((d) => d.factor)) : 0;

  function isBest(val: number, best: number) {
    return cards.length > 1 && val > 0 && val === best;
  }
  function isBestLow(val: number, best: number) {
    return cards.length > 1 && val > 0 && val === best;
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;
  }

  /* ── Empty State ── */
  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <Link href="/" className="inline-flex items-center gap-1 text-xs mb-4 transition-opacity hover:opacity-80" style={{ color: C.dim }}>
          ← Dashboard
        </Link>
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
            Starten Sie eine Analyse und speichern Sie das Ergebnis mit &quot;Im Vergleich speichern&quot;.
          </p>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Neue Analyse starten
          </Link>
        </div>
      </div>
    );
  }

  /* ── Subscore helper ── */
  const subscoreRows = [
    { label: "Investitions-Score", key: "investmentScore" as const },
    { label: "Vermietbarkeits-Score", key: "rentabilityScore" as const },
    { label: "Risiko-Score", key: "riskScore" as const },
    { label: "Finanzierungs-Score", key: "financingScore" as const },
    { label: "Zukunfts-Score", key: "projectionScore" as const },
    { label: "Energie-Score", key: "energyScore" as const },
  ];

  function bestSubscore(key: keyof ReturnType<typeof normalize>) {
    const vals = cards.map((d) => Number(d[key]) || 0);
    return Math.max(...vals);
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
          style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
        >
          {toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 space-y-4 animate-fade-up"
            style={{ background: C.bg2, border: `1px solid ${C.border}` }}
          >
            <h3 className="text-base font-bold" style={{ color: C.text }}>Objekt entfernen?</h3>
            <p className="text-sm" style={{ color: C.sub }}>
              Dieses Objekt wird unwiderruflich aus dem Vergleich entfernt.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ border: `1px solid ${C.border}`, color: C.sub }}
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
                style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}
              >
                Ja, entfernen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien-Vergleich</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            {cards.length} {cards.length === 1 ? "Objekt" : "Objekte"} im Vergleich
          </p>
        </div>
        {cards.length < 4 && (
          <Link
            href="/analysis"
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            + Objekt hinzufügen
          </Link>
        )}
      </div>

      {/* Cards Grid */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: cards.length === 1
            ? "max-content"
            : cards.length === 2
            ? "repeat(2, minmax(0, 240px))"
            : cards.length === 3
            ? "repeat(3, minmax(0, 240px))"
            : "repeat(2, minmax(0, 240px))",
        }}
      >
        {cards.map((d) => (
          <Card key={d.id} className="p-0 overflow-hidden" style={{ maxWidth: 240 }}>
            {/* ── Card Header: Address + Details ── */}
            <div className="px-3 pt-3 pb-2">
              <p className="text-xs font-bold truncate" style={{ color: C.text }}>
                {d.address}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>
                {d.area > 0 ? `${d.area} m²` : ""}{d.area > 0 && d.year > 0 ? " · " : ""}{d.year > 0 ? `Bj. ${d.year}` : ""}{(d.area > 0 || d.year > 0) && d.energyClass !== "—" ? " · " : ""}{d.energyClass !== "—" ? `Klasse ${d.energyClass}` : ""}
              </p>
            </div>

            {/* ── Score Ring ── */}
            <div className="flex flex-col items-center py-2.5 border-t border-b" style={{ borderColor: C.border }}>
              <ScoreRing value={d.score} size={50} />
              <p className="text-[10px] font-bold mt-1.5" style={{ color: scoreColor(d.score) }}>
                {scoreLabel(d.score)}
              </p>
              {isBest(d.score, bestScore) && (
                <span
                  className="text-[9px] font-bold mt-1 rounded-full px-1.5 py-0.5"
                  style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                >
                  Bester Score
                </span>
              )}
            </div>

            {/* ── KPI Rows ── */}
            <div className="px-3 py-2 space-y-1">
              <KPILine
                label="Kaufpreis"
                value={`${d.price.toLocaleString("de-DE")} €`}
                highlight={false}
              />
              <KPILine
                label="Kaltmiete"
                value={`${d.rent.toLocaleString("de-DE")} €/Mon.`}
                highlight={false}
              />
              <KPILine
                label="Bruttorendite"
                value={`${d.grossYield.toFixed(1)} %`}
                highlight={isBest(d.grossYield, bestGrossYield)}
              />
              <KPILine
                label="Nettorendite"
                value={`${d.netYield.toFixed(1)} %`}
                highlight={isBest(d.netYield, bestNetYield)}
              />
              <KPILine
                label="Kaufpreisfaktor"
                value={`${d.factor.toFixed(1)}x`}
                highlight={isBestLow(d.factor, bestFactor)}
              />
              {d.sqmPrice > 0 && (
                <KPILine
                  label="Preis/m²"
                  value={`${Math.round(d.sqmPrice).toLocaleString("de-DE")} €`}
                  highlight={false}
                />
              )}
            </div>

            {/* ── Subscores ── */}
            <div className="px-3 pb-2 space-y-1 border-t pt-2" style={{ borderColor: C.border }}>
              <p className="text-[9px] font-semibold mb-1" style={{ color: C.dim }}>TEILSCORES</p>
              {subscoreRows.map((sr) => {
                const val = Number(d[sr.key]) || 0;
                const best = bestSubscore(sr.key);
                const isHighlight = cards.length > 1 && val > 0 && val === best;
                return (
                  <div key={sr.key} className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: C.sub }}>{sr.label}</span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: isHighlight ? C.green : scoreColor(val) }}
                    >
                      {val}/100
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Delete Button ── */}
            <div className="border-t px-3 py-2" style={{ borderColor: C.border }}>
              <button
                onClick={() => setDeleteConfirm(d.id)}
                className="w-full text-center text-[10px] font-medium py-0.5 transition-all hover:opacity-80 rounded-lg"
                style={{ color: C.dim }}
              >
                Entfernen
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function KPILine({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px]" style={{ color: C.sub }}>{label}</span>
      <span
        className="text-[10px] font-bold"
        style={{ color: highlight ? C.green : C.text }}
      >
        {value}
        {highlight && (
          <span className="ml-1 text-[9px]" style={{ color: C.green }}>
            ★
          </span>
        )}
      </span>
    </div>
  );
}
