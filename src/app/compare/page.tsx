"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getAnalyses, deleteAnalysis } from "@/lib/db";
import { C, scoreColor, scoreLabel } from "@/lib/theme";
import { AIChat } from "@/components/AIChat";
import type { AIChatContext } from "@/components/AIChat";

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
  gross_yield: number;
  price_factor: number;
  created_at: string;
  inputs?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

function normalize(a: AnalysisRow) {
  if (a.total_score != null && a.total_score > 0) {
    const price = a.purchase_price || 0;
    const area = a.area_sqm || 0;
    const rent = a.monthly_rent || 0;
    return {
      id: a.id,
      address: a.address || "—",
      city: a.city || "",
      price,
      rent,
      area,
      year: a.building_year || 0,
      score: a.total_score || 0,
      grossYield: a.gross_yield || (price > 0 ? ((rent * 12) / price) * 100 : 0),
      factor: a.price_factor || (rent > 0 ? price / (rent * 12) : 0),
      propertyType: "",
      rooms: 0,
    };
  }
  const inp = (a.inputs || {}) as Record<string, number | string | string[]>;
  const res = (a.result || {}) as Record<string, number>;
  const price = Number(inp.purchasePrice ?? inp.price) || 0;
  const rent = Number(inp.monthlyRent ?? inp.rent) || 0;
  const area = Number(inp.areaSqm ?? inp.area) || 0;
  return {
    id: a.id,
    address: String(inp.address || inp.street || "—"),
    city: String(inp.city || ""),
    price,
    rent,
    area,
    year: Number(inp.buildingYear ?? inp.year) || 0,
    score: res.totalScore || 0,
    grossYield: res.grossYield || (price > 0 ? ((rent * 12) / price) * 100 : 0),
    factor: res.priceFactor || (rent > 0 ? price / (rent * 12) : 0),
    propertyType: String(inp.propertyType || ""),
    rooms: Number(inp.rooms) || 0,
  };
}

const PT_LABEL: Record<string, string> = { etw: "ETW", efh: "EFH", mfh: "MFH", dhh: "DHH" };

export default function ComparePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      try {
        const data = await getAnalyses(user!.id, { saveType: "comparison" });
        console.log('[Compare] data loaded:', data?.length, 'items, user_id:', user!.id);
        setAnalyses(((data || []) as AnalysisRow[]).slice(0, 4));
      } catch (err) {
        console.error('[Compare] load error:', err);
        setLoadError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.');
      }
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
  const bestScore = cards.length > 1 ? Math.max(...cards.map((d) => d.score)) : 0;

  if (loading) {
    return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;
  }

  /* ── Error State ── */
  if (loadError) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs mb-4 transition-opacity hover:opacity-80" style={{ color: C.dim }}>
          ← Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien-Vergleich</h1>
        </div>
        <div className="rounded-xl px-4 py-3 text-sm" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          Fehler beim Laden der Daten: {loadError}
        </div>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Immobilien-Vergleich</h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            {cards.length} {cards.length === 1 ? "Objekt" : "Objekte"} im Vergleich
          </p>
        </div>
        {cards.length < 4 && (
          <Link
            href="/analysis?new=1"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 text-center sm:text-left"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            + Objekt hinzufügen
          </Link>
        )}
      </div>

      {/* Cards — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((d) => {
          const isBestCard = cards.length > 1 && d.score === bestScore && d.score > 0;
          const ptLabel = PT_LABEL[d.propertyType] || "";
          const details = [ptLabel, d.rooms > 0 ? `${d.rooms} Zi.` : "", d.area > 0 ? `${d.area} m²` : ""].filter(Boolean).join(" · ");

          return (
            <Card
              key={d.id}
              className="p-0 overflow-hidden cursor-pointer transition-all"
              hover
              onClick={() => router.push(`/analysis?id=${d.id}`)}
            >
              {/* Header: Address + Details */}
              <div className="px-4 pt-4 pb-2">
                <p className="text-sm font-bold truncate" style={{ color: C.text }}>
                  {d.address}
                </p>
                {details && (
                  <p className="text-xs mt-0.5" style={{ color: C.dim }}>{details}</p>
                )}
              </div>

              {/* Score — big and centered */}
              <div className="flex flex-col items-center justify-center py-4 border-t border-b" style={{ borderColor: C.border }}>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold" style={{ color: scoreColor(d.score) }}>
                    {d.score}
                  </span>
                  <span className="text-sm font-medium" style={{ color: C.dim }}>/100</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold" style={{ color: scoreColor(d.score) }}>
                    {scoreLabel(d.score)}
                  </span>
                  {isBestCard && (
                    <span
                      className="text-[10px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                    >
                      Bestes Objekt
                    </span>
                  )}
                </div>
              </div>

              {/* Key facts */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.sub }}>Kaufpreis</span>
                  <span className="text-xs font-bold" style={{ color: C.text }}>{d.price.toLocaleString("de-DE")} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.sub }}>Rendite</span>
                  <span className="text-xs font-bold" style={{ color: d.grossYield >= 5 ? C.green : d.grossYield >= 3 ? C.amber : C.red }}>
                    {d.grossYield.toFixed(1)} %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: C.sub }}>Faktor</span>
                  <span className="text-xs font-bold" style={{ color: d.factor <= 20 ? C.green : d.factor <= 30 ? C.amber : C.red }}>
                    {d.factor.toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t px-4 py-2.5 space-y-1" style={{ borderColor: C.border }}>
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/analysis?id=${d.id}`); }}
                  className="w-full text-left text-xs font-semibold py-1 transition-all hover:opacity-80"
                  style={{ color: C.accent }}
                >
                  Analyse ansehen →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const ctrl = document.getElementById("ai-chat-controller") as unknown as { openWithQuestion?: (q: string, ctx?: AIChatContext) => void };
                    if (ctrl?.openWithQuestion) {
                      ctrl.openWithQuestion(
                        `Analysiere das Objekt ${d.address} (Score: ${d.score}, Rendite: ${d.grossYield.toFixed(1)}%, Faktor: ${d.factor.toFixed(1)}x, Preis: ${d.price.toLocaleString("de-DE")} €)`,
                        { type: "compare", data: cards.map(c => ({ address: c.address, score: c.score, grossYield: c.grossYield, factor: c.factor, price: c.price, area: c.area, year: c.year })) }
                      );
                    }
                    document.getElementById("ai-chat-controller")?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="w-full text-left text-[11px] font-semibold py-1 transition-all hover:opacity-80 flex items-center gap-1"
                  style={{ color: C.cyan }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  KI fragen
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(d.id); }}
                  className="w-full text-left text-[11px] py-0.5 transition-all hover:opacity-80"
                  style={{ color: C.dim }}
                >
                  Entfernen
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── KI-Berater ── */}
      <AIChat
        context={{ type: "compare", data: cards.map(c => ({ address: c.address, score: c.score, grossYield: c.grossYield, factor: c.factor, price: c.price, area: c.area, year: c.year })) }}
        suggestedQuestions={[
          "Welches Objekt ist das beste Investment?",
          "Vergleiche die Renditen der Objekte",
          "Welches Objekt hat das beste Preis-Leistungs-Verhältnis?",
          "Welche Risiken sehe ich bei den Objekten?",
        ]}
        title="KI-Vergleichsberater"
        subtitle="Fragen Sie die KI zum Vergleich Ihrer Objekte."
      />
    </div>
  );
}
