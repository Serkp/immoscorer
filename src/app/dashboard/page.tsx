"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
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
  inputs?: Record<string, unknown>;
  result?: Record<string, unknown>;
  save_type?: string;
  property_type?: string;
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

function getPropertyInfo(a: AnalysisRow): string {
  const parts: string[] = [];
  const type = a.property_type || (a.inputs as { propertyType?: string } | undefined)?.propertyType;
  if (type) parts.push(type.toUpperCase());
  const area = a.area_sqm || (a.inputs as { area?: number } | undefined)?.area || 0;
  if (area > 0) parts.push(`${area}m²`);
  return parts.join(" · ");
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `vor ${weeks} Wo.`;
  return new Date(dateStr).toLocaleDateString("de-DE");
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allAnalyses, setAllAnalyses] = useState<AnalysisRow[]>([]);
  const [compareCount, setCompareCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const [all, compare] = await Promise.all([
          getAnalyses(user!.id),
          getAnalyses(user!.id, { status: "saved", saveType: "comparison" }),
        ]);
        console.log('[Dashboard] data loaded:', all?.length, 'analyses,', compare?.length, 'comparisons, user_id:', user!.id);
        setAllAnalyses((all || []) as AnalysisRow[]);
        setCompareCount((compare || []).length);
      } catch (err) {
        console.error('[Dashboard] load error:', err);
        setLoadError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.');
      }
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

  // Error banner
  if (loadError) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 animate-fade-up">
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: C.text }}>
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            Ihr Investment-Dashboard auf einen Blick.
          </p>
        </div>
        <div className="rounded-xl px-4 py-3 text-sm" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          Fehler beim Laden der Daten: {loadError}
        </div>
      </div>
    );
  }

  const totalAnalyses = allAnalyses.length;
  const scores = allAnalyses.map(getScore).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const yields = allAnalyses.map(getYield).filter((y) => y > 0);
  const bestYield = yields.length > 0 ? Math.max(...yields) : 0;
  const recentAnalyses = allAnalyses.slice(0, 5);

  // Empty state
  if (totalAnalyses === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 animate-fade-up">
        {/* Dashboard Header — always visible */}
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: C.text }}>
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            Ihr Investment-Dashboard auf einen Blick.
          </p>
        </div>

        <div className="flex flex-col items-center text-center pt-8 pb-8 gap-6">
          <AIOrb size={56} active />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: C.text }}>
              Willkommen bei ImmoScorer
            </h2>
            <p className="text-base mt-3 max-w-lg mx-auto" style={{ color: C.dim }}>
              Bewerten Sie Ihre erste Immobilie in unter 60 Sekunden.
            </p>
          </div>
          <Link
            href="/analysis"
            className="rounded-xl px-8 py-3.5 text-sm font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Erste Analyse starten →
          </Link>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4">
            {["Score in Sekunden", "6 Teilbewertungen", "Vergleich & Portfolio"].map((t) => (
              <span key={t} className="text-[13px]" style={{ color: C.dim }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Score color for avg
  const avgScoreColor = avgScore >= 70 ? C.green : avgScore >= 50 ? C.amber : avgScore > 0 ? C.orange : C.dim;

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-8 animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold" style={{ color: C.text }}>
          {getGreeting()}, {displayName}
        </h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>
          Ihr Investment-Dashboard auf einen Blick.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        <StatCard label="ANALYSEN" value={String(totalAnalyses)} sub="gesamt" color={C.text} />
        <StatCard label="IM VERGLEICH" value={String(compareCount)} sub="Objekte" color={C.text} />
        <StatCard
          label="Ø SCORE"
          value={avgScore > 0 ? String(avgScore) : "—"}
          sub={avgScore > 0 ? scoreLabel(avgScore) : "Noch keine Daten"}
          color={avgScoreColor}
        />
        <StatCard
          label="BESTE RENDITE"
          value={bestYield > 0 ? `${bestYield.toFixed(1)}%` : "—"}
          sub={bestYield > 0 ? "Bruttorendite" : "Noch keine Daten"}
          color={bestYield > 0 ? C.cyan : C.dim}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
        <ActionCard
          onClick={() => router.push("/analysis")}
          icon={<SearchIcon />}
          title="Neue Analyse"
          subtitle="Immobilie in Sekunden bewerten"
        />
        <ActionCard
          onClick={() => router.push("/compare")}
          icon={<ColumnsIcon />}
          title="Vergleich"
          subtitle={`${compareCount} Objekte vergleichen`}
        />
        <ActionCard
          onClick={() => router.push("/financing")}
          icon={<BankIcon />}
          title="Finanzierung"
          subtitle="Kostenlose Expertenberatung"
        />
      </div>

      {/* Recent Analyses */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-5" style={{ color: C.text }}>Letzte Analysen</h2>
        <div>
          {recentAnalyses.map((a, i) => {
            const score = getScore(a);
            const yld = getYield(a);
            const isLast = i === recentAnalyses.length - 1;
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 py-4 cursor-pointer transition-colors"
                style={{
                  borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
                onClick={() => router.push(`/analysis?id=${a.id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {/* Address */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.text }}>
                    {getAddress(a)}
                  </p>
                </div>
                {/* Property info — hidden on mobile */}
                <div className="hidden md:block shrink-0 w-28">
                  <p className="text-[13px]" style={{ color: C.dim }}>{getPropertyInfo(a)}</p>
                </div>
                {/* Score + dot + label */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: score > 0 ? scoreColor(score) : C.dim }}
                  />
                  <span className="text-base font-semibold" style={{ color: C.text }}>
                    {score > 0 ? score : "—"}
                  </span>
                  <span className="text-xs hidden sm:inline" style={{ color: score > 0 ? scoreColor(score) : C.dim }}>
                    {score > 0 ? scoreLabel(score) : ""}
                  </span>
                </div>
                {/* Yield — hidden on mobile */}
                <div className="hidden md:block shrink-0 w-16 text-right">
                  <span className="text-sm" style={{ color: C.cyan }}>
                    {yld > 0 ? `${yld.toFixed(1)}%` : "—"}
                  </span>
                </div>
                {/* Time — hidden on mobile */}
                <div className="hidden md:block shrink-0 w-24 text-right">
                  <span className="text-xs" style={{ color: C.dim }}>
                    {relativeTime(a.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {allAnalyses.length > 5 && (
          <Link href="/compare" className="inline-block mt-4 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: C.accent }}>
            Alle Analysen anzeigen →
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      className="rounded-2xl p-4 md:p-6"
      style={{
        background: C.surface2,
        border: `1px solid rgba(255,255,255,0.08)`,
        minWidth: 0,
      }}
    >
      <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest" style={{ color: C.dim, letterSpacing: "1px" }}>
        {label}
      </p>
      <p className="text-[28px] md:text-4xl font-bold mt-2 leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs mt-2" style={{ color: C.dim }}>{sub}</p>
    </div>
  );
}

/* ── Action Card ── */
function ActionCard({ onClick, icon, title, subtitle }: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 md:p-7 cursor-pointer transition-all duration-200"
      style={{
        background: C.surface2,
        border: `1px solid rgba(255,255,255,0.08)`,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="mb-3">{icon}</div>
      <p className="text-base font-semibold" style={{ color: C.text }}>{title}</p>
      <p className="text-[13px] mt-1.5" style={{ color: C.dim }}>{subtitle}</p>
    </div>
  );
}

/* ── Icons ── */
function SearchIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8 11h6M11 8v6" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 10h18M12 3l9 7H3l9-7z" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
    </svg>
  );
}
