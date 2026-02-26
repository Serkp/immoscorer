"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAnalyses } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";

interface AnalysisRow {
  id: string;
  address?: string;
  city?: string;
  purchase_price?: number;
  monthly_rent?: number;
  area_sqm?: number;
  building_year?: number;
  energy_class?: string;
  total_score?: number;
  gross_yield?: number;
  net_yield?: number;
  price_factor?: number;
  created_at: string;
  /* legacy */
  inputs?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

function getScore(a: AnalysisRow): number {
  if (a.total_score && a.total_score > 0) return a.total_score;
  const res = a.result as { totalScore?: number } | undefined;
  return res?.totalScore || 0;
}

function getYield(a: AnalysisRow): number {
  if (a.gross_yield && a.gross_yield > 0) return a.gross_yield;
  const inp = a.inputs as { price?: number; rent?: number } | undefined;
  if (inp?.price && inp?.rent) return ((inp.rent * 12) / inp.price) * 100;
  return 0;
}

function getAddress(a: AnalysisRow): string {
  if (a.address) return a.address;
  const inp = a.inputs as { street?: string; city?: string } | undefined;
  if (inp?.street) return `${inp.street}, ${inp.city || ""}`;
  return String(inp?.city || "—");
}

function getDetails(a: AnalysisRow): string {
  const area = a.area_sqm || (a.inputs as { area?: number } | undefined)?.area || 0;
  const year = a.building_year || (a.inputs as { year?: number } | undefined)?.year || 0;
  const parts: string[] = [];
  if (area > 0) parts.push(`${area} m²`);
  if (year > 0) parts.push(`Bj. ${year}`);
  return parts.join(" · ");
}

function getPrice(a: AnalysisRow): number {
  if (a.purchase_price && a.purchase_price > 0) return a.purchase_price;
  const inp = a.inputs as { price?: number } | undefined;
  return inp?.price || 0;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRow[]>([]);
  const [compareCount, setCompareCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const [all, compare] = await Promise.all([
          getAnalyses(user!.id),
          getAnalyses(user!.id, { status: "saved", saveType: "comparison" }),
        ]);
        setAllAnalyses((all || []) as AnalysisRow[]);
        setCompareCount((compare || []).length);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AIOrb size={48} active />
      </div>
    );
  }

  const totalAnalyses = allAnalyses.length;
  const scores = allAnalyses.map(getScore).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const yields = allAnalyses.map(getYield).filter((y) => y > 0);
  const bestYield = yields.length > 0 ? Math.max(...yields) : 0;
  const recentAnalyses = allAnalyses.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: C.text }}>
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>
          Ihr Investment-Dashboard auf einen Blick.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Analysen"
          value={String(totalAnalyses)}
          sub={totalAnalyses === 1 ? "Analyse durchgeführt" : "Analysen durchgeführt"}
          color={C.accent}
        />
        <StatCard
          label="Im Vergleich"
          value={String(compareCount)}
          sub={compareCount === 1 ? "Objekt gespeichert" : "Objekte gespeichert"}
          color={C.blue}
        />
        <StatCard
          label="Ø Score"
          value={avgScore > 0 ? String(avgScore) : "—"}
          sub={avgScore > 0 ? scoreLabel(avgScore) : "Noch keine Daten"}
          color={avgScore > 0 ? scoreColor(avgScore) : C.dim}
        />
        <StatCard
          label="Beste Rendite"
          value={bestYield > 0 ? `${bestYield.toFixed(1)} %` : "—"}
          sub={bestYield > 0 ? "Bruttorendite" : "Noch keine Daten"}
          color={bestYield >= 5 ? C.green : bestYield >= 3 ? C.amber : C.dim}
        />
      </div>

      {/* ── Content depending on analyses count ── */}
      {totalAnalyses === 0 ? (
        /* Empty state / Welcome */
        <Card className="p-8 flex flex-col items-center text-center gap-5">
          <AIOrb size={56} active />
          <div>
            <h2 className="text-lg font-bold" style={{ color: C.text }}>
              Willkommen bei ImmoScorer
            </h2>
            <p className="text-sm mt-2 max-w-md" style={{ color: C.sub }}>
              Bewerten Sie Ihre erste Immobilie mit unserer KI-gestützten Analyse.
              Erhalten Sie sofort einen detaillierten Score mit Handlungsempfehlungen.
            </p>
          </div>
          <Link
            href="/analysis"
            className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Erste Analyse starten
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Recent Analyses ── */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold" style={{ color: C.text }}>Letzte Analysen</h2>
            <div className="space-y-3">
              {recentAnalyses.map((a) => {
                const score = getScore(a);
                const price = getPrice(a);
                return (
                  <Card key={a.id} className="p-4 flex items-center gap-4">
                    <ScoreRing value={score} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>
                        {getAddress(a)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: C.dim }}>
                        {getDetails(a)}
                        {price > 0 ? ` · ${price.toLocaleString("de-DE")} €` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: scoreColor(score) }}>
                        {score}/100
                      </p>
                      <p className="text-[10px]" style={{ color: C.dim }}>
                        {new Date(a.created_at).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold" style={{ color: C.text }}>Schnellaktionen</h2>
            <div className="space-y-3">
              <QuickAction
                href="/analysis"
                icon={
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                }
                label="Neue Analyse"
                desc="Immobilie bewerten"
              />
              <QuickAction
                href="/compare"
                icon={
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                }
                label="Objekte vergleichen"
                desc={`${compareCount} im Vergleich`}
              />
              <QuickAction
                href="/strategies"
                icon={
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                }
                label="Strategien"
                desc="Investment-Strategien entdecken"
              />
              <QuickAction
                href="/guide"
                icon={
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  </svg>
                }
                label="Wissensportal"
                desc="Immobilien-Fachwissen"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <Card className="p-5 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.dim }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: C.sub }}>
        {sub}
      </p>
    </Card>
  );
}

function QuickAction({ href, icon, label, desc }: { href: string; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link href={href}>
      <Card className="p-4 flex items-center gap-3 cursor-pointer transition-all hover:opacity-80" hover>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: C.surface2 }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: C.text }}>{label}</p>
          <p className="text-xs" style={{ color: C.dim }}>{desc}</p>
        </div>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Card>
    </Link>
  );
}
