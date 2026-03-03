"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getPortfolioProperties, deletePortfolioProperty } from "@/lib/db";
import { estimateMarketValue, monthsUntilFixedRateExpiry, getZinsbindungWarning, getStrategyRecommendations } from "@/lib/portfolio-utils";
import { findCityData } from "@/data/german-cities";
import { C } from "@/lib/theme";
import { AIChat } from "@/components/AIChat";
import type { AIChatContext } from "@/components/AIChat";

const PT_LABEL: Record<string, string> = { etw: "ETW", efh: "EFH", mfh: "MFH", dhh: "DHH" };

/* ─── Type for DB rows ─── */
interface PP {
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
  property_type: string | null;
  rooms: number | null;
  purchase_date: string | null;
  loan_amount: number | null;
  interest_rate: number | null;
  fixed_rate_until: string | null;
  monthly_payment: number | null;
  repayment_rate: number | null;
  special_repayment_allowed: boolean;
  special_repayment_amount: number | null;
  is_rented: string | null;
  monthly_rent: number | null;
  rental_since: string | null;
  unit_count: number | null;
  total_rent: number | null;
  units_rented: number | null;
  estimated_market_value: number | null;
  is_favorite: boolean;
  created_at: string;
}

function getRent(p: PP): number {
  return p.monthly_rent || p.total_rent || p.current_rent || 0;
}

function getMarketValue(p: PP): number {
  if (p.estimated_market_value && p.estimated_market_value > 0) return p.estimated_market_value;
  return estimateMarketValue({
    city: p.city || "",
    area: p.area || 50,
    buildYear: p.build_year || 1990,
    energyClass: p.energy_class || "C",
    locationGrade: p.location_grade || "B",
  });
}

function formatPurchaseDate(d: string | null): string {
  if (!d) return "—";
  const [m, y] = d.split("/");
  const monthNames = ["", "Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
  return `${monthNames[Number(m)] || m} ${y}`;
}

/* ══════════════════════════════════════ */

export default function PortfolioPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PP[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PP | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showFinanzierung, setShowFinanzierung] = useState(false);
  const [finanzProp, setFinanzProp] = useState<PP | null>(null);
  const [finanzForm, setFinanzForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "", consent: false });
  const [finanzSending, setFinanzSending] = useState(false);
  const [finanzSent, setFinanzSent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const data = await getPortfolioProperties(user.id);
        setProperties((data || []) as PP[]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [user]);

  async function handleDelete(id: string) {
    try {
      await deletePortfolioProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
      if (detail?.id === id) setDetail(null);
      setToast("Immobilie entfernt");
      setTimeout(() => setToast(null), 3000);
    } catch { /* silent */ }
  }

  function openFinanzierung(p: PP) {
    setFinanzProp(p);
    setFinanzForm({ firstName: "", lastName: "", email: "", phone: "", message: `Anschlussfinanzierung für ${p.address}, ${p.city}. Restschuld ca. ${(p.loan_amount || 0).toLocaleString("de-DE")} €. Zinsbindung bis ${p.fixed_rate_until || "k.A."}.`, consent: false });
    setFinanzSent(false);
    setShowFinanzierung(true);
  }

  async function handleFinanzierung() {
    if (!user || finanzSending) return;
    if (!finanzForm.firstName || !finanzForm.lastName || !finanzForm.phone || !finanzForm.consent) return;
    setFinanzSending(true);
    try {
      await fetch("/api/financing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName: finanzForm.firstName,
          lastName: finanzForm.lastName,
          email: finanzForm.email || user.email,
          phone: finanzForm.phone,
          message: finanzForm.message,
          propertyAddress: finanzProp ? `${finanzProp.address}, ${finanzProp.city}` : "",
          purchasePrice: finanzProp?.purchase_price || 0,
          monthlyRent: getRent(finanzProp!),
          score: 0,
        }),
      });
      setFinanzSent(true);
    } catch { /* silent */ }
    finally { setFinanzSending(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;

  /* ══════════════════════════════════════
     DETAIL VIEW
     ══════════════════════════════════════ */
  if (detail) {
    const d = detail;
    const mv = getMarketValue(d);
    const rent = getRent(d);
    const hausgeld = d.house_money || 0;
    const rate = d.monthly_payment || 0;
    const cashflow = rent - rate - hausgeld;
    const yearCf = cashflow * 12;
    const valueChange = d.purchase_price > 0 ? ((mv - d.purchase_price) / d.purchase_price * 100) : 0;
    const monthsLeft = monthsUntilFixedRateExpiry(d.fixed_rate_until);
    const warning = getZinsbindungWarning(monthsLeft);
    const cityData = findCityData(d.city || "");
    const rentPerSqm = (d.area && d.area > 0 && rent > 0) ? rent / d.area : 0;

    const recs = getStrategyRecommendations({
      fixedRateUntil: d.fixed_rate_until,
      cashflow,
      marketValue: mv,
      purchasePrice: d.purchase_price,
      rentPerSqm,
      avgRentPerSqm: cityData?.avgRentPerSqm || null,
      energyClass: d.energy_class || "C",
      repaymentRate: d.repayment_rate || 0,
      loanAmount: d.loan_amount || 0,
    });

    return (
      <div className="mx-auto max-w-[800px] space-y-6 animate-fade-up">
        <button onClick={() => setDetail(null)} className="flex items-center gap-2 text-xs font-semibold" style={{ color: C.sub }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Zurück zum Portfolio
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${C.accentDim}, rgba(76,154,255,0.08))` }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: C.text }}>{d.address}</h1>
            <p className="text-sm" style={{ color: C.sub }}>{d.city}</p>
          </div>
        </div>

        {/* Market Value + Value Change */}
        <Card className="p-5 space-y-2" glow>
          <p className="text-xs font-medium" style={{ color: C.dim }}>Geschätzter Marktwert</p>
          <p className="text-2xl font-bold" style={{ color: mv >= d.purchase_price ? C.green : C.red }}>
            {mv.toLocaleString("de-DE")} €
          </p>
          <p className="text-xs font-semibold" style={{ color: valueChange >= 0 ? C.green : C.red }}>
            {valueChange >= 0 ? "+" : ""}{valueChange.toFixed(1)} % seit Kauf
            <span style={{ color: C.dim }}> ({(mv - d.purchase_price) >= 0 ? "+" : ""}{(mv - d.purchase_price).toLocaleString("de-DE")} €)</span>
          </p>
          <p className="text-[10px]" style={{ color: C.dim }}>Schätzung basierend auf regionalen Durchschnittspreisen. Kein Gutachten.</p>
        </Card>

        {/* Objektdaten */}
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: C.text }}>Objektdaten</h3>
          <div className="grid grid-cols-2 gap-2">
            <DRow label="Objektart" value={PT_LABEL[d.property_type || ""] || "—"} />
            <DRow label="Zimmer" value={d.rooms ? String(d.rooms) : "—"} />
            <DRow label="Fläche" value={d.area ? `${d.area} m²` : "—"} />
            <DRow label="Baujahr" value={d.build_year ? String(d.build_year) : "—"} />
            <DRow label="Energieklasse" value={d.energy_class || "—"} />
            <DRow label="Kaufdatum" value={formatPurchaseDate(d.purchase_date)} />
            <DRow label="Kaufpreis" value={d.purchase_price > 0 ? `${d.purchase_price.toLocaleString("de-DE")} €` : "—"} />
            <DRow label="Lageklasse" value={d.location_grade ? `Klasse ${d.location_grade}` : "—"} />
          </div>
        </Card>

        {/* Finanzierung */}
        {(d.loan_amount || d.interest_rate || d.monthly_payment) && (
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: C.text }}>Finanzierung</h3>
            <div className="grid grid-cols-2 gap-2">
              <DRow label="Darlehen" value={d.loan_amount ? `${d.loan_amount.toLocaleString("de-DE")} €` : "—"} />
              <DRow label="Zinssatz" value={d.interest_rate ? `${d.interest_rate} %` : "—"} />
              <DRow label="Monatl. Rate" value={d.monthly_payment ? `${d.monthly_payment.toLocaleString("de-DE")} €` : "—"} />
              <DRow label="Tilgung" value={d.repayment_rate ? `${d.repayment_rate} %` : "—"} />
              <DRow label="Zinsbindung bis" value={d.fixed_rate_until || "—"} />
              <DRow label="Sondertilgung" value={d.special_repayment_allowed ? `${(d.special_repayment_amount || 0).toLocaleString("de-DE")} €/J.` : "Nein"} />
            </div>
            {warning && (
              <div className="mt-3 rounded-xl px-4 py-3" style={{ background: warnBg(warning.level), border: `1px solid ${warnBorder(warning.level)}` }}>
                <p className="text-xs font-semibold" style={{ color: warnColor(warning.level) }}>{warning.text}</p>
                <button onClick={() => openFinanzierung(d)} className="mt-2 text-xs font-bold transition-opacity hover:opacity-80" style={{ color: warnColor(warning.level) }}>
                  {warning.cta} →
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Cashflow */}
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-3" style={{ color: C.text }}>Cashflow</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span style={{ color: C.sub }}>Mieteinnahmen</span><span className="font-semibold" style={{ color: C.text }}>{rent.toLocaleString("de-DE")} €/Mon.</span></div>
            {rate > 0 && <div className="flex justify-between text-xs"><span style={{ color: C.sub }}>Kreditrate</span><span className="font-semibold" style={{ color: C.red }}>-{rate.toLocaleString("de-DE")} €/Mon.</span></div>}
            {hausgeld > 0 && <div className="flex justify-between text-xs"><span style={{ color: C.sub }}>Hausgeld</span><span className="font-semibold" style={{ color: C.red }}>-{hausgeld.toLocaleString("de-DE")} €/Mon.</span></div>}
            <div className="h-px" style={{ background: C.border }} />
            <div className="flex justify-between text-sm font-bold"><span style={{ color: C.text }}>Netto-Cashflow</span><span style={{ color: cashflow >= 0 ? C.green : C.red }}>{cashflow >= 0 ? "+" : ""}{cashflow.toLocaleString("de-DE")} €/Mon.</span></div>
            <p className="text-[10px]" style={{ color: C.dim }}>Jahres-Cashflow: {yearCf >= 0 ? "+" : ""}{yearCf.toLocaleString("de-DE")} €</p>
          </div>
        </Card>

        {/* Strategie-Empfehlungen */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>Strategieempfehlung</h3>
          {recs.map((r, i) => (
            <div key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
              <span className="mt-0.5 shrink-0" style={{ color: C.accent }}>→</span>
              <div>
                {r.text}
                {r.action && (
                  <button onClick={() => openFinanzierung(d)} className="block mt-1 text-xs font-bold transition-opacity hover:opacity-80" style={{ color: C.accent }}>
                    {r.action} →
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  /* ══════════════════════════════════════
     PORTFOLIO LIST VIEW
     ══════════════════════════════════════ */
  // Aggregate stats
  const rented = properties.filter((p) => p.is_rented === "ja" || (getRent(p) > 0 && p.is_rented !== "selbst")).length;
  const totalMV = properties.reduce((s, p) => s + getMarketValue(p), 0);
  const totalDebt = properties.reduce((s, p) => s + (p.loan_amount || 0), 0);
  const equity = totalMV - totalDebt;
  const totalRent = properties.reduce((s, p) => s + getRent(p), 0);
  const totalRate = properties.reduce((s, p) => s + (p.monthly_payment || 0), 0);
  const totalHG = properties.reduce((s, p) => s + (p.house_money || 0), 0);
  const netCashflow = totalRent - totalRate - totalHG;
  const avgInterest = properties.filter((p) => p.interest_rate).length > 0
    ? properties.reduce((s, p) => s + (p.interest_rate || 0), 0) / properties.filter((p) => p.interest_rate).length
    : 0;
  const avgYield = properties.length > 0 && totalMV > 0 ? (totalRent * 12) / totalMV * 100 : 0;

  // Nearest action
  let nearestAction: { address: string; months: number; prop: PP } | null = null;
  for (const p of properties) {
    const m = monthsUntilFixedRateExpiry(p.fixed_rate_until);
    if (m !== null && m < 24 && (!nearestAction || m < nearestAction.months)) {
      nearestAction = { address: p.address, months: m, prop: p };
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
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
          <h1 className="text-xl font-bold">Mein Portfolio</h1>
          {properties.length > 0 && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: C.surface3, color: C.sub }}>
              {properties.length} {properties.length === 1 ? "Objekt" : "Objekte"}
            </span>
          )}
        </div>
        <Link href="/portfolio/add"
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
          + Immobilie hinzufügen
        </Link>
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <AIOrb size={48} active />
          <h2 className="text-base font-bold" style={{ color: C.text }}>Noch keine Immobilien im Portfolio</h2>
          <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
            Fügen Sie Ihre Bestandsimmobilien hinzu, um Marktwert, Cashflow und Zinsbindungs-Warnungen zu sehen.
          </p>
          <Link href="/portfolio/add" className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
            Immobilie hinzufügen
          </Link>
        </div>
      )}

      {properties.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Cards (left) ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile sidebar toggle */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden mb-4 rounded-xl px-4 py-2 text-xs font-semibold w-full"
              style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.sub }}>
              {sidebarOpen ? "Übersicht ausblenden ▲" : "Portfolio-Übersicht anzeigen ▼"}
            </button>

            {/* Mobile/Tablet sidebar (collapsible) */}
            {sidebarOpen && (
              <div className="lg:hidden mb-6">
                <SidebarContent
                  count={properties.length} rented={rented} totalMV={totalMV} totalDebt={totalDebt}
                  equity={equity} totalRent={totalRent} totalRate={totalRate} totalHG={totalHG}
                  netCashflow={netCashflow} avgYield={avgYield} avgInterest={avgInterest}
                  nearestAction={nearestAction} onActionClick={(p) => openFinanzierung(p)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map((p) => {
                const mv = getMarketValue(p);
                const rent = getRent(p);
                const rate = p.monthly_payment || 0;
                const hg = p.house_money || 0;
                const cf = rent - rate - hg;
                const valueChange = p.purchase_price > 0 ? ((mv - p.purchase_price) / p.purchase_price * 100) : 0;
                const monthsLeft = monthsUntilFixedRateExpiry(p.fixed_rate_until);
                const warning = getZinsbindungWarning(monthsLeft);
                const ptLabel = PT_LABEL[p.property_type || ""] || "";
                const details = [ptLabel, p.rooms ? `${p.rooms} Zi.` : "", p.area ? `${p.area} m²` : ""].filter(Boolean).join(" · ");

                return (
                  <Card key={p.id} className="p-0 overflow-hidden flex flex-col" hover onClick={() => setDetail(p)}>
                    {/* Header */}
                    <div className="px-4 pt-4 pb-2">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>{p.address}</p>
                      {details && <p className="text-[11px] mt-0.5" style={{ color: C.dim }}>{details}</p>}
                      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>Kaufdatum: {formatPurchaseDate(p.purchase_date)}</p>
                    </div>

                    {/* Market Value */}
                    <div className="px-4 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
                      <p className="text-[10px] font-medium" style={{ color: C.dim }}>Geschätzter Marktwert</p>
                      <p className="text-lg font-bold" style={{ color: mv >= p.purchase_price ? C.green : C.red }}>{mv.toLocaleString("de-DE")} €</p>
                      <p className="text-[11px] font-semibold" style={{ color: valueChange >= 0 ? C.green : C.red }}>
                        {valueChange >= 0 ? "+" : ""}{valueChange.toFixed(1)} % seit Kauf
                      </p>
                    </div>

                    {/* Key Facts */}
                    <div className="px-4 py-2 space-y-1" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex justify-between text-[11px]"><span style={{ color: C.dim }}>Miete</span><span className="font-semibold" style={{ color: C.text }}>{rent.toLocaleString("de-DE")} €/Mon.</span></div>
                      {rate > 0 && <div className="flex justify-between text-[11px]"><span style={{ color: C.dim }}>Rate</span><span className="font-semibold" style={{ color: C.text }}>{rate.toLocaleString("de-DE")} €/Mon.</span></div>}
                      <div className="flex justify-between text-[11px]"><span style={{ color: C.dim }}>Cashflow</span><span className="font-bold" style={{ color: cf >= 0 ? C.green : C.red }}>{cf >= 0 ? "+" : ""}{cf.toLocaleString("de-DE")} €/Mon.</span></div>
                    </div>

                    {/* Warning */}
                    {warning && (
                      <div className="px-4 py-2.5" style={{ background: warnBg(warning.level), borderTop: `1px solid ${warnBorder(warning.level)}` }}>
                        <p className="text-[11px] font-semibold" style={{ color: warnColor(warning.level) }}>{warning.text}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); openFinanzierung(p); }}
                          className="mt-1 text-[11px] font-bold transition-opacity hover:opacity-80"
                          style={{ color: warnColor(warning.level) }}
                        >
                          {warning.cta} →
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-4 py-3 mt-auto space-y-1" style={{ borderTop: `1px solid ${C.border}` }}>
                      <div className="flex items-center justify-between">
                        <button onClick={(e) => { e.stopPropagation(); setDetail(p); }} className="text-xs font-semibold transition-opacity hover:opacity-80" style={{ color: C.accent }}>
                          Details ansehen →
                        </button>
                        {deleteConfirm === p.id ? (
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-[11px] font-bold" style={{ color: C.red }}>Ja</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="text-[11px] font-bold" style={{ color: C.sub }}>Nein</button>
                          </div>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p.id); }} className="text-[11px] transition-opacity hover:opacity-80" style={{ color: C.dim }}>
                            Entfernen
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const ctrl = document.getElementById("ai-chat-controller") as unknown as { openWithQuestion?: (q: string, ctx?: AIChatContext) => void };
                          if (ctrl?.openWithQuestion) {
                            ctrl.openWithQuestion(
                              `Analysiere mein Objekt ${p.address}, ${p.city} (Miete: ${rent} €, Cashflow: ${cf >= 0 ? "+" : ""}${cf} €, Marktwert: ${mv.toLocaleString("de-DE")} €)`,
                              { type: "portfolio", data: properties.map(pp => ({ address: pp.address, city: pp.city, rent: getRent(pp), purchasePrice: pp.purchase_price, marketValue: getMarketValue(pp) })) }
                            );
                          }
                          document.getElementById("ai-chat-controller")?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="w-full text-left text-[11px] font-semibold py-0.5 transition-all hover:opacity-80 flex items-center gap-1"
                        style={{ color: C.cyan }}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                        KI fragen
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar (right, desktop only) ── */}
          <div className="hidden lg:block w-[300px] shrink-0">
            <div className="sticky top-24">
              <SidebarContent
                count={properties.length} rented={rented} totalMV={totalMV} totalDebt={totalDebt}
                equity={equity} totalRent={totalRent} totalRate={totalRate} totalHG={totalHG}
                netCashflow={netCashflow} avgYield={avgYield} avgInterest={avgInterest}
                nearestAction={nearestAction} onActionClick={(p) => openFinanzierung(p)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── KI-Berater ── */}
      {properties.length > 0 && (
        <AIChat
          context={{ type: "portfolio", data: properties.map(p => ({ address: p.address, city: p.city, rent: getRent(p), purchasePrice: p.purchase_price, marketValue: getMarketValue(p), cashflow: getRent(p) - (p.monthly_payment || 0) - (p.house_money || 0) })) }}
          suggestedQuestions={[
            "Wie ist die Performance meines Portfolios?",
            "Welche Optimierungen empfiehlst du?",
            "Wann sollte ich über Anschlussfinanzierung nachdenken?",
            "Wie kann ich meinen Cashflow verbessern?",
          ]}
          title="KI-Portfolioberater"
          subtitle="Fragen Sie die KI zu Ihrem Immobilienportfolio."
        />
      )}

      {/* ── Finanzierungs-Modal ── */}
      {showFinanzierung && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFinanzierung(false); }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4 animate-fade-up" style={{ background: C.bg2, border: `1px solid ${C.border}` }}>
            <h3 className="text-base font-bold" style={{ color: C.text }}>Anschlussfinanzierung anfragen</h3>
            {finanzSent ? (
              <div className="space-y-3">
                <div className="rounded-xl px-4 py-4 text-center" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
                  <p className="text-sm font-semibold" style={{ color: C.green }}>Anfrage gesendet!</p>
                  <p className="text-xs mt-1" style={{ color: C.green }}>Wir melden uns innerhalb von 24 Stunden.</p>
                </div>
                <button onClick={() => setShowFinanzierung(false)} className="w-full rounded-xl py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Schließen</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Vorname *</label>
                    <input value={finanzForm.firstName} onChange={(e) => setFinanzForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
                  <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachname *</label>
                    <input value={finanzForm.lastName} onChange={(e) => setFinanzForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
                </div>
                <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Telefon *</label>
                  <input value={finanzForm.phone} onChange={(e) => setFinanzForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+49 170 1234567" className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
                <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachricht</label>
                  <textarea value={finanzForm.message} onChange={(e) => setFinanzForm((f) => ({ ...f, message: e.target.value }))} rows={2} className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={finanzForm.consent} onChange={(e) => setFinanzForm((f) => ({ ...f, consent: e.target.checked }))} className="mt-0.5 rounded" />
                  <span className="text-xs leading-relaxed" style={{ color: C.sub }}>Ich stimme der Kontaktaufnahme zu. *</span>
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setShowFinanzierung(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Abbrechen</button>
                  <button onClick={handleFinanzierung}
                    disabled={finanzSending || !finanzForm.firstName || !finanzForm.lastName || !finanzForm.phone || !finanzForm.consent}
                    className="flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
                    {finanzSending ? "Wird gesendet..." : "Anfrage absenden"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 animate-fade-up" style={{ background: C.bg2, border: `1px solid ${C.border}` }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold" style={{ color: C.text }}>Immobilie entfernen?</h3>
            <p className="text-xs" style={{ color: C.sub }}>Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Abbrechen</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl py-2.5 text-sm font-bold" style={{ background: C.redDim, color: C.red, border: `1px solid rgba(248,113,113,0.2)` }}>Entfernen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar Component ─── */

function SidebarContent({ count, rented, totalMV, totalDebt, equity, totalRent, totalRate, totalHG, netCashflow, avgYield, avgInterest, nearestAction, onActionClick }: {
  count: number; rented: number; totalMV: number; totalDebt: number; equity: number;
  totalRent: number; totalRate: number; totalHG: number; netCashflow: number;
  avgYield: number; avgInterest: number;
  nearestAction: { address: string; months: number; prop: PP } | null;
  onActionClick: (p: PP) => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-bold tracking-wide uppercase" style={{ color: C.dim }}>Portfolio-Übersicht</h3>
      </div>

      {/* Counts */}
      <div className="px-4 py-3 space-y-1" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex justify-between text-xs"><span style={{ color: C.sub }}>Objekte</span><span className="font-bold" style={{ color: C.text }}>{count}</span></div>
        <div className="flex justify-between text-xs"><span style={{ color: C.sub }}>Davon vermietet</span><span className="font-bold" style={{ color: C.text }}>{rented}</span></div>
      </div>

      {/* Values */}
      <div className="px-4 py-3 space-y-3" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div>
          <p className="text-[10px] font-medium" style={{ color: C.dim }}>Geschätzter Gesamtwert</p>
          <p className="text-lg font-bold" style={{ color: C.text }}>{totalMV.toLocaleString("de-DE")} €</p>
        </div>
        <div>
          <p className="text-[10px] font-medium" style={{ color: C.dim }}>Gesamt-Restschuld</p>
          <p className="text-base font-bold" style={{ color: C.text }}>{totalDebt.toLocaleString("de-DE")} €</p>
        </div>
        <div>
          <p className="text-[10px] font-medium" style={{ color: C.dim }}>Eigenkapital (geschätzt)</p>
          <p className="text-base font-bold" style={{ color: equity >= 0 ? C.green : C.red }}>{equity.toLocaleString("de-DE")} €</p>
        </div>
      </div>

      {/* Cashflow */}
      <div className="px-4 py-3 space-y-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: C.dim }}>Monatlicher Cashflow</p>
        <div className="flex justify-between text-[11px]"><span style={{ color: C.sub }}>Mieteinnahmen</span><span className="font-semibold" style={{ color: C.text }}>{totalRent.toLocaleString("de-DE")} €</span></div>
        {totalRate > 0 && <div className="flex justify-between text-[11px]"><span style={{ color: C.sub }}>Kreditraten</span><span className="font-semibold" style={{ color: C.red }}>-{totalRate.toLocaleString("de-DE")} €</span></div>}
        {totalHG > 0 && <div className="flex justify-between text-[11px]"><span style={{ color: C.sub }}>Hausgeld</span><span className="font-semibold" style={{ color: C.red }}>-{totalHG.toLocaleString("de-DE")} €</span></div>}
        <div className="h-px" style={{ background: C.border }} />
        <div className="flex justify-between text-xs font-bold"><span style={{ color: C.text }}>Netto-Cashflow</span><span style={{ color: netCashflow >= 0 ? C.green : C.red }}>{netCashflow >= 0 ? "+" : ""}{netCashflow.toLocaleString("de-DE")} €</span></div>
      </div>

      {/* Nearest Action */}
      {nearestAction && (
        <div className="px-4 py-3 space-y-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="text-[10px] font-bold tracking-wide uppercase" style={{ color: C.amber }}>Nächste Aktion</p>
          <p className="text-[11px]" style={{ color: C.sub }}>
            {nearestAction.address}: Zinsbindung {nearestAction.months < 0 ? "abgelaufen" : `in ${nearestAction.months} Mon.`}
          </p>
          <button onClick={() => onActionClick(nearestAction!.prop)} className="text-[11px] font-bold transition-opacity hover:opacity-80" style={{ color: C.accent }}>
            Jetzt handeln →
          </button>
        </div>
      )}

      {/* Averages */}
      <div className="px-4 py-3 space-y-2">
        <div>
          <p className="text-[10px] font-medium" style={{ color: C.dim }}>Ø Rendite Portfolio</p>
          <p className="text-sm font-bold" style={{ color: avgYield >= 4 ? C.green : avgYield >= 3 ? C.amber : C.red }}>{avgYield.toFixed(1)} %</p>
        </div>
        {avgInterest > 0 && (
          <div>
            <p className="text-[10px] font-medium" style={{ color: C.dim }}>Ø Zins</p>
            <p className="text-sm font-bold" style={{ color: C.text }}>{avgInterest.toFixed(1)} %</p>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─── Helpers ─── */

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: C.surface }}>
      <span className="text-[10px]" style={{ color: C.dim }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: C.text }}>{value}</span>
    </div>
  );
}

function warnColor(level: string): string {
  if (level === "yellow") return C.amber;
  if (level === "orange") return C.orange;
  return C.red;
}

function warnBg(level: string): string {
  if (level === "yellow") return C.amberDim;
  if (level === "orange") return C.orangeDim;
  return C.redDim;
}

function warnBorder(level: string): string {
  if (level === "yellow") return C.amberBorder;
  if (level === "orange") return C.orangeBorder;
  return "rgba(248,113,113,0.2)";
}
