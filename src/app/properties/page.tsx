"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { MiniRing } from "@/components/ui/ScoreRing";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { getProperties, deleteProperty, toggleFavorite } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";

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
  result: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user || subLoading) return;
    if (!isPro) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getProperties(user!.id);
        setProperties((data || []) as DBProperty[]);
      } catch { /* allow empty */ }
      finally { setLoading(false); }
    }
    load();
  }, [user, isPro, subLoading]);

  async function handleToggleFav(id: string, current: boolean) {
    try {
      await toggleFavorite(id, current);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !current } : p))
      );
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
      setExpanded(null);
    } catch { /* silent */ }
  }

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
        <h2 className="text-lg font-bold" style={{ color: C.text }}>Portfolio freischalten</h2>
        <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
          Upgrade auf ImmoScorer Pro, um Immobilien zu speichern, verwalten und vergleichen.
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

  const sorted = [...properties].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Meine Immobilien</h1>
          {properties.length > 0 && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: C.surface3, color: C.sub }}
            >
              {properties.length}
            </span>
          )}
        </div>
        <Link
          href="/analysis"
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
        >
          Neue Analyse
        </Link>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <h2 className="text-base font-bold" style={{ color: C.text }}>
            Noch keine Immobilien gespeichert
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
            Starten Sie Ihre erste Analyse, um Immobilien hier zu sehen.
          </p>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Zur Analyse
          </Link>
        </div>
      )}

      {/* Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p) => {
            const grossYield = p.price > 0 ? ((p.rent * 12) / p.price) * 100 : 0;
            const sqmPrice = p.area > 0 ? p.price / p.area : 0;
            const factor = p.rent > 0 ? p.price / (p.rent * 12) : 0;
            const isExpanded = expanded === p.id;
            const result = p.result as Record<string, unknown>;
            const subscores = (result?.subscores as Array<Record<string, unknown>>) || [];

            return (
              <Card key={p.id} className="overflow-hidden" hover>
                {/* Top row */}
                <div className="flex items-start justify-between p-4 pb-0">
                  <MiniRing value={p.total_score} size={40} />
                  <div className="flex items-center gap-2">
                    {/* Delete */}
                    {confirmDelete === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="rounded-lg px-2 py-1 text-[10px] font-bold"
                          style={{ background: C.redDim, color: C.red }}
                        >
                          Ja
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg px-2 py-1 text-[10px] font-bold"
                          style={{ background: C.surface3, color: C.sub }}
                        >
                          Nein
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="p-1.5 rounded-lg transition-all hover:opacity-70"
                        title="Löschen"
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                        </svg>
                      </button>
                    )}
                    {/* Favorite */}
                    <button
                      onClick={() => handleToggleFav(p.id, p.is_favorite)}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70"
                      title={p.is_favorite ? "Favorit entfernen" : "Als Favorit markieren"}
                    >
                      <svg width={16} height={16} viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                          fill={p.is_favorite ? C.red : "none"}
                          stroke={p.is_favorite ? C.red : C.dim}
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="px-4 pt-3">
                  <p className="text-sm font-bold truncate" style={{ color: C.text }}>{p.street}</p>
                  <p className="text-xs" style={{ color: C.sub }}>{p.city}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 px-4 pt-3">
                  <PropMetric label="Rendite" value={`${grossYield.toFixed(1)} %`} good={grossYield >= 4} />
                  <PropMetric label="€/m²" value={`${Math.round(sqmPrice).toLocaleString("de-DE")}`} good={sqmPrice <= 3500} />
                  <PropMetric label="Faktor" value={`${factor.toFixed(1)}x`} good={factor <= 25} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 mt-2 border-t" style={{ borderColor: C.border }}>
                  <span className="text-[10px]" style={{ color: C.dim }}>
                    {new Date(p.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                    className="rounded-lg px-3 py-1 text-[11px] font-semibold transition-all"
                    style={{ background: C.surface3, color: C.sub }}
                  >
                    {isExpanded ? "Schließen" : "Details"}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t animate-fade-up" style={{ borderColor: C.border }}>
                    <div className="pt-3 grid grid-cols-2 gap-2">
                      <DetailRow label="Kaufpreis" value={`${p.price.toLocaleString("de-DE")} €`} />
                      <DetailRow label="Kaltmiete" value={`${p.rent.toLocaleString("de-DE")} €/Mon.`} />
                      <DetailRow label="Hausgeld" value={`${p.hausgeld.toLocaleString("de-DE")} €/Mon.`} />
                      <DetailRow label="Fläche" value={`${p.area} m²`} />
                      <DetailRow label="Baujahr" value={String(p.year)} />
                      <DetailRow label="Energie" value={p.energy_class} />
                      <DetailRow label="Lage" value={`Klasse ${p.location_grade}`} />
                      <DetailRow label="Bewertung" value={scoreLabel(p.total_score)} />
                    </div>
                    {subscores.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold" style={{ color: C.dim }}>Teilscores</p>
                        {subscores.map((s) => (
                          <div key={s.key as string} className="flex items-center justify-between">
                            <span className="text-[11px]" style={{ color: C.sub }}>{s.label as string}</span>
                            <span className="text-[11px] font-bold" style={{ color: scoreColor(s.value as number) }}>
                              {s.value as number}/100
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PropMetric({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: C.surface }}>
      <p className="text-xs font-bold" style={{ color: good ? C.green : C.amber }}>{value}</p>
      <p className="text-[9px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: C.surface }}>
      <span className="text-[10px]" style={{ color: C.dim }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: C.text }}>{value}</span>
    </div>
  );
}
