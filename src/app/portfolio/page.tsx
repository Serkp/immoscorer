"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { MiniRing } from "@/components/ui/ScoreRing";
import { PropertyCard } from "@/components/PropertyCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPortfolioProperties, deletePortfolioProperty, togglePortfolioFavorite } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";

interface PortfolioProp {
  id: string;
  address: string;
  city: string;
  purchase_price: number;
  current_rent: number;
  area: number | null;
  build_year: number | null;
  energy_class: string | null;
  house_money: number | null;
  location_grade: string | null;
  renovations: string[];
  score: number | null;
  score_data: Record<string, unknown> | null;
  location_data: Record<string, unknown> | null;
  work_done: string | null;
  work_needed: string | null;
  is_favorite: boolean;
  created_at: string;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PortfolioProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PortfolioProp | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [sort, setSort] = useState<"date" | "score" | "yield">("date");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getPortfolioProperties(user!.id);
        setProperties((data || []) as PortfolioProp[]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleToggleFav(id: string, current: boolean) {
    try {
      await togglePortfolioFavorite(id, current);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_favorite: !current } : p))
      );
    } catch { /* silent */ }
  }

  async function handleDelete(id: string) {
    try {
      await deletePortfolioProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
      setDetail(null);
      setToast("Immobilie entfernt");
      setTimeout(() => setToast(null), 3000);
    } catch { /* silent */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AIOrb size={48} active />
      </div>
    );
  }

  // Detail view
  if (detail) {
    const sd = detail.score_data as Record<string, unknown> | null;
    const subscores = (sd?.subscores as Array<Record<string, unknown>>) || [];
    const strengths = (sd?.strengths as string[]) || [];
    const risks = (sd?.risks as string[]) || [];
    const grossYield = detail.purchase_price > 0 ? ((detail.current_rent * 12) / detail.purchase_price) * 100 : 0;
    const factor = detail.current_rent > 0 ? detail.purchase_price / (detail.current_rent * 12) : 0;

    return (
      <div className="mx-auto max-w-[800px] space-y-6 animate-fade-up">
        {/* Back */}
        <button onClick={() => setDetail(null)} className="flex items-center gap-2 text-xs font-semibold" style={{ color: C.sub }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Zurück zum Portfolio
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${C.accentDim}, rgba(76,154,255,0.08))` }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: C.text }}>{detail.address}</h1>
            <p className="text-sm" style={{ color: C.sub }}>{detail.city}</p>
          </div>
        </div>

        {/* Score + Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 flex flex-col items-center justify-center" glow>
            <MiniRing value={detail.score || 0} size={56} />
            <p className="text-xs font-bold mt-1" style={{ color: scoreColor(detail.score || 0) }}>{scoreLabel(detail.score || 0)}</p>
          </Card>
          <StatCard label="Kaufpreis" value={`${detail.purchase_price.toLocaleString("de-DE")} €`} />
          <StatCard label="Miete" value={`${detail.current_rent.toLocaleString("de-DE")} €/Mon.`} />
          <StatCard label="Rendite" value={`${grossYield.toFixed(2)} %`} color={grossYield >= 4 ? C.green : grossYield >= 3 ? C.amber : C.red} />
        </div>

        {/* Detail Grid */}
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: C.text }}>Objektdaten</h3>
          <div className="grid grid-cols-2 gap-2">
            <DetailRow label="Fläche" value={detail.area ? `${detail.area} m²` : "—"} />
            <DetailRow label="Baujahr" value={detail.build_year ? String(detail.build_year) : "—"} />
            <DetailRow label="Energie" value={detail.energy_class || "—"} />
            <DetailRow label="Hausgeld" value={detail.house_money ? `${detail.house_money} €/Mon.` : "—"} />
            <DetailRow label="Lageklasse" value={detail.location_grade ? `Klasse ${detail.location_grade}` : "—"} />
            <DetailRow label="Faktor" value={`${factor.toFixed(1)}x`} />
          </div>
        </Card>

        {/* Teilscores */}
        {subscores.length > 0 && (
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold" style={{ color: C.text }}>Teilscores</h3>
            {subscores.map((s) => (
              <div key={s.key as string} className="flex items-center gap-3">
                <MiniRing value={s.value as number} size={32} />
                <div className="flex-1">
                  <span className="text-xs font-semibold" style={{ color: C.text }}>{s.label as string}</span>
                  {(s.oneLiner as string) ? <p className="text-[10px]" style={{ color: C.dim }}>{s.oneLiner as string}</p> : null}
                </div>
                <span className="text-xs font-bold" style={{ color: scoreColor(s.value as number) }}>{s.value as number}/100</span>
              </div>
            ))}
          </Card>
        )}

        {/* Strengths + Risks */}
        {(strengths.length > 0 || risks.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            {strengths.length > 0 && (
              <Card className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />
                  <h4 className="text-xs font-bold">Stärken</h4>
                </div>
                {strengths.map((s, i) => (
                  <p key={i} className="text-xs leading-relaxed" style={{ color: C.sub }}>
                    <span style={{ color: C.green }}>·</span> {s}
                  </p>
                ))}
              </Card>
            )}
            {risks.length > 0 && (
              <Card className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: C.amber }} />
                  <h4 className="text-xs font-bold">Risiken</h4>
                </div>
                {risks.map((r, i) => (
                  <p key={i} className="text-xs leading-relaxed" style={{ color: C.sub }}>
                    <span style={{ color: C.amber }}>·</span> {r}
                  </p>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* Work done / needed */}
        {(detail.work_done || detail.work_needed) && (
          <div className="grid md:grid-cols-2 gap-4">
            {detail.work_done && (
              <Card className="p-5 space-y-2">
                <h4 className="text-xs font-bold" style={{ color: C.green }}>Getätigte Maßnahmen</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{detail.work_done}</p>
              </Card>
            )}
            {detail.work_needed && (
              <Card className="p-5 space-y-2">
                <h4 className="text-xs font-bold" style={{ color: C.amber }}>Ausstehende Maßnahmen</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{detail.work_needed}</p>
              </Card>
            )}
          </div>
        )}

        {/* Recommendations */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>Nächste Schritte</h3>
          <ul className="space-y-2">
            {getNextSteps(detail).map((step, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                <span className="mt-0.5 shrink-0" style={{ color: C.green }}>{"\u2192"}</span>
                {step}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    );
  }

  const filtered = filter === "favorites" ? properties.filter((p) => p.is_favorite) : properties;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "score") return (b.score || 0) - (a.score || 0);
    if (sort === "yield") {
      const yA = a.purchase_price > 0 ? (a.current_rent * 12) / a.purchase_price : 0;
      const yB = b.purchase_price > 0 ? (b.current_rent * 12) / b.purchase_price : 0;
      return yB - yA;
    }
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Stats
  const totalValue = properties.reduce((sum, p) => sum + p.purchase_price, 0);
  const avgScore = properties.length > 0
    ? Math.round(properties.reduce((sum, p) => sum + (p.score || 0), 0) / properties.length)
    : 0;
  const avgYield = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.purchase_price > 0 ? ((p.current_rent * 12) / p.purchase_price) * 100 : 0), 0) / properties.length
    : 0;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Portfolio</h1>
          {properties.length > 0 && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: C.surface3, color: C.sub }}>
              {properties.length} Objekte
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

      {/* Stats */}
      {properties.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard icon="house" label="Immobilien" value={String(properties.length)} />
          <SummaryCard icon="star" label="Ø Score" value={`${avgScore}/100`} color={scoreColor(avgScore)} />
          <SummaryCard icon="euro" label="Gesamtwert" value={`${(totalValue / 1000).toFixed(0)}k €`} />
          <SummaryCard icon="percent" label="Ø Rendite" value={`${avgYield.toFixed(2)} %`} color={avgYield >= 4 ? C.green : avgYield >= 3 ? C.amber : C.red} />
        </div>
      )}

      {/* Filter + Sort */}
      {properties.length > 0 && (
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
            <option value="date">Neueste zuerst</option>
            <option value="score">Bester Score</option>
            <option value="yield">Höchste Rendite</option>
          </select>
        </div>
      )}

      {/* Empty */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <h2 className="text-base font-bold" style={{ color: C.text }}>
            Noch keine Immobilien in Ihrem Portfolio
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
            Analysieren Sie eine Immobilie und speichern Sie sie als &quot;Meine Immobilie&quot;.
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

      {sorted.length === 0 && properties.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm" style={{ color: C.sub }}>Keine Favoriten vorhanden.</p>
        </div>
      )}

      {/* Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              address={p.address}
              city={p.city || ""}
              score={p.score || 0}
              price={p.purchase_price}
              rent={p.current_rent}
              area={p.area || undefined}
              locationGrade={p.location_grade || undefined}
              purchaseDate={new Date(p.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
              isFavorite={p.is_favorite}
              onFavoriteToggle={() => handleToggleFav(p.id, p.is_favorite)}
              onClick={() => setDetail(p)}
              showDelete
              confirmingDelete={confirmDelete === p.id}
              onDelete={() => setConfirmDelete(p.id)}
              onConfirmDelete={() => handleDelete(p.id)}
              onCancelDelete={() => setConfirmDelete(null)}
              badge={p.work_needed ? "Sanierung nötig" : undefined}
              badgeColor={p.work_needed ? C.amber : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

function SummaryCard({ icon, label, value, color }: { icon: string; label: string; value: string; color?: string }) {
  const iconSvg = icon === "house" ? (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ) : icon === "star" ? (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
  ) : icon === "euro" ? (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
  ) : (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
  );

  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.surface }}>
        {iconSvg}
      </div>
      <div>
        <p className="text-base font-bold" style={{ color: color || C.text }}>{value}</p>
        <p className="text-[10px]" style={{ color: C.dim }}>{label}</p>
      </div>
    </Card>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-sm font-bold" style={{ color: color || C.text }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </Card>
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

function getNextSteps(p: PortfolioProp): string[] {
  const steps: string[] = [];
  const energyIdx = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"].indexOf(p.energy_class || "");
  if (energyIdx >= 5) {
    steps.push("Energetische Sanierung kann den Wert um ~15 % steigern und GEG-Anforderungen erfüllen.");
  }
  const grossYield = p.purchase_price > 0 ? ((p.current_rent * 12) / p.purchase_price) * 100 : 0;
  if (grossYield < 4) {
    steps.push("Mieterhöhung nach §558 BGB prüfen (Mietspiegel vergleichen).");
  }
  if (p.work_needed) {
    steps.push("Ausstehende Sanierungsmaßnahmen zeitnah umsetzen für Werterhalt.");
  }
  if ((p.score || 0) >= 70) {
    steps.push("Starkes Objekt — Sondertilgungsmöglichkeiten bei der Bank prüfen.");
  }
  if (steps.length === 0) {
    steps.push("Regelmäßig Marktmiete prüfen und bei Bedarf anpassen.");
    steps.push("Instandhaltungsrücklage im WEG-Wirtschaftsplan kontrollieren.");
  }
  return steps;
}
