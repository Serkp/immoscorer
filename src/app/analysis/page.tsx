"use client";

import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { Input } from "@/components/ui/Input";
import { PillSelect } from "@/components/ui/PillSelect";
import { ScoreRing, MiniRing } from "@/components/ui/ScoreRing";
import { UpgradeBox } from "@/components/UpgradeBox";
import { AuthModal } from "@/components/auth/AuthModal";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { PlaceResult } from "@/components/AddressAutocomplete";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { C, scoreColor, scoreLabel } from "@/lib/theme";
import { computeScore } from "@/lib/scoring";
import { savePortfolioProperty, saveAnalysisDB } from "@/lib/db";
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

interface LocationData {
  walkScore: number;
  transitScore: number;
  locationGrade: "A" | "B" | "C" | "D";
  rentGrowth: string;
  description: string;
  nearbyHighlights: string[];
}

const INIT: FormData = {
  street: "", city: "", price: "", rent: "", hausgeld: "", area: "", year: "",
  energyClass: "", locationGrade: "", renovations: [],
};

export default function AnalysisPage() {
  return (
    <Suspense>
      <AnalysisContent />
    </Suspense>
  );
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { isPro, refresh: refreshSub } = useSubscription();
  const [view, setView] = useState<View>("input");
  const [section, setSection] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDone, setLocationDone] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveChoice, setSaveChoice] = useState<"none" | "portfolio" | "compare">("none");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "neutral" } | null>(null);
  const [showFinanzierung, setShowFinanzierung] = useState(false);
  const [finanzForm, setFinanzForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [finanzSending, setFinanzSending] = useState(false);
  const [finanzSent, setFinanzSent] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Checkout success/cancel handling ── */
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setToast({ text: "Willkommen bei ImmoScorer Pro! Alle Funktionen sind freigeschaltet.", type: "success" });
      refreshSub();
      setTimeout(() => setToast(null), 5000);
      window.history.replaceState({}, "", "/analysis");
    } else if (checkout === "cancel") {
      setToast({ text: "Bezahlung abgebrochen.", type: "neutral" });
      setTimeout(() => setToast(null), 4000);
      window.history.replaceState({}, "", "/analysis");
    }
  }, [searchParams, refreshSub]);

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

  /* ── Echte Lage-Analyse via Google Places ── */
  async function analyzeLocation(placeLat: number, placeLng: number, city: string) {
    setLocationLoading(true);
    try {
      const res = await fetch("/api/location/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: placeLat, lng: placeLng, city }),
      });
      const data = await res.json();
      if (!data.error) {
        setLocationData(data);
        set("locationGrade", data.locationGrade);
        setLocationDone(true);
      }
    } catch (err) {
      console.error("Lage-Analyse fehlgeschlagen:", err);
    } finally {
      setLocationLoading(false);
    }
  }

  /* ── Address selected from Autocomplete ── */
  function handleAddressSelect(place: PlaceResult) {
    if (place.street) set("street", place.street);
    if (place.city) set("city", place.city);

    if (place.lat && place.lng) {
      setLat(place.lat);
      analyzeLocation(place.lat, place.lng, place.city);
    } else {
      setLat(null);
    }
  }

  /* ── Validierung ── */
  const canNext0 = !!(form.street && form.city && form.price && form.rent);
  const canNext1 = !!(form.hausgeld && form.area && form.year && form.energyClass);

  /* ── Analyse starten ── */
  function startAnalysis() {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    runAnalysis();
  }

  function runAnalysis() {
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
            ...(locationData ? { walkScore: locationData.walkScore, transitScore: locationData.transitScore } : {}),
          };
          const sr = computeScore(input);
          setResult(sr);
          setSaveChoice("none");
          setView("result");
        }, 600);
      }
    }, 600);
  }

  async function handleSavePortfolio() {
    if (!result || !user || saving || saveChoice !== "none") return;
    setSaving(true);
    try {
      await savePortfolioProperty(user.id, {
        address: form.street,
        city: form.city,
        purchasePrice: Number(form.price),
        currentRent: Number(form.rent),
        area: Number(form.area) || undefined,
        buildYear: Number(form.year) || undefined,
        energyClass: form.energyClass,
        houseMoney: Number(form.hausgeld) || undefined,
        locationGrade: form.locationGrade || "B",
        renovations: form.renovations,
        score: result.totalScore,
        scoreData: result as unknown as Record<string, unknown>,
        locationData: locationData as unknown as Record<string, unknown> || undefined,
        lat: lat || undefined,
      });
      setSaveChoice("portfolio");
      setToast({ text: "Immobilie im Portfolio gespeichert", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ text: "Fehler beim Speichern. Bitte versuchen Sie es erneut.", type: "neutral" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveCompare() {
    if (!result || !user || saving || saveChoice !== "none") return;
    setSaving(true);
    try {
      const input: PropertyInput = {
        street: form.street, city: form.city, price: Number(form.price), rent: Number(form.rent),
        hausgeld: Number(form.hausgeld), area: Number(form.area), year: Number(form.year),
        energyClass: form.energyClass, locationGrade: form.locationGrade || "B", renovations: form.renovations,
        ...(locationData ? { walkScore: locationData.walkScore, transitScore: locationData.transitScore } : {}),
      };
      await saveAnalysisDB(
        user.id,
        null,
        input as unknown as Record<string, unknown>,
        result as unknown as Record<string, unknown>,
        { status: "saved", saveType: "comparison" }
      );
      setSaveChoice("compare");
      setToast({ text: "Immobilie im Vergleich gespeichert", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ text: "Fehler beim Speichern. Bitte versuchen Sie es erneut.", type: "neutral" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinanzierung() {
    if (!user || !result || finanzSending) return;
    setFinanzSending(true);
    try {
      await fetch("/api/financing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          property: `${form.street}, ${form.city}`,
          price: Number(form.price),
          score: result.totalScore,
          name: finanzForm.name,
          email: finanzForm.email || user.email,
          phone: finanzForm.phone,
          message: finanzForm.message,
        }),
      });
      setFinanzSent(true);
    } catch {
      // silent
    } finally {
      setFinanzSending(false);
    }
  }

  function reset() {
    setForm(INIT);
    setSection(0);
    setResult(null);
    setLocationDone(false);
    setLocationData(null);
    setLat(null);
    setView("input");
    setExpanded(null);
    setSaveChoice("none");
    setShowFinanzierung(false);
    setFinanzSent(false);
    setFinanzForm({ name: "", email: "", phone: "", message: "" });
  }

  /* ── Global checkout toast ── */
  const checkoutToast = toast ? (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
      style={{
        background: toast.type === "success" ? C.greenDim : C.surface3,
        color: toast.type === "success" ? C.green : C.sub,
        border: `1px solid ${toast.type === "success" ? C.greenBorder : C.border}`,
      }}
    >
      {toast.text}
    </div>
  ) : null;

  /* Grade color helpers */
  function gradeColor(grade: string) {
    if (grade === "A") return C.green;
    if (grade === "B") return C.blue;
    if (grade === "C") return C.amber;
    return C.red;
  }
  function gradeBg(grade: string) {
    if (grade === "A") return C.greenDim;
    if (grade === "B") return "rgba(76,154,255,0.12)";
    if (grade === "C") return C.amberDim;
    return C.redDim;
  }
  function gradeBorder(grade: string) {
    if (grade === "A") return C.greenBorder;
    if (grade === "B") return "rgba(76,154,255,0.2)";
    if (grade === "C") return C.amberBorder;
    return "rgba(248,113,113,0.2)";
  }

  /* ── Verhandlungsguide generator ── */
  function getVerhandlungsTipps(sr: ScoringResult) {
    const tipps: string[] = [];
    const score = sr.totalScore;
    const price = Number(form.price);
    const rent = Number(form.rent);
    const factor = price / (rent * 12);
    const grossYield = ((rent * 12) / price) * 100;

    if (factor > 25) {
      tipps.push(`Der Kaufpreisfaktor liegt bei ${factor.toFixed(1)}x — argumentieren Sie mit dem Marktdurchschnitt von 20–22x für vergleichbare Objekte.`);
    }
    if (grossYield < 4) {
      tipps.push(`Die Bruttorendite von ${grossYield.toFixed(1)} % liegt unter dem Marktdurchschnitt. Fordern Sie einen Preisnachlass von ${Math.round(price * 0.08).toLocaleString("de-DE")}–${Math.round(price * 0.12).toLocaleString("de-DE")} €.`);
    }
    if (form.renovations.length > 0) {
      const renoCost = form.renovations.length * 15000;
      tipps.push(`${form.renovations.length} Sanierungsgewerke identifiziert — geschätzte Kosten ca. ${renoCost.toLocaleString("de-DE")} €. Nutzen Sie dies als Verhandlungsbasis.`);
    }
    if (score < 50) {
      tipps.push("Der Gesamtscore unter 50 signalisiert erhöhtes Risiko — verlangen Sie mindestens 10–15 % Preisnachlass oder zusätzliche Garantien.");
    }
    if (score >= 70) {
      tipps.push("Starker Score — bei diesem Objekt haben Sie gute Chancen auf eine schnelle Bankzusage. Nutzen Sie das als Argument für schnellen Abschluss bei Preisnachlass.");
    }
    const energyIdx = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"].indexOf(form.energyClass);
    if (energyIdx >= 5) {
      tipps.push(`Energieklasse ${form.energyClass}: GEG-Nachrüstpflichten bei Eigentümerwechsel. Argumentieren Sie mit den anfallenden Sanierungskosten.`);
    }
    if (tipps.length === 0) {
      tipps.push("Das Objekt zeigt insgesamt solide Kennzahlen. Verhandeln Sie dennoch — 3–5 % Preisnachlass sind im Markt üblich.");
    }
    return tipps;
  }

  /* ── KI-Empfehlung generator ── */
  function getKIEmpfehlung(sr: ScoringResult): { text: string; variant: "good" | "info" | "warn" | "bad" } {
    const score = sr.totalScore;
    if (score >= 75) {
      return {
        text: `Klare Kaufempfehlung. Mit einem Score von ${score}/100 gehört dieses Objekt zu den Top-Investments. Sichern Sie sich zeitnah eine Finanzierungszusage und prüfen Sie Sondertilgungsoptionen.`,
        variant: "good",
      };
    }
    if (score >= 55) {
      return {
        text: `Solides Investment mit Optimierungspotenzial (${score}/100). Prüfen Sie die schwächeren Teilscores und verhandeln Sie gezielt auf Basis der identifizierten Schwächen.`,
        variant: "info",
      };
    }
    if (score >= 40) {
      return {
        text: `Erhöhte Vorsicht geboten (${score}/100). Mehrere Risikofaktoren identifiziert. Verhandeln Sie deutliche Preisabschläge oder prüfen Sie alternative Objekte.`,
        variant: "warn",
      };
    }
    return {
      text: `Von diesem Investment wird abgeraten (${score}/100). Die Risiken überwiegen deutlich. Suchen Sie nach Objekten mit besserem Rendite-Risiko-Profil.`,
      variant: "bad",
    };
  }

  /* ══════════════════════════════════
     INPUT VIEW
     ══════════════════════════════════ */
  if (view === "input") {
    return (
      <div className="mx-auto max-w-[640px] space-y-6">
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => { setShowAuthModal(false); runAnalysis(); }}
        />
        {checkoutToast}
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

            <AddressAutocomplete
              onSelect={handleAddressSelect}
              defaultValue={form.street ? `${form.street}, ${form.city}` : ""}
            />

            {/* Loading-State für Lage-Analyse */}
            {locationLoading && (
              <div className="flex items-center gap-3 rounded-xl p-4 animate-fade-up" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <AIOrb size={24} active />
                <span className="text-sm" style={{ color: C.sub }}>Lage wird analysiert...</span>
              </div>
            )}

            {/* Lage-Card mit echten Daten */}
            {locationDone && locationData && (
              <Card className="p-4 space-y-3 animate-fade-up">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-xs font-bold"
                    style={{
                      background: gradeBg(locationData.locationGrade),
                      color: gradeColor(locationData.locationGrade),
                      border: `1px solid ${gradeBorder(locationData.locationGrade)}`,
                    }}
                  >
                    Lageklasse {locationData.locationGrade}
                  </span>
                  <span className="text-xs" style={{ color: C.sub }}>{form.city}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric label="Walk-Score" value={String(locationData.walkScore)} />
                  <MiniMetric label="ÖPNV-Score" value={String(locationData.transitScore)} />
                  <MiniMetric label="Mietwachstum" value={locationData.rentGrowth} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.dim }}>
                  {locationData.description}
                </p>
                {locationData.nearbyHighlights.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-semibold" style={{ color: C.sub }}>Umgebung (1 km Radius)</p>
                    {locationData.nearbyHighlights.map((h, i) => (
                      <p key={i} className="text-xs" style={{ color: C.dim }}>
                        <span style={{ color: C.accent }}>·</span> {h}
                      </p>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Hinweis wenn keine Google-Adresse gewählt */}
            {!locationDone && !locationLoading && (form.street || form.city) && !lat && (
              <p className="text-xs" style={{ color: C.dim }}>
                Für eine automatische Lage-Analyse wählen Sie eine Adresse aus den Vorschlägen.
              </p>
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

    const kiEmpfehlung = getKIEmpfehlung(result);
    const verhandlungsTipps = getVerhandlungsTipps(result);

    return (
      <div className="mx-auto max-w-[1100px] space-y-6 animate-fade-up">
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
            style={{
              background: toast.type === "success" ? C.greenDim : C.redDim,
              color: toast.type === "success" ? C.green : C.red,
              border: `1px solid ${toast.type === "success" ? C.greenBorder : "rgba(248,113,113,0.2)"}`,
            }}
          >
            {toast.text}
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
          <button onClick={reset} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Neue Analyse</button>
        </div>

        {/* ── FREE USER: minimal result ── */}
        {!isPro ? (
          <>
            {/* Score Ring only — no radar, no KPIs */}
            <Card className="p-8 flex flex-col items-center justify-center" glow>
              <ScoreRing value={result.totalScore} size={160} />
              <p className="text-lg font-bold mt-3" style={{ color: scoreColor(result.totalScore) }}>{scoreLabel(result.totalScore)}</p>
              <p className="text-xs mt-1" style={{ color: C.dim }}>Gesamtbewertung</p>
            </Card>

            {/* Short KI comment */}
            <AIComment variant={kiEmpfehlung.variant}>
              {result.totalScore >= 75
                ? "Klare Kaufempfehlung. Dieses Objekt gehört zu den Top-Investments."
                : result.totalScore >= 55
                  ? "Solides Investment mit Optimierungspotenzial."
                  : result.totalScore >= 40
                    ? "Erhöhte Vorsicht geboten. Mehrere Risikofaktoren identifiziert."
                    : "Von diesem Investment wird abgeraten."}
            </AIComment>

            {/* UpgradeBox with personalized score text */}
            <UpgradeBox score={result.totalScore} onNeedAuth={() => setShowAuthModal(true)} />

            {/* Blurred Teilscores teaser */}
            <div className="select-none pointer-events-none" style={{ filter: "blur(8px)", opacity: 0.4 }} aria-hidden="true">
              <div className="space-y-2">
                {result.subscores.map((sub) => (
                  <Card key={sub.key} className="overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <MiniRing value={sub.value} size={40} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold">{sub.label}</span>
                        <p className="text-xs mt-0.5 truncate" style={{ color: C.sub }}>{sub.oneLiner}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PRO: Full Hero Row */}
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="p-6 flex flex-col items-center justify-center" glow>
                <ScoreRing value={result.totalScore} size={150} />
                <p className="text-sm font-bold mt-2" style={{ color: scoreColor(result.totalScore) }}>{scoreLabel(result.totalScore)}</p>
                <p className="text-xs mt-1" style={{ color: C.dim }}>Gesamtbewertung</p>
              </Card>
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: C.sub, fontSize: 10 }} />
                    <Radar dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.08} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
              <div className="space-y-3">
                <KPIRow label="Nettorendite" value={`${(result.kpis.netYield * 100).toFixed(2)} %`} color={result.kpis.netYield >= 0.03 ? C.green : result.kpis.netYield >= 0.01 ? C.amber : C.red} />
                <KPIRow label="Kaufpreisfaktor" value={`${result.kpis.factor.toFixed(1)}x`} color={result.kpis.factor <= 25 ? C.green : result.kpis.factor <= 30 ? C.amber : C.red} />
                <KPIRow label="Finanzierbarkeit" value={`${result.subscores.find(s => s.key === "financing")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "financing")?.value || 0)} />
                <KPIRow label="Risiko-Score" value={`${result.subscores.find(s => s.key === "risk")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "risk")?.value || 0)} />
              </div>
            </div>

            <AIComment variant={kiEmpfehlung.variant}>
              {kiEmpfehlung.text}
            </AIComment>

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
            <div className="grid md:grid-cols-2 gap-5 mt-6">
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

            {/* ── Verhandlungsguide ── */}
            <Card className="p-5 space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
                </svg>
                <h3 className="text-sm font-bold" style={{ color: C.text }}>Verhandlungsguide</h3>
              </div>
              <p className="text-xs" style={{ color: C.dim }}>
                Basierend auf Ihren Analysedaten — nutzen Sie diese Argumente in der Preisverhandlung:
              </p>
              <ul className="space-y-2">
                {verhandlungsTipps.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                    <span className="mt-0.5 shrink-0 font-bold" style={{ color: C.accent }}>{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            {/* ── Finanzierungsanfrage ── */}
            <Card className="p-5 space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
                  </svg>
                  <h3 className="text-sm font-bold" style={{ color: C.text }}>Finanzierungsanfrage</h3>
                </div>
                {!showFinanzierung && !finanzSent && (
                  <button
                    onClick={() => setShowFinanzierung(true)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                  >
                    Anfrage starten
                  </button>
                )}
              </div>

              {finanzSent ? (
                <div className="rounded-xl p-4 text-center" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
                  <p className="text-sm font-bold" style={{ color: C.green }}>Anfrage gesendet!</p>
                  <p className="text-xs mt-1" style={{ color: C.sub }}>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                </div>
              ) : !showFinanzierung ? (
                <p className="text-xs" style={{ color: C.dim }}>
                  Lassen Sie sich ein unverbindliches Finanzierungsangebot für dieses Objekt erstellen.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Name</label>
                      <input
                        type="text"
                        value={finanzForm.name}
                        onChange={(e) => setFinanzForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Max Mustermann"
                        className="w-full rounded-xl px-3 py-2 text-sm"
                        style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>E-Mail</label>
                      <input
                        type="email"
                        value={finanzForm.email}
                        onChange={(e) => setFinanzForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder={user?.email || "email@beispiel.de"}
                        className="w-full rounded-xl px-3 py-2 text-sm"
                        style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Telefon (optional)</label>
                    <input
                      type="tel"
                      value={finanzForm.phone}
                      onChange={(e) => setFinanzForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+49 170 1234567"
                      className="w-full rounded-xl px-3 py-2 text-sm"
                      style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachricht (optional)</label>
                    <textarea
                      value={finanzForm.message}
                      onChange={(e) => setFinanzForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Besondere Wünsche oder Fragen..."
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-sm resize-none"
                      style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFinanzierung(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold"
                      style={{ border: `1px solid ${C.border}`, color: C.sub }}
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleFinanzierung}
                      disabled={finanzSending || !finanzForm.name}
                      className="flex-1 rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, color: "#fff" }}
                    >
                      {finanzSending ? "Wird gesendet..." : "Unverbindlich anfragen"}
                    </button>
                  </div>
                </div>
              )}
            </Card>

            {/* ── Save Choice Section (PRO only) ── */}
            <div className="border-t pt-6 mt-6 space-y-4" style={{ borderColor: C.border }}>
              <h3 className="text-base font-bold" style={{ color: C.text }}>Was möchten Sie mit diesem Objekt tun?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Portfolio Card */}
                <button
                  onClick={handleSavePortfolio}
                  disabled={saving || saveChoice !== "none"}
                  className="rounded-2xl p-5 text-left transition-all disabled:opacity-50"
                  style={{
                    background: saveChoice === "portfolio" ? C.greenDim : C.surface2,
                    border: `1px solid ${saveChoice === "portfolio" ? C.greenBorder : C.border}`,
                    cursor: saveChoice !== "none" ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.accentDim}, rgba(76,154,255,0.08))` }}>
                      {saveChoice === "portfolio" ? (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: saveChoice === "portfolio" ? C.green : C.text }}>
                        {saveChoice === "portfolio" ? "Im Portfolio gespeichert" : "Meine Immobilie"}
                      </p>
                      <p className="text-xs" style={{ color: C.sub }}>Das ist eine Immobilie die ich bereits besitze</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.dim }}>
                    Speichern Sie sie in Ihrem Portfolio für Trends, Wertentwicklung und Empfehlungen.
                  </p>
                </button>

                {/* Compare Card */}
                <button
                  onClick={handleSaveCompare}
                  disabled={saving || saveChoice !== "none"}
                  className="rounded-2xl p-5 text-left transition-all disabled:opacity-50"
                  style={{
                    background: saveChoice === "compare" ? C.greenDim : C.surface2,
                    border: `1px solid ${saveChoice === "compare" ? C.greenBorder : C.border}`,
                    cursor: saveChoice !== "none" ? "default" : "pointer",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, rgba(76,154,255,0.12), ${C.accentDim})` }}>
                      {saveChoice === "compare" ? (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="8" height="18" rx="1" />
                          <rect x="14" y="3" width="8" height="18" rx="1" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: saveChoice === "compare" ? C.green : C.text }}>
                        {saveChoice === "compare" ? "Im Vergleich gespeichert" : "Zum Vergleich"}
                      </p>
                      <p className="text-xs" style={{ color: C.sub }}>Das ist eine Immobilie die ich in Erwägung ziehe</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.dim }}>
                    Speichern Sie sie für den direkten Vergleich mit anderen Objekten.
                  </p>
                </button>
              </div>

              {/* KI-Empfehlung */}
              <AIComment variant={result.totalScore >= 75 ? "good" : result.totalScore >= 60 ? "info" : result.totalScore >= 40 ? "warn" : "bad"}>
                {result.totalScore >= 75
                  ? "Klare Kaufempfehlung. Objekt favorisieren und Finanzierung prüfen."
                  : result.totalScore >= 60
                    ? "Solides Objekt. Speichern und mit anderen Objekten vergleichen."
                    : result.totalScore >= 40
                      ? "Erhöhte Vorsicht. Nur bei Verhandlungsspielraum weiterverfolgen."
                      : "Andere Objekte bieten ein besseres Rendite-Risiko-Profil."}
              </AIComment>

              {/* Navigation after save */}
              {saveChoice !== "none" && (
                <div className="flex gap-3 animate-fade-up">
                  <button
                    onClick={() => router.push(saveChoice === "portfolio" ? "/portfolio" : "/compare")}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
                    style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                  >
                    {saveChoice === "portfolio" ? "Zum Portfolio" : "Zum Vergleich"}
                  </button>
                  <button onClick={reset} className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
                    Neue Analyse
                  </button>
                </div>
              )}
            </div>
          </>
        )}
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
