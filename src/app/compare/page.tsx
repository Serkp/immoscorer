"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { MiniRing } from "@/components/ui/ScoreRing";
import { AIComment } from "@/components/ui/AIComment";
import { PropertyCard } from "@/components/PropertyCard";
import { UpgradeBox } from "@/components/UpgradeBox";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { getAnalyses, deleteAnalysis, toggleAnalysisFavorite } from "@/lib/db";
import { C } from "@/lib/theme";

interface SavedAnalysis {
  id: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
}

export default function ComparePage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [sort, setSort] = useState<"score" | "price" | "yield" | "date">("date");
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user || subLoading) return;
    if (!isPro) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getAnalyses(user!.id, { status: "saved", saveType: "comparison" });
        setAnalyses((data || []) as SavedAnalysis[]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [user, isPro, subLoading]);

  function getInput(a: SavedAnalysis) {
    return a.inputs as { street?: string; city?: string; price?: number; rent?: number; area?: number; locationGrade?: string; energyClass?: string; hausgeld?: number; year?: number; renovations?: string[] };
  }
  function getResult(a: SavedAnalysis) {
    return a.result as { totalScore?: number; subscores?: Array<{ key: string; label: string; value: number }>; kpis?: { netYield?: number; factor?: number } };
  }

  async function handleToggleFav(id: string, current: boolean) {
    try {
      await toggleAnalysisFavorite(id, current);
      setAnalyses((prev) => prev.map((a) => (a.id === id ? { ...a, is_favorite: !current } : a)));
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      setSelected((prev) => prev.filter((s) => s !== id));
      setConfirmDelete(null);
      setToast("Immobilie aus Vergleich entfernt");
      setTimeout(() => setToast(null), 3000);
    } catch { /* silent */ }
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  const filtered = useMemo(() => {
    const f = filter === "favorites" ? analyses.filter((a) => a.is_favorite) : analyses;
    return [...f].sort((a, b) => {
      const iA = getInput(a);
      const iB = getInput(b);
      const rA = getResult(a);
      const rB = getResult(b);
      if (sort === "score") return (rB.totalScore || 0) - (rA.totalScore || 0);
      if (sort === "price") return (iA.price || 0) - (iB.price || 0);
      if (sort === "yield") {
        const yA = (iA.price || 0) > 0 ? (((iA.rent || 0) * 12) / (iA.price || 1)) : 0;
        const yB = (iB.price || 0) > 0 ? (((iB.rent || 0) * 12) / (iB.price || 1)) : 0;
        return yB - yA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [analyses, filter, sort]);

  // Comparison data
  const picks = useMemo(() => analyses.filter((a) => selected.includes(a.id)), [analyses, selected]);
  const compData = useMemo(() => {
    if (picks.length < 2) return null;
    return picks.map((p) => {
      const inp = getInput(p);
      const res = getResult(p);
      const price = inp.price || 0;
      const rent = inp.rent || 0;
      const grossYield = price > 0 ? ((rent * 12) / price) * 100 : 0;
      const factor = rent > 0 ? price / (rent * 12) : 999;
      const subscores = res.subscores || [];
      return { id: p.id, street: inp.street || "—", city: inp.city || "", price, rent, grossYield, factor, score: res.totalScore || 0, subscores, energy: inp.energyClass || "—", location: inp.locationGrade || "—", renovations: inp.renovations?.length || 0 };
    });
  }, [picks]);

  if (loading || subLoading) {
    return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;
  }

  if (!isPro) {
    return (
      <div className="mx-auto max-w-[700px] py-12 space-y-6">
        <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien vergleichen</h1>
        <UpgradeBox />
      </div>
    );
  }

  // Comparison view
  if (comparing && compData && compData.length >= 2) {
    const bestScore = Math.max(...compData.map((d) => d.score));
    const bestYield = Math.max(...compData.map((d) => d.grossYield));
    const bestFactor = Math.min(...compData.map((d) => d.factor));
    const bestObj = compData.find((d) => d.score === bestScore);

    return (
      <div className="mx-auto max-w-[1100px] space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Vergleich</h1>
          <button onClick={() => setComparing(false)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
            Zurück zur Auswahl
          </button>
        </div>

        <Card className="overflow-x-auto">
          <div className="min-w-[500px]">
            {/* Header */}
            <div className="grid gap-px" style={{ gridTemplateColumns: `160px repeat(${compData.length}, 1fr)`, background: C.border }}>
              <div className="p-3" style={{ background: C.bg2 }} />
              {compData.map((d) => (
                <div key={d.id} className="p-3 flex flex-col items-center gap-1.5" style={{ background: C.bg2 }}>
                  <MiniRing value={d.score} size={36} />
                  <p className="text-xs font-bold text-center truncate w-full" style={{ color: C.text }}>{d.street}</p>
                  <p className="text-[10px]" style={{ color: C.dim }}>{d.city}</p>
                </div>
              ))}
            </div>

            {/* Rows */}
            {[
              { label: "Gesamtscore", values: compData.map((d) => `${d.score}/100`), best: compData.map((d) => d.score === bestScore) },
              { label: "Bruttorendite", values: compData.map((d) => `${d.grossYield.toFixed(1)} %`), best: compData.map((d) => d.grossYield === bestYield) },
              { label: "Kaufpreisfaktor", values: compData.map((d) => `${d.factor.toFixed(1)}x`), best: compData.map((d) => d.factor === bestFactor) },
              { label: "Kaufpreis", values: compData.map((d) => `${d.price.toLocaleString("de-DE")} €`), best: compData.map((d) => d.price === Math.min(...compData.map((x) => x.price))) },
              { label: "Kaltmiete", values: compData.map((d) => `${d.rent.toLocaleString("de-DE")} €`), best: compData.map((d) => d.rent === Math.max(...compData.map((x) => x.rent))) },
              { label: "Energieklasse", values: compData.map((d) => d.energy), best: compData.map(() => false) },
              { label: "Lageklasse", values: compData.map((d) => d.location), best: compData.map(() => false) },
              { label: "Sanierungsbedarf", values: compData.map((d) => `${d.renovations} Gewerke`), best: compData.map((d) => d.renovations === Math.min(...compData.map((x) => x.renovations))) },
            ].map((row, rowIdx) => (
              <div key={row.label} className="grid gap-px" style={{ gridTemplateColumns: `160px repeat(${compData.length}, 1fr)`, background: C.border }}>
                <div className="p-3 flex items-center" style={{ background: rowIdx % 2 === 0 ? C.surface2 : C.bg2 }}>
                  <span className="text-xs font-medium" style={{ color: C.sub }}>{row.label}</span>
                </div>
                {row.values.map((val, i) => (
                  <div key={i} className="p-3 flex items-center justify-center gap-1" style={{ background: rowIdx % 2 === 0 ? C.surface2 : C.bg2 }}>
                    <span className="text-sm font-bold" style={{ color: row.best[i] ? C.green : C.text }}>{val}</span>
                    {row.best[i] && <span className="text-[10px] font-bold" style={{ color: C.green }}>BEST</span>}
                  </div>
                ))}
              </div>
            ))}

            {/* Subscore rows */}
            {compData[0].subscores.map((sub, subIdx) => {
              const vals = compData.map((d) => d.subscores[subIdx]?.value || 0);
              const bestVal = Math.max(...vals);
              return (
                <div key={sub.key} className="grid gap-px" style={{ gridTemplateColumns: `160px repeat(${compData.length}, 1fr)`, background: C.border }}>
                  <div className="p-3 flex items-center" style={{ background: subIdx % 2 === 0 ? C.surface2 : C.bg2 }}>
                    <span className="text-xs font-medium" style={{ color: C.sub }}>{sub.label.replace("-Score", "")}</span>
                  </div>
                  {vals.map((v, i) => (
                    <div key={i} className="p-3 flex items-center justify-center gap-1" style={{ background: subIdx % 2 === 0 ? C.surface2 : C.bg2 }}>
                      <span className="text-sm font-bold" style={{ color: v === bestVal ? C.green : C.text }}>{v}/100</span>
                      {v === bestVal && <span className="text-[10px] font-bold" style={{ color: C.green }}>BEST</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        {/* AI Recommendation */}
        {bestObj && (
          <AIComment variant="info">
            Unsere Empfehlung: <strong>{bestObj.street}</strong> bietet das beste Gesamtprofil mit einem Score von {bestObj.score}/100 und einer Bruttorendite von {bestObj.grossYield.toFixed(1)} %.
          </AIComment>
        )}
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">Immobilien vergleichen</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            Wählen Sie Immobilien für den Vergleich aus.
          </p>
        </div>
        {selected.length >= 2 && (
          <button
            onClick={() => setComparing(true)}
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Vergleichen ({selected.length})
          </button>
        )}
      </div>

      {/* Sort + Filter */}
      {analyses.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(["all", "favorites"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: filter === f ? C.accentMid : C.surface,
                  color: filter === f ? C.accent : C.sub,
                  border: `1px solid ${filter === f ? C.accent : C.border}`,
                }}
              >
                {f === "all" ? "Alle" : "Favoriten"}
              </button>
            ))}
          </div>
          <div className="h-4 w-px" style={{ background: C.border }} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub }}
          >
            <option value="date">Neueste</option>
            <option value="score">Bester Score</option>
            <option value="price">Niedrigster Preis</option>
            <option value="yield">Höchste Rendite</option>
          </select>
        </div>
      )}

      {/* Empty */}
      {analyses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <h2 className="text-base font-bold" style={{ color: C.text }}>
            Noch keine Immobilien zum Vergleichen
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
            Analysieren Sie Immobilien und speichern Sie sie unter &quot;Zum Vergleich&quot;.
          </p>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Neue Analyse starten
          </Link>
        </div>
      )}

      {filtered.length === 0 && analyses.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm" style={{ color: C.sub }}>Keine Favoriten vorhanden.</p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => {
            const inp = getInput(a);
            const res = getResult(a);
            const isSelected = selected.includes(a.id);
            const score = res.totalScore || 0;

            return (
              <div key={a.id} className="relative">
                {/* Checkbox overlay */}
                <button
                  onClick={() => toggleSelect(a.id)}
                  className="absolute top-3 left-3 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all"
                  style={{
                    background: isSelected ? C.accent : C.surface3,
                    border: `1.5px solid ${isSelected ? C.accent : C.border}`,
                  }}
                >
                  {isSelected && (
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                <PropertyCard
                  id={a.id}
                  address={inp.street || "—"}
                  city={inp.city || ""}
                  score={score}
                  price={inp.price || 0}
                  rent={inp.rent || 0}
                  area={inp.area || undefined}
                  locationGrade={inp.locationGrade || undefined}
                  purchaseDate={new Date(a.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  isFavorite={a.is_favorite}
                  onFavoriteToggle={() => handleToggleFav(a.id, a.is_favorite)}
                  showDelete
                  confirmingDelete={confirmDelete === a.id}
                  onDelete={() => setConfirmDelete(a.id)}
                  onConfirmDelete={() => handleDelete(a.id)}
                  onCancelDelete={() => setConfirmDelete(null)}
                  badge={score >= 70 ? "Empfohlen" : score >= 50 ? "Solide" : score < 40 ? "Vorsicht" : undefined}
                  badgeColor={score >= 70 ? C.green : score >= 50 ? C.amber : score < 40 ? C.red : undefined}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Hint */}
      {selected.length === 1 && (
        <p className="text-xs text-center" style={{ color: C.dim }}>Noch mindestens 1 Immobilie auswählen zum Vergleichen.</p>
      )}
    </div>
  );
}
