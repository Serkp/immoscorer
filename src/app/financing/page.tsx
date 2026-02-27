"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { getPortfolioProperties } from "@/lib/db";
import { monthsUntilFixedRateExpiry, getZinsbindungWarning } from "@/lib/portfolio-utils";
import { C } from "@/lib/theme";

interface FinancingLead {
  id: string;
  property_address: string;
  status: string;
  created_at: string;
}

interface PortProp {
  id: string;
  address: string;
  city: string;
  fixed_rate_until: string | null;
  loan_amount: number | null;
  interest_rate: number | null;
}

export default function FinancingPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<FinancingLead[]>([]);
  const [portfolio, setPortfolio] = useState<PortProp[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculator state
  const [calcLoan, setCalcLoan] = useState("200000");
  const [calcRate, setCalcRate] = useState("3.5");
  const [calcTilg, setCalcTilg] = useState("2.0");

  // Financing form
  const [showForm, setShowForm] = useState(false);
  const [finForm, setFinForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "", consent: false });
  const [finSending, setFinSending] = useState(false);
  const [finSent, setFinSent] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const [leadsRes, portRes] = await Promise.all([
          getSupabase().from("financing_leads").select("id, property_address, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
          getPortfolioProperties(user.id),
        ]);
        if (leadsRes.data) setLeads(leadsRes.data as FinancingLead[]);
        if (portRes) setPortfolio((portRes as PortProp[]).filter((p) => p.fixed_rate_until));
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [user]);

  // Calculator
  const calc = useMemo(() => {
    const loan = Number(calcLoan) || 0;
    const zins = (Number(calcRate) || 0) / 100;
    const tilg = (Number(calcTilg) || 0) / 100;
    if (loan <= 0 || zins <= 0 || tilg <= 0) return null;
    const monthlyRate = (loan * (zins + tilg)) / 12;
    let remaining = loan;
    let tilgt10 = 0;
    for (let m = 0; m < 120 && remaining > 0; m++) {
      const principal = monthlyRate - (remaining * zins) / 12;
      tilgt10 += principal;
      remaining -= principal;
    }
    const rest10 = Math.max(0, loan - tilgt10);
    // Full duration + total interest
    let totalInt = 0;
    let r3 = loan;
    let totalMonths = 0;
    while (r3 > 0.01 && totalMonths < 600) {
      const i = (r3 * zins) / 12;
      const p = monthlyRate - i;
      if (p <= 0) break;
      totalInt += i;
      r3 -= p;
      totalMonths++;
    }
    return {
      monthlyRate: Math.round(monthlyRate),
      totalInterest: Math.round(totalInt),
      tilgt10: Math.round(tilgt10),
      rest10: Math.round(rest10),
      durationYears: Math.ceil(totalMonths / 12),
    };
  }, [calcLoan, calcRate, calcTilg]);

  async function handleFinSubmit() {
    if (!user || finSending) return;
    if (!finForm.firstName || !finForm.lastName || !finForm.phone || !finForm.consent) return;
    setFinSending(true);
    try {
      await fetch("/api/financing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName: finForm.firstName,
          lastName: finForm.lastName,
          email: finForm.email || user.email,
          phone: finForm.phone,
          message: finForm.message,
          propertyAddress: "",
          purchasePrice: 0,
          monthlyRent: 0,
          score: 0,
        }),
      });
      setFinSent(true);
      // Reload leads
      const { data } = await getSupabase().from("financing_leads").select("id, property_address, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setLeads(data as FinancingLead[]);
    } catch { /* silent */ }
    setFinSending(false);
  }

  // Sort portfolio by nearest expiry
  const sortedPortfolio = [...portfolio].sort((a, b) => {
    const ma = monthsUntilFixedRateExpiry(a.fixed_rate_until) ?? 999;
    const mb = monthsUntilFixedRateExpiry(b.fixed_rate_until) ?? 999;
    return ma - mb;
  });

  const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
    new: { text: "Neu", color: C.blue, bg: "rgba(76,154,255,0.12)" },
    in_progress: { text: "In Bearbeitung", color: C.amber, bg: C.amberDim },
    completed: { text: "Abgeschlossen", color: C.green, bg: C.greenDim },
  };

  if (loading) return <div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>;

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>

      <div>
        <h1 className="text-xl font-bold" style={{ color: C.text }}>Finanzierung</h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>Ihre Finanzierungsübersicht</p>
      </div>

      {/* ── Bereich 1: Finanzierungsanfrage ── */}
      <Card className="p-6 space-y-4" glow>
        <h2 className="text-base font-bold" style={{ color: C.text }}>Kostenlose Finanzierungsberatung</h2>
        <p className="text-sm" style={{ color: C.sub }}>
          Unsere Experten prüfen Ihre Finanzierungsmöglichkeiten — persönlich, unverbindlich, in 24 Stunden.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["Über 500 Bankpartner", "Persönliche Beratung", "Auch bei Sanierungsbedarf", "Anschlussfinanzierung & Forward-Darlehen"].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <span className="text-xs" style={{ color: C.sub }}>{t}</span>
            </div>
          ))}
        </div>

        {!showForm && !finSent && (
          <button onClick={() => setShowForm(true)}
            className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
            Finanzierung anfragen →
          </button>
        )}

        {finSent && (
          <div className="rounded-xl px-4 py-4 text-center" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
            <p className="text-sm font-semibold" style={{ color: C.green }}>Anfrage gesendet!</p>
            <p className="text-xs mt-1" style={{ color: C.green }}>Wir melden uns innerhalb von 24 Stunden.</p>
          </div>
        )}

        {showForm && !finSent && (
          <div className="space-y-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Vorname *</label>
                <input value={finForm.firstName} onChange={(e) => setFinForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
              <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachname *</label>
                <input value={finForm.lastName} onChange={(e) => setFinForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
            </div>
            <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Telefon *</label>
              <input value={finForm.phone} onChange={(e) => setFinForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+49 170 1234567" className="w-full rounded-xl px-3 py-2 text-sm outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
            <div><label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachricht (optional)</label>
              <textarea value={finForm.message} onChange={(e) => setFinForm((f) => ({ ...f, message: e.target.value }))} rows={2} className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} /></div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={finForm.consent} onChange={(e) => setFinForm((f) => ({ ...f, consent: e.target.checked }))} className="mt-0.5 rounded" />
              <span className="text-xs leading-relaxed" style={{ color: C.sub }}>Ich stimme der Kontaktaufnahme per Telefon/E-Mail zu. *</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Abbrechen</button>
              <button onClick={handleFinSubmit} disabled={finSending || !finForm.firstName || !finForm.lastName || !finForm.phone || !finForm.consent}
                className="flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
                {finSending ? "Wird gesendet..." : "Anfrage absenden"}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Bereich 2: Meine Anfragen ── */}
      {leads.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold" style={{ color: C.text }}>Meine Anfragen</h2>
          <div className="space-y-2">
            {leads.map((l) => {
              const s = statusLabel[l.status] || statusLabel.new;
              return (
                <Card key={l.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.text }}>{l.property_address || "Allgemeine Finanzierungsanfrage"}</p>
                    <p className="text-[10px]" style={{ color: C.dim }}>{new Date(l.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>
                    {s.text}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bereich 3: Finanzierungsrechner ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold" style={{ color: C.text }}>Finanzierungsrechner</h2>
        <Card className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Darlehensbetrag" value={calcLoan} onChange={setCalcLoan} suffix="€" type="number" placeholder="200.000" />
            <Input label="Zinssatz" value={calcRate} onChange={setCalcRate} suffix="%" type="number" placeholder="3.5" />
            <Input label="Tilgung" value={calcTilg} onChange={setCalcTilg} suffix="%" type="number" placeholder="2.0" />
          </div>

          {calc && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <CalcResult label="Monatliche Rate" value={`${calc.monthlyRate.toLocaleString("de-DE")} €`} />
              <CalcResult label="Zinskosten gesamt" value={`${calc.totalInterest.toLocaleString("de-DE")} €`} />
              <CalcResult label="Getilgt nach 10 J." value={`${calc.tilgt10.toLocaleString("de-DE")} €`} />
              <CalcResult label="Restschuld nach 10 J." value={`${calc.rest10.toLocaleString("de-DE")} €`} />
            </div>
          )}
          {calc && (
            <p className="text-[10px] mt-3" style={{ color: C.dim }}>
              Geschätzte Laufzeit: ca. {calc.durationYears} Jahre. Vereinfachte Berechnung ohne Sondertilgung.
            </p>
          )}
        </Card>
      </div>

      {/* ── Bereich 4: Zinsauslauf-Übersicht ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold" style={{ color: C.text }}>Zinsauslauf-Übersicht</h2>
        {sortedPortfolio.length === 0 ? (
          <Card className="p-5 text-center">
            <p className="text-xs" style={{ color: C.sub }}>Fügen Sie Immobilien zu Ihrem Portfolio hinzu um Zinsausläufe zu tracken.</p>
            <Link href="/portfolio/add" className="inline-block mt-3 text-xs font-bold transition-opacity hover:opacity-80" style={{ color: C.accent }}>
              Immobilie hinzufügen →
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedPortfolio.map((p) => {
              const months = monthsUntilFixedRateExpiry(p.fixed_rate_until);
              const warning = getZinsbindungWarning(months);
              const color = warning ? warnColor(warning.level) : C.green;
              const bg = warning ? warnBg(warning.level) : C.greenDim;
              return (
                <Card key={p.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: C.text }}>{p.address}, {p.city}</p>
                    <p className="text-[10px]" style={{ color: C.dim }}>
                      Zinsbindung bis {p.fixed_rate_until}
                      {p.loan_amount ? ` · Restschuld ${p.loan_amount.toLocaleString("de-DE")} €` : ""}
                      {p.interest_rate ? ` · ${p.interest_rate} %` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap" style={{ background: bg, color }}>
                      {months !== null ? (months < 0 ? "Abgelaufen" : `${months} Mon.`) : "—"}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CalcResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <p className="text-sm font-bold" style={{ color: C.text }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
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
