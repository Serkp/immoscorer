"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { MiniRing } from "@/components/ui/ScoreRing";
import { AIComment } from "@/components/ui/AIComment";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { getProperties } from "@/lib/db";
import { C } from "@/lib/theme";

interface DBProperty {
  id: string;
  street: string;
  city: string;
  price: number;
  rent: number;
  hausgeld: number;
  area: number;
  year: number;
  energy_class: string;
  location_grade: string;
  renovations: string[];
  total_score: number;
  is_favorite: boolean;
  created_at: string;
}

const ENERGY_RANK: Record<string, number> = { "A+": 0, A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8 };

export default function ComparePage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!user || subLoading) return;
    if (!isPro) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getProperties(user!.id);
        setProperties((data || []) as DBProperty[]);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    load();
  }, [user, isPro, subLoading]);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  const picks = useMemo(() => properties.filter((p) => selected.includes(p.id)), [properties, selected]);

  const rows = useMemo(() => {
    if (picks.length < 2) return null;
    const scores = picks.map((p) => p.total_score);
    const yields = picks.map((p) => (p.price > 0 ? ((p.rent * 12) / p.price) * 100 : 0));
    const factors = picks.map((p) => (p.rent > 0 ? p.price / (p.rent * 12) : 999));
    const energyRanks = picks.map((p) => ENERGY_RANK[p.energy_class] ?? 99);
    const renos = picks.map((p) => (p.renovations?.length ?? 0));

    const bestScore = Math.max(...scores);
    const bestYield = Math.max(...yields);
    const bestFactor = Math.min(...factors);
    const bestEnergy = Math.min(...energyRanks);
    const bestReno = Math.min(...renos);

    return {
      scores, yields, factors, energyRanks, renos,
      bestScore, bestYield, bestFactor, bestEnergy, bestReno,
    };
  }, [picks]);

  const aiText = useMemo(() => {
    if (!rows || picks.length < 2) return "";
    const maxYieldIdx = rows.yields.indexOf(Math.max(...rows.yields));
    const minRenoIdx = rows.renos.indexOf(Math.min(...rows.renos));
    const best = picks[rows.scores.indexOf(Math.max(...rows.scores))];
    const yieldPick = picks[maxYieldIdx];
    const safePick = picks[minRenoIdx];

    const parts: string[] = [];
    parts.push(`${best.street} erreicht den höchsten Gesamtscore (${best.total_score}/100).`);
    if (yieldPick.id !== best.id) {
      parts.push(`${yieldPick.street} bietet mit ${rows.yields[maxYieldIdx].toFixed(1)} % die höchste Bruttorendite.`);
    }
    if (safePick.id !== best.id && safePick.id !== yieldPick.id) {
      parts.push(`${safePick.street} hat das geringste Sanierungsrisiko.`);
    }
    parts.push("Für einen konservativen Anleger empfehlen wir das Objekt mit dem höchsten Score bei gleichzeitig niedrigem Sanierungsbedarf.");
    return parts.join(" ");
  }, [rows, picks]);

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AIOrb size={48} active />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <AIOrb size={56} active />
        <h2 className="text-lg font-bold" style={{ color: C.text }}>Vergleichstool freischalten</h2>
        <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
          Upgrade auf ImmoScorer Pro, um Immobilien nebeneinander zu vergleichen.
        </p>
        <Link
          href="/analysis"
          className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
        >
          Upgrade auf Pro
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Immobilien vergleichen</h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>
          Wählen Sie mindestens 2 Immobilien aus Ihrem Portfolio zum Vergleich.
        </p>
      </div>

      {/* Empty */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <p className="text-sm" style={{ color: C.sub }}>Noch keine Immobilien vorhanden.</p>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Erste Analyse starten
          </Link>
        </div>
      )}

      {/* Selection pills */}
      {properties.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {properties.map((p) => {
            const active = selected.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                style={{
                  background: active ? C.accentMid : C.surface,
                  border: `1px solid ${active ? C.accent : C.border}`,
                  color: active ? C.accent : C.sub,
                }}
              >
                {p.street} · {p.total_score}
              </button>
            );
          })}
        </div>
      )}

      {/* Hint */}
      {selected.length > 0 && selected.length < 2 && (
        <p className="text-xs" style={{ color: C.dim }}>Noch {2 - selected.length} Immobilie{selected.length === 0 ? "n" : ""} auswählen.</p>
      )}

      {/* Comparison table */}
      {rows && picks.length >= 2 && (
        <Card className="overflow-hidden">
          {/* Header row */}
          <div className="grid gap-px" style={{ gridTemplateColumns: `140px repeat(${picks.length}, 1fr)`, background: C.border }}>
            <div className="p-3" style={{ background: C.bg2 }} />
            {picks.map((p) => (
              <div key={p.id} className="p-3 flex flex-col items-center gap-1.5" style={{ background: C.bg2 }}>
                <MiniRing value={p.total_score} size={36} />
                <p className="text-xs font-bold text-center truncate w-full" style={{ color: C.text }}>{p.street}</p>
                <p className="text-[10px]" style={{ color: C.dim }}>{p.city}</p>
              </div>
            ))}

            {/* Gesamtscore */}
            <div className="p-3 flex items-center" style={{ background: C.surface2 }}>
              <span className="text-xs font-medium" style={{ color: C.sub }}>Gesamtscore</span>
            </div>
            {picks.map((p, i) => (
              <div key={p.id} className="p-3 flex items-center justify-center" style={{ background: C.surface2 }}>
                <span className="text-sm font-bold" style={{ color: rows.scores[i] === rows.bestScore ? C.green : C.text }}>
                  {p.total_score}/100
                </span>
              </div>
            ))}

            {/* Nettorendite */}
            <div className="p-3 flex items-center" style={{ background: C.bg2 }}>
              <span className="text-xs font-medium" style={{ color: C.sub }}>Nettorendite</span>
            </div>
            {picks.map((p, i) => (
              <div key={p.id} className="p-3 flex items-center justify-center" style={{ background: C.bg2 }}>
                <span className="text-sm font-bold" style={{ color: rows.yields[i] === rows.bestYield ? C.green : C.text }}>
                  {rows.yields[i].toFixed(1)} %
                </span>
              </div>
            ))}

            {/* Kaufpreisfaktor */}
            <div className="p-3 flex items-center" style={{ background: C.surface2 }}>
              <span className="text-xs font-medium" style={{ color: C.sub }}>Kaufpreisfaktor</span>
            </div>
            {picks.map((p, i) => (
              <div key={p.id} className="p-3 flex items-center justify-center" style={{ background: C.surface2 }}>
                <span className="text-sm font-bold" style={{ color: rows.factors[i] === rows.bestFactor ? C.green : C.text }}>
                  {rows.factors[i].toFixed(1)}x
                </span>
              </div>
            ))}

            {/* Energieklasse */}
            <div className="p-3 flex items-center" style={{ background: C.bg2 }}>
              <span className="text-xs font-medium" style={{ color: C.sub }}>Energieklasse</span>
            </div>
            {picks.map((p, i) => (
              <div key={p.id} className="p-3 flex items-center justify-center" style={{ background: C.bg2 }}>
                <span className="text-sm font-bold" style={{ color: rows.energyRanks[i] === rows.bestEnergy ? C.green : C.text }}>
                  {p.energy_class}
                </span>
              </div>
            ))}

            {/* Risiko-Level */}
            <div className="p-3 flex items-center" style={{ background: C.surface2 }}>
              <span className="text-xs font-medium" style={{ color: C.sub }}>Risiko-Level</span>
            </div>
            {picks.map((p, i) => {
              const riskLabel = rows.renos[i] <= 1 ? "Niedrig" : rows.renos[i] <= 3 ? "Mittel" : "Hoch";
              const riskColor = rows.renos[i] <= 1 ? C.green : rows.renos[i] <= 3 ? C.amber : C.red;
              return (
                <div key={p.id} className="p-3 flex items-center justify-center" style={{ background: C.surface2 }}>
                  <span className="text-sm font-bold" style={{ color: rows.renos[i] === rows.bestReno ? C.green : riskColor }}>
                    {riskLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AI summary */}
      {aiText && (
        <AIComment variant="info">{aiText}</AIComment>
      )}
    </div>
  );
}
