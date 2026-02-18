"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { Input } from "@/components/ui/Input";
import { PillSelect } from "@/components/ui/PillSelect";
import { ScoreRing, MiniRing } from "@/components/ui/ScoreRing";
import { Paywall } from "@/components/Paywall";
import { useAuth } from "@/components/auth/AuthProvider";
import { C, scoreColor, scoreLabel } from "@/lib/theme";
import { computeScore } from "@/lib/scoring";
import { savePropertyDB, saveAnalysisDB, countAnalyses, getSubscriptionStatus } from "@/lib/db";
import type { PropertyInput, ScoringResult } from "@/lib/scoring";

const ENERGY_OPTIONS = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"] as const;
const LOCATION_OPTIONS = ["A", "B", "C", "D"] as const;

const RENO_ITEMS = [
  { key: "dach", label: "Dach", desc: "Dacheindeckung, Dämmung, Dachstuhl", cost: "15.000–40.000 €" },
  { key: "fassade", label: "Fassade", desc: "Außendämmung, Putz, WDVS", cost: "20.000–50.000 €" },
  { key: "fenster", label: "Fenster", desc: "Verglasung, Rahmen, Dichtung", cost: "8.000–20.000 €" },
  { key: "bad", label: "Bad", desc: "Sanitär, Fliesen, Leitungen", cost: "10.000–25.000 €" },
  { key: "elektrik", label: "Elektrik", desc: "Leitungen, Sicherungskasten, FI", cost: "8.000–18.000 €" },
  { key: "heizung", label: "Heizung", desc: "Kessel, Rohre, Heizkörper", cost: "12.000–35.000 €" },
] as const;

const LOADING_STEPS = [
  { title: "Adresse verifizieren", sub: "Standort und Marktdaten abrufen" },
  { title: "Vergleichspreise ermitteln", sub: "Transaktionen analysieren" },
  { title: "Risikoprofil berechnen", sub: "Sanierung, Energie, Lage gewichten" },
  { title: "Finanzierbarkeit simulieren", sub: "Bankkriterien prüfen" },
  { title: "Empfehlungen ableiten", sub: "Strategische Maßnahmen generieren" },
];

type View = "input" | "loading" | "result";

interface FormData {
  street: string;
  city: string;
  price: string;
  rent: string;
  hausgeld: string;
  area: string;
  year: string;
  energyClass: string;
  locationGrade: string;
  renovations: string[];
}

const INIT: FormData = {
  street: "", city: "", price: "", rent: "", hausgeld: "", area: "", year: "",
  energyClass: "", locationGrade: "", renovations: [],
};

export default function AnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState<View>("input");
  const [section, setSection] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDone, setLocationDone] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* ── Paywall state ── */
  const [paywallCheck, setPaywallCheck] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function check() {
      try {
        const [count, sub] = await Promise.all([
          countAnalyses(user!.id),
          getSubscriptionStatus(user!.id),
        ]);
        if (count >= 1 && !sub) {
          setShowPaywall(true);
        }
      } catch {
        // On error, allow access
      } finally {
        setPaywallCheck(false);
      }
    }
    check();
  }, [user]);

  const set = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const toggleReno = useCallback((key: string) => {
    setForm((f) => ({
      ...f,
      renovations: f.renovations.includes(key)
        ? f.renovations.filter((r) => r !== key)
        : [...f.renovations, key],
    }));
  }, []);

  /* ── Live-Metriken ── */
  const liveKPIs = useMemo(() => {
    const price = Number(form.price);
    const rent = Number(form.rent);
    if (!price || !rent) return null;
    const grossYield = (rent * 12) / price;
    const factor = price / (rent * 12);
    const annualRent = rent * 12;
    return { grossYield, factor, annualRent };
  }, [form.price, form.rent]);

  const liveKPIs2 = useMemo(() => {
    const price = Number(form.price);
    const rent = Number(form.rent);
    const hg = Number(form.hausgeld);
    const area = Number(form.area);
    if (!price || !rent) return null;
    const netCashflow = rent - (hg || 0);
    const hausgeldRatio = hg && rent ? hg / rent : 0;
    const sqmPrice = area ? price / area : 0;
    return { netCashflow, hausgeldRatio, sqmPrice };
  }, [form.price, form.rent, form.hausgeld, form.area]);

  /* ── Lage-Simulation ── */
  function simulateLocation() {
    setLocationLoading(true);
    setTimeout(() => {
      const grade = form.city.toLowerCase().includes("münchen") || form.city.toLowerCase().includes("berlin") ? "A"
        : form.city.toLowerCase().includes("hamburg") || form.city.toLowerCase().includes("frankfurt") ? "B"
        : form.city.toLowerCase().includes("leipzig") || form.city.toLowerCase().includes("dresden") ? "C" : "B";
      set("locationGrade", grade);
      setLocationLoading(false);
      setLocationDone(true);
    }, 2000);
  }

  /* ── Validierung ── */
  const canNext0 = !!(form.street && form.city && form.price && form.rent);
  const canNext1 = !!(form.hausgeld && form.area && form.year && form.energyClass);

  /* ── Analyse starten ── */
  function startAnalysis() {
    setView("loading");
    setLoadingStep(0);
    setLoadingPct(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);
      setLoadingPct(Math.min(100, step * 20));
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => {
          const input: PropertyInput = {
            street: form.street,
            city: form.city,
            price: Number(form.price),
            rent: Number(form.rent),
            hausgeld: Number(form.hausgeld),
            area: Number(form.area),
            year: Number(form.year),
            energyClass: form.energyClass,
            locationGrade: form.locationGrade || "B",
            renovations: form.renovations,
          };
          const sr = computeScore(input);
          setResult(sr);
          setSaved(false);
          setSaveMsg(null);
          setView("result");
        }, 600);
      }
    }, 600);
  }

  async function handleSave() {
    if (!result || !user || saving || saved) return;
    setSaving(true);
    try {
      const input: PropertyInput = {
        street: form.street, city: form.city, price: Number(form.price), rent: Number(form.rent),
        hausgeld: Number(form.hausgeld), area: Number(form.area), year: Number(form.year),
        energyClass: form.energyClass, locationGrade: form.locationGrade || "B", renovations: form.renovations,
      };
      const prop = await savePropertyDB(user.id, {
        street: input.street,
        city: input.city,
        price: input.price,
        rent: input.rent,
        hausgeld: input.hausgeld,
        area: input.area,
        year: input.year,
        energyClass: input.energyClass,
        locationGrade: input.locationGrade,
        renovations: input.renovations,
        totalScore: result.totalScore,
        result: result as unknown as Record<string, unknown>,
      });
      await saveAnalysisDB(
        user.id,
        prop.id,
        input as unknown as Record<string, unknown>,
        result as unknown as Record<string, unknown>
      );
      setSaved(true);
      setSaveMsg("Immobilie gespeichert");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg("Fehler beim Speichern");
      setTimeout(() => setSaveMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm(INIT);
    setSection(0);
    setResult(null);
    setLocationDone(false);
    setView("input");
    setExpanded(null);
    setSaved(false);
    setSaveMsg(null);
  }

  /* ── Paywall check loading ── */
  if (paywallCheck) {
    return (
      <div className="flex items-center justify-center py-24">
        <AIOrb size={48} active />
      </div>
    );
  }

  /* ── Paywall ── */
  if (showPaywall) {
    return <Paywall />;
  }

  /* ══════════════════════════════════
     INPUT VIEW
     ══════════════════════════════════ */
  if (view === "input") {
    return (
      <div className="mx-auto max-w-[640px] space-y-6">
        {/* Progress bars */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: section > i ? "100%" : section === i ? "50%" : "0%",
                  background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Section 0 ── */}
        {section === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Welche Immobilie möchten Sie bewerten?</h2>
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <Input label="Straße" value={form.street} onChange={(v) => set("street", v)} placeholder="Berliner Str. 42" large explain="Straßenname und Hausnummer des Objekts." />
              <Input label="Stadt" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" large explain="Stadt oder Gemeinde." />
            </div>

            {/* Lage-Analyse Button */}
            {form.street && form.city && !locationDone && (
              <button
                onClick={simulateLocation}
                disabled={locationLoading}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  background: locationLoading ? C.surface2 : C.surface3,
                  border: `1px solid ${C.border}`,
                  color: locationLoading ? C.dim : C.text,
                }}
              >
                {locationLoading ? "Lage wird analysiert..." : "Lage automatisch analysieren"}
              </button>
            )}

            {/* Lage-Card */}
            {locationDone && form.locationGrade && (
              <Card className="p-4 space-y-3 animate-fade-up">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-xs font-bold"
                    style={{
                      background: form.locationGrade <= "B" ? C.greenDim : C.amberDim,
                      color: form.locationGrade <= "B" ? C.green : C.amber,
                      border: `1px solid ${form.locationGrade <= "B" ? C.greenBorder : C.amberBorder}`,
                    }}
                  >
                    Lageklasse {form.locationGrade}
                  </span>
                  <span className="text-xs" style={{ color: C.sub }}>{form.city}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric label="Walk-Score" value={form.locationGrade === "A" ? "92" : form.locationGrade === "B" ? "78" : "61"} />
                  <MiniMetric label="ÖPNV-Score" value={form.locationGrade === "A" ? "96" : form.locationGrade === "B" ? "82" : "64"} />
                  <MiniMetric label="Mietwachstum" value={form.locationGrade === "A" ? "+3,2 %" : form.locationGrade === "B" ? "+2,4 %" : "+1,8 %"} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.dim }}>
                  {form.locationGrade === "A" ? "Top-Innenstadtlage mit exzellenter Infrastruktur." :
                   form.locationGrade === "B" ? "Gute urbane Lage mit solider Anbindung." :
                   "Durchschnittliche Lage mit Entwicklungspotenzial."}
                </p>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="Kaufpreis" value={form.price} onChange={(v) => set("price", v)} placeholder="250000" type="number" suffix="€" large explain="Gesamtangebotspreis inkl. ausgewiesener Nebenkosten." />
              <Input label="Monatliche Kaltmiete" value={form.rent} onChange={(v) => set("rent", v)} placeholder="950" type="number" suffix="€" large explain="Nettokaltmiete ohne Nebenkosten." />
            </div>

            {/* Live-Metriken */}
            {liveKPIs && (
              <div className="grid grid-cols-3 gap-2 animate-fade-up">
                <MetricBox label="Bruttorendite" value={`${(liveKPIs.grossYield * 100).toFixed(2)} %`} good={liveKPIs.grossYield >= 0.04} />
                <MetricBox label="Kaufpreisfaktor" value={`${liveKPIs.factor.toFixed(1)}x`} good={liveKPIs.factor <= 25} />
                <MetricBox label="Jahresmiete" value={`${liveKPIs.annualRent.toLocaleString("de-DE")} €`} good />
              </div>
            )}

            {/* AI Comment auf Rendite */}
            {liveKPIs && (
              <AIComment variant={liveKPIs.grossYield >= 0.05 ? "good" : liveKPIs.grossYield >= 0.04 ? "info" : liveKPIs.grossYield >= 0.03 ? "warn" : "bad"}>
                {liveKPIs.grossYield >= 0.05 ? "Starke Bruttorendite — ein solides Fundament für fremdfinanzierte Kapitalanlagen mit positivem Leverage." :
                 liveKPIs.grossYield >= 0.04 ? "Solide Basis — die Rendite deckt den Kapitaldienst bei marktüblichen Zinsen, lässt aber wenig Puffer." :
                 liveKPIs.grossYield >= 0.03 ? "Unter Beobachtung — die Rendite liegt unter dem Break-even für fremdfinanzierte Akquisitionen." :
                 "Vorsicht — bei dieser Rendite ist eine rentable Fremdfinanzierung bei aktuellen Zinsen kaum darstellbar."}
              </AIComment>
            )}

            <div className="flex justify-end">
              <button
                disabled={!canNext0}
                onClick={() => setSection(1)}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {/* ── Section 1 ── */}
        {section === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Wie sieht das Objekt im Detail aus?</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Hausgeld" value={form.hausgeld} onChange={(v) => set("hausgeld", v)} placeholder="350" type="number" suffix="€/Mon." explain="Monatliches Hausgeld (Verwaltung + Instandhaltungsrücklage)." />
              <Input label="Wohnfläche" value={form.area} onChange={(v) => set("area", v)} placeholder="72" type="number" suffix="m²" explain="Wohnfläche laut Grundriss oder Teilungserklärung." />
            </div>

            <Input label="Baujahr" value={form.year} onChange={(v) => set("year", v)} placeholder="1985" type="number" explain="Baujahr des Gebäudes — relevant für Substanzbewertung und GEG-Pflichten." />

            <PillSelect label="Energieeffizienzklasse" options={ENERGY_OPTIONS} value={form.energyClass} onChange={(v) => set("energyClass", v)} explain="Laut Energieausweis. A+ ist die beste, H die schlechteste Klasse." />

            {!locationDone && (
              <PillSelect label="Lageklasse" options={LOCATION_OPTIONS} value={form.locationGrade} onChange={(v) => set("locationGrade", v)} explain="A = Top-Lage, B = gute Lage, C = durchschnittlich, D = Entwicklungslage." />
            )}

            {/* Live-Metriken Sektion 1 */}
            {liveKPIs2 && (form.hausgeld || form.area) && (
              <div className="grid grid-cols-3 gap-2 animate-fade-up">
                <MetricBox label="Netto-Cashflow" value={`${Math.round(liveKPIs2.netCashflow)} €/Mon.`} good={liveKPIs2.netCashflow > 0} />
                {liveKPIs2.hausgeldRatio > 0 && <MetricBox label="Hausgeld-Quote" value={`${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} %`} good={liveKPIs2.hausgeldRatio <= 0.3} />}
                {liveKPIs2.sqmPrice > 0 && <MetricBox label="€/m²" value={`${Math.round(liveKPIs2.sqmPrice).toLocaleString("de-DE")} €`} good={liveKPIs2.sqmPrice <= 3500} />}
              </div>
            )}

            {liveKPIs2 && liveKPIs2.hausgeldRatio > 0 && (
              <AIComment variant={liveKPIs2.hausgeldRatio <= 0.25 ? "good" : liveKPIs2.hausgeldRatio <= 0.35 ? "info" : "warn"}>
                {liveKPIs2.hausgeldRatio <= 0.25 ? `Hausgeld-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % — innerhalb institutioneller Standards. Gesunder Cashflow-Puffer.` :
                 liveKPIs2.hausgeldRatio <= 0.35 ? `Hausgeld-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % — akzeptabel, aber WEG-Wirtschaftsplan prüfen.` :
                 `Hausgeld-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % — erhöht. Rücklagenstand und geplante Sonderumlagen hinterfragen.`}
              </AIComment>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSection(0)} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Zurück</button>
              <button disabled={!canNext1} onClick={() => setSection(2)} className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-30" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>Weiter</button>
            </div>
          </div>
        )}

        {/* ── Section 2 ── */}
        {section === 2 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Gibt es Sanierungsbedarf?</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {RENO_ITEMS.map((r) => {
                const active = form.renovations.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => toggleReno(r.key)}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{
                      background: active ? C.amberDim : C.surface,
                      border: `1px solid ${active ? C.amberBorder : C.border}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: active ? C.amber : C.text }}>{r.label}</span>
                      <span className="text-[11px]" style={{ color: C.dim }}>{r.cost}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: C.dim }}>{r.desc}</p>
                  </button>
                );
              })}
            </div>

            <AIComment variant={form.renovations.length === 0 ? "good" : form.renovations.length <= 2 ? "info" : form.renovations.length <= 4 ? "warn" : "bad"}>
              {form.renovations.length === 0 ? "Kein Sanierungsbedarf erkannt — das Objekt ist stabilisiert und sofort cashflow-fähig." :
               form.renovations.length <= 2 ? `${form.renovations.length} Gewerk${form.renovations.length > 1 ? "e" : ""} mit Bedarf — überschaubares Capex-Risiko, in Kaufpreisverhandlung einbeziehen.` :
               form.renovations.length <= 4 ? `${form.renovations.length} Gewerke mit Bedarf — erhöhtes Capex-Risiko. Verbindliche Angebote vor Kaufvertrag einholen.` :
               `${form.renovations.length} Gewerke mit Bedarf — signifikantes Investitionsrisiko. Nur mit klarer Value-Add-Strategie fortfahren.`}
            </AIComment>

            <div className="flex gap-3">
              <button onClick={() => setSection(1)} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Zurück</button>
              <button onClick={startAnalysis} className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>Analyse starten</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════
     LOADING VIEW
     ══════════════════════════════════ */
  if (view === "loading") {
    return (
      <div className="mx-auto max-w-md py-24 space-y-8">
        <div className="flex justify-center">
          <AIOrb size={72} active />
        </div>

        <div className="space-y-4">
          {LOADING_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 transition-all duration-300" style={{ opacity: loadingStep >= i ? 1 : 0.25 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: loadingStep > i ? C.greenDim : loadingStep === i ? C.accentMid : C.surface, color: loadingStep > i ? C.green : loadingStep === i ? C.accent : C.dim, border: `1px solid ${loadingStep > i ? C.greenBorder : loadingStep === i ? C.accent : C.border}` }}>
                {loadingStep > i ? "\u2713" : i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: loadingStep >= i ? C.text : C.dim }}>{s.title}</p>
                <p className="text-xs" style={{ color: C.dim }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: C.dim }}>
            <span>Analyse läuft</span>
            <span>{loadingPct} %</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${loadingPct}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})` }} />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     RESULT VIEW
     ══════════════════════════════════ */
  if (view === "result" && result) {
    const radarData = result.subscores.map((s) => ({
      subject: s.label.replace("-Score", "").replace("Investitions", "Invest.").replace("Vermietbarkeits", "Vermiet.").replace("Finanzierungs", "Finanz.").replace("Zukunfts", "Zukunft"),
      value: s.value,
      fullMark: 100,
    }));

    return (
      <div className="mx-auto max-w-[1100px] space-y-6 animate-fade-up">
        {/* Save Toast */}
        {saveMsg && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
            style={{
              background: saved ? C.greenDim : C.redDim,
              color: saved ? C.green : C.red,
              border: `1px solid ${saved ? C.greenBorder : "rgba(248,113,113,0.2)"}`,
            }}
          >
            {saveMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Analyseergebnis</h1>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: result.confidence === "Hohe Bewertungssicherheit" ? C.greenDim : result.confidence === "Mittlere Bewertungssicherheit" ? C.amberDim : C.redDim, color: result.confidence === "Hohe Bewertungssicherheit" ? C.green : result.confidence === "Mittlere Bewertungssicherheit" ? C.amber : C.red, border: `1px solid ${result.confidence === "Hohe Bewertungssicherheit" ? C.greenBorder : result.confidence === "Mittlere Bewertungssicherheit" ? C.amberBorder : "rgba(248,113,113,0.2)"}` }}>
                {result.confidence}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: C.sub }}>{form.street}, {form.city} — {form.area} m², Bj. {form.year}, Klasse {form.energyClass}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Neue Analyse</button>
            <button
              onClick={handleSave}
              disabled={saved || saving}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
              style={{
                background: saved
                  ? C.greenDim
                  : `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                color: saved ? C.green : "#fff",
                border: saved ? `1px solid ${C.greenBorder}` : "none",
              }}
            >
              {saving ? "..." : saved ? "Gespeichert" : "Im Portfolio speichern"}
            </button>
          </div>
        </div>

        {/* Hero Row: 3 columns */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Score Ring */}
          <Card className="p-6 flex flex-col items-center justify-center" glow>
            <ScoreRing value={result.totalScore} size={150} />
            <p className="text-sm font-bold mt-2" style={{ color: scoreColor(result.totalScore) }}>{scoreLabel(result.totalScore)}</p>
            <p className="text-xs mt-1" style={{ color: C.dim }}>Gesamtbewertung</p>
          </Card>

          {/* Radar Chart */}
          <Card className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: C.sub, fontSize: 10 }} />
                <Radar dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.08} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* KPI Rows */}
          <div className="space-y-3">
            <KPIRow label="Nettorendite" value={`${(result.kpis.netYield * 100).toFixed(2)} %`} color={result.kpis.netYield >= 0.03 ? C.green : result.kpis.netYield >= 0.01 ? C.amber : C.red} />
            <KPIRow label="Kaufpreisfaktor" value={`${result.kpis.factor.toFixed(1)}x`} color={result.kpis.factor <= 25 ? C.green : result.kpis.factor <= 30 ? C.amber : C.red} />
            <KPIRow label="Finanzierbarkeit" value={`${result.subscores.find(s => s.key === "financing")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "financing")?.value || 0)} />
            <KPIRow label="Risiko-Score" value={`${result.subscores.find(s => s.key === "risk")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "risk")?.value || 0)} />
          </div>
        </div>

        {/* Subscore Cards */}
        <div className="space-y-2">
          <p className="text-xs" style={{ color: C.dim }}>Klicken für Begründung + Empfehlung</p>
          {result.subscores.map((sub) => {
            const isExpanded = expanded === sub.key;
            return (
              <Card key={sub.key} className="overflow-hidden" hover onClick={() => setExpanded(isExpanded ? null : sub.key)}>
                <div className="flex items-center gap-4 p-4">
                  <MiniRing value={sub.value} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{sub.label}</span>
                      <span className="text-[11px] rounded-full px-2 py-0.5" style={{ background: C.surface3, color: C.dim }}>{sub.weight} %</span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: C.sub }}>{sub.oneLiner}</p>
                  </div>
                  <svg width={16} height={16} viewBox="0 0 16 16" className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: C.dim }}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>

                {isExpanded && (
                  <div className="grid md:grid-cols-2 gap-4 px-4 pb-4 border-t animate-fade-up" style={{ borderColor: C.border }}>
                    <div className="pt-4 space-y-2">
                      <h4 className="text-xs font-bold" style={{ color: C.blue }}>Warum dieser Wert?</h4>
                      <ul className="space-y-1.5">
                        {sub.reasons.map((r, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.blue }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 space-y-2">
                      <h4 className="text-xs font-bold" style={{ color: C.green }}>Empfehlung</h4>
                      <ul className="space-y-1.5">
                        {sub.actions.map((a, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                            <span className="mt-0.5 shrink-0" style={{ color: C.green }}>{"\u2192"}</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Stärken + Risiken */}
        <div className="grid md:grid-cols-2 gap-5">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />
              <h3 className="text-sm font-bold">Stärken</h3>
            </div>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.green }} />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: C.amber }} />
              <h3 className="text-sm font-bold">Risiken</h3>
            </div>
            <ul className="space-y-2">
              {result.risks.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.amber }} />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Footer Actions */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl px-4 py-2 text-xs font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>PDF Export</button>
            <button onClick={() => router.push("/compare")} className="rounded-xl px-4 py-2 text-xs font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Zum Vergleich</button>
            <button className="rounded-xl px-4 py-2 text-xs font-semibold" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>KI-Assistent fragen</button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

/* ─── Hilfskomponenten ─── */

function MetricBox({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: good ? C.greenDim : C.amberDim, border: `1px solid ${good ? C.greenBorder : C.amberBorder}` }}>
      <p className="text-sm font-bold" style={{ color: good ? C.green : C.amber }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5 text-center" style={{ background: C.surface }}>
      <p className="text-xs font-bold" style={{ color: C.text }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

function KPIRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="flex items-center justify-between px-4 py-3">
      <span className="text-xs font-medium" style={{ color: C.sub }}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </Card>
  );
}
