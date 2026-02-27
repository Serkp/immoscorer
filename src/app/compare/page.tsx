"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAnalyses, deleteAnalysis } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";
import { computeScore } from "@/lib/scoring";
import type { PropertyInput } from "@/lib/scoring";

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
  const router = useRouter();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // TEIL 5: Editable price/rent per card
  const [edits, setEdits] = useState<Record<string, { price: string; rent: string }>>({});
  const [editing, setEditing] = useState<Record<string, "price" | "rent" | null>>({});
  const [recalculated, setRecalculated] = useState<Record<string, {
    score: number; grossYield: number; netYield: number; factor: number;
    investmentScore: number; rentabilityScore: number; riskScore: number;
    financingScore: number; projectionScore: number; energyScore: number;
  }>>({});

  const startEdit = useCallback((id: string, field: "price" | "rent", currentVal: number) => {
    setEditing(prev => ({ ...prev, [id]: field }));
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: String(currentVal) },
    }));
  }, []);

  const handleRecalculate = useCallback((id: string, d: ReturnType<typeof normalize>, row: AnalysisRow) => {
    const editData = edits[id];
    if (!editData) return;
    const newPrice = Number(editData.price) || d.price;
    const newRent = Number(editData.rent) || d.rent;

    // Reconstruct PropertyInput from row data
    const inp = (row.inputs || {}) as Record<string, string | number | string[]>;
    const input: PropertyInput = {
      street: d.address,
      city: d.city,
      price: newPrice,
      rent: newRent,
      hausgeld: d.hausgeld,
      area: d.area,
      year: d.year,
      energyClass: d.energyClass,
      locationGrade: d.locationGrade,
      renovations: Array.isArray(inp.renovations) ? inp.renovations as string[] : [],
      ...(inp.propertyType ? { propertyType: String(inp.propertyType) } : {}),
      ...(inp.apartmentType ? { apartmentType: String(inp.apartmentType) } : {}),
      ...(inp.rooms ? { rooms: Number(inp.rooms) } : {}),
      ...(inp.unitCount ? { unitCount: Number(inp.unitCount) } : {}),
    };
    const sr = computeScore(input);
    setRecalculated(prev => ({
      ...prev,
      [id]: {
        score: sr.totalScore,
        grossYield: sr.kpis.grossYield * 100,
        netYield: sr.kpis.netYield * 100,
        factor: sr.kpis.factor,
        investmentScore: sr.subscores.find(s => s.key === "investment")?.value || 0,
        rentabilityScore: sr.subscores.find(s => s.key === "rentability")?.value || 0,
        riskScore: sr.subscores.find(s => s.key === "risk")?.value || 0,
        financingScore: sr.subscores.find(s => s.key === "financing")?.value || 0,
        projectionScore: sr.subscores.find(s => s.key === "projection")?.value || 0,
        energyScore: sr.subscores.find(s => s.key === "energy")?.value || 0,
      },
    }));
    setEditing(prev => ({ ...prev, [id]: null }));
  }, [edits]);

  const hasEdits = useCallback((id: string, d: ReturnType<typeof normalize>) => {
    const e = edits[id];
    if (!e) return false;
    return (e.price && Number(e.price) !== d.price) || (e.rent && Number(e.rent) !== d.rent);
  }, [edits]);

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
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs mb-4 transition-opacity hover:opacity-80" style={{ color: C.dim }}>
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
            href="/analysis?new=1"
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
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
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
            href="/analysis?new=1"
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            + Objekt hinzufügen
          </Link>
        )}
      </div>

      {/* Cards Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cards.length}, 1fr)`,
        }}
      >
        {cards.map((d, idx) => {
          const rc = recalculated[d.id];
          const isEditing = editing[d.id];
          const editData = edits[d.id];
          const showRecalc = hasEdits(d.id, d);
          const displayScore = rc ? rc.score : d.score;
          const displayGrossYield = rc ? rc.grossYield : d.grossYield;
          const displayNetYield = rc ? rc.netYield : d.netYield;
          const displayFactor = rc ? rc.factor : d.factor;

          return (
          <Card
            key={d.id}
            className="p-0 overflow-hidden cursor-pointer transition-all"
            hover
            onClick={() => router.push(`/analysis?id=${d.id}`)}
          >
            {/* ── Card Header: Address + Details ── */}
            <div className="px-3 pt-3 pb-2">
              <p className="text-xs font-bold truncate" style={{ color: C.text }}>
                {d.address}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>
                {d.area > 0 ? `${d.area} m²` : ""}{d.area > 0 && d.year > 0 ? " · " : ""}{d.year > 0 ? `Bj. ${d.year}` : ""}{(d.area > 0 || d.year > 0) && d.energyClass !== "—" ? " · " : ""}{d.energyClass !== "—" ? `Klasse ${d.energyClass}` : ""}
              </p>
            </div>

            {/* ── Score ── */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-b" style={{ borderColor: C.border }}>
              <div className="flex items-baseline gap-1.5">
                {rc && rc.score !== d.score ? (
                  <>
                    <span className="text-sm line-through" style={{ color: C.dim }}>{d.score}</span>
                    <span className="text-lg font-extrabold" style={{ color: scoreColor(rc.score) }}>
                      {rc.score}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: rc.score > d.score ? C.green : C.red }}>
                      ({rc.score > d.score ? "+" : ""}{rc.score - d.score})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-extrabold" style={{ color: scoreColor(displayScore) }}>
                      {displayScore}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: C.dim }}>/100</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold" style={{ color: scoreColor(displayScore) }}>
                  {scoreLabel(displayScore)}
                </span>
                {isBest(displayScore, bestScore) && (
                  <span
                    className="text-[9px] font-bold rounded-full px-1.5 py-0.5"
                    style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                  >
                    ★
                  </span>
                )}
              </div>
            </div>

            {/* ── KPI Rows with editable Price/Rent ── */}
            <div className="px-3 py-2 space-y-1">
              {/* Kaufpreis — editable */}
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: C.sub }}>Kaufpreis</span>
                {isEditing === "price" ? (
                  <input
                    autoFocus
                    type="number"
                    className="w-20 text-right text-[10px] font-bold rounded px-1 py-0.5"
                    style={{ background: C.surface3, color: C.text, border: `1px solid ${C.accent}`, outline: "none" }}
                    value={editData?.price ?? String(d.price)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); setEdits(prev => ({ ...prev, [d.id]: { ...prev[d.id], price: e.target.value, rent: prev[d.id]?.rent ?? String(d.rent) } })); }}
                    onKeyDown={(e) => { if (e.key === "Enter") setEditing(prev => ({ ...prev, [d.id]: null })); }}
                    onBlur={() => setEditing(prev => ({ ...prev, [d.id]: null }))}
                  />
                ) : (
                  <span
                    className="text-[10px] font-bold cursor-text flex items-center gap-1 hover:opacity-70"
                    style={{ color: C.text }}
                    onClick={(e) => { e.stopPropagation(); startEdit(d.id, "price", d.price); }}
                  >
                    {(Number(editData?.price) || d.price).toLocaleString("de-DE")} €
                    <svg width={8} height={8} viewBox="0 0 16 16" fill="none" stroke={C.dim} strokeWidth="1.5"><path d="M11.5 1.5l3 3L5 14H2v-3z"/></svg>
                  </span>
                )}
              </div>

              {/* Kaltmiete — editable */}
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: C.sub }}>Kaltmiete</span>
                {isEditing === "rent" ? (
                  <input
                    autoFocus
                    type="number"
                    className="w-20 text-right text-[10px] font-bold rounded px-1 py-0.5"
                    style={{ background: C.surface3, color: C.text, border: `1px solid ${C.accent}`, outline: "none" }}
                    value={editData?.rent ?? String(d.rent)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => { e.stopPropagation(); setEdits(prev => ({ ...prev, [d.id]: { ...(prev[d.id] || { price: String(d.price) }), rent: e.target.value } })); }}
                    onKeyDown={(e) => { if (e.key === "Enter") setEditing(prev => ({ ...prev, [d.id]: null })); }}
                    onBlur={() => setEditing(prev => ({ ...prev, [d.id]: null }))}
                  />
                ) : (
                  <span
                    className="text-[10px] font-bold cursor-text flex items-center gap-1 hover:opacity-70"
                    style={{ color: C.text }}
                    onClick={(e) => { e.stopPropagation(); startEdit(d.id, "rent", d.rent); }}
                  >
                    {(Number(editData?.rent) || d.rent).toLocaleString("de-DE")} €/Mon.
                    <svg width={8} height={8} viewBox="0 0 16 16" fill="none" stroke={C.dim} strokeWidth="1.5"><path d="M11.5 1.5l3 3L5 14H2v-3z"/></svg>
                  </span>
                )}
              </div>

              {/* Neu berechnen button */}
              {showRecalc && !isEditing && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRecalculate(d.id, d, analyses[idx]); }}
                  className="w-full mt-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-all hover:opacity-90"
                  style={{ background: C.accentDim, color: C.accent, border: `1px solid rgba(124,106,255,0.2)` }}
                >
                  Neu berechnen
                </button>
              )}

              <KPILine
                label="Bruttorendite"
                value={`${displayGrossYield.toFixed(1)} %`}
                highlight={isBest(displayGrossYield, bestGrossYield)}
              />
              <KPILine
                label="Nettorendite"
                value={`${displayNetYield.toFixed(1)} %`}
                highlight={isBest(displayNetYield, bestNetYield)}
              />
              <KPILine
                label="Kaufpreisfaktor"
                value={`${displayFactor.toFixed(1)}x`}
                highlight={isBestLow(displayFactor, bestFactor)}
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
                const origVal = Number(d[sr.key]) || 0;
                const newVal = rc ? Number(rc[sr.key]) || 0 : origVal;
                const best = bestSubscore(sr.key);
                const isHighlight = cards.length > 1 && newVal > 0 && newVal === best;
                return (
                  <div key={sr.key} className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: C.sub }}>{sr.label}</span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: isHighlight ? C.green : scoreColor(newVal) }}
                    >
                      {rc && newVal !== origVal ? (
                        <><span className="line-through mr-1" style={{ color: C.dim }}>{origVal}</span>{newVal}/100</>
                      ) : (
                        <>{newVal}/100</>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Delete Button ── */}
            <div className="border-t px-3 py-2" style={{ borderColor: C.border }}>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(d.id); }}
                className="w-full text-center text-[10px] font-medium py-0.5 transition-all hover:opacity-80 rounded-lg"
                style={{ color: C.dim }}
              >
                Entfernen
              </button>
            </div>
          </Card>
          );
        })}
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
