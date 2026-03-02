"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { C } from "@/lib/theme";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import {
  generateFallbackStrategy,
  type StrategyResult,
  type StrategyInputs,
} from "@/lib/strategy-fallback";

/* ═══════════════════════════════════════════════════════
   STEP DEFINITIONS
   ═══════════════════════════════════════════════════════ */

interface RadioQ {
  id: string;
  label: string;
  type: "radio";
  options: { value: string; label: string }[];
}
interface TextQ {
  id: string;
  label: string;
  type: "text";
  placeholder?: string;
}
interface NumberQ {
  id: string;
  label: string;
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}
interface SliderQ {
  id: string;
  label: string;
  type: "slider";
  min: number;
  max: number;
  step: number;
  suffix?: string;
}
interface MultiQ {
  id: string;
  label: string;
  type: "multi";
  options: { value: string; label: string }[];
}

type Field = RadioQ | TextQ | NumberQ | SliderQ | MultiQ;

interface Step {
  title: string;
  subtitle: string;
  fields: Field[];
}

const STEPS: Step[] = [
  {
    title: "Lassen Sie uns Ihre persönliche Investmentstrategie entwickeln.",
    subtitle:
      "Wir brauchen ein paar Informationen über Ihre aktuelle Situation.",
    fields: [
      { id: "firstName", label: "Vorname", type: "text", placeholder: "Max" },
      {
        id: "age",
        label: "Alter",
        type: "number",
        placeholder: "32",
        min: 18,
        max: 80,
      },
      {
        id: "employment",
        label: "Berufsstand",
        type: "radio",
        options: [
          { value: "Angestellt", label: "Angestellt" },
          { value: "Selbstständig", label: "Selbstständig" },
          { value: "Beamter", label: "Beamter" },
          { value: "Student", label: "Student" },
          { value: "Rentner", label: "Rentner" },
          { value: "Sonstiges", label: "Sonstiges" },
        ],
      },
      {
        id: "income",
        label: "Jährliches Bruttoeinkommen",
        type: "radio",
        options: [
          { value: "Unter 30.000 €", label: "Unter 30.000 €" },
          { value: "30.000 - 50.000 €", label: "30.000 - 50.000 €" },
          { value: "50.000 - 75.000 €", label: "50.000 - 75.000 €" },
          { value: "75.000 - 100.000 €", label: "75.000 - 100.000 €" },
          { value: "100.000 - 150.000 €", label: "100.000 - 150.000 €" },
          { value: "Über 150.000 €", label: "Über 150.000 €" },
        ],
      },
      {
        id: "familyStatus",
        label: "Familienstand",
        type: "radio",
        options: [
          { value: "Single", label: "Single" },
          {
            value: "Partnerschaft/Verheiratet",
            label: "Partnerschaft/Verheiratet",
          },
          { value: "Familie mit Kindern", label: "Familie mit Kindern" },
        ],
      },
      {
        id: "livingSituation",
        label: "Wohnsituation",
        type: "radio",
        options: [
          { value: "Zur Miete", label: "Zur Miete" },
          { value: "Eigentumswohnung", label: "Eigentumswohnung (selbstgenutzt)" },
          { value: "Eigenes Haus", label: "Eigenes Haus" },
          { value: "Bei den Eltern", label: "Bei den Eltern" },
        ],
      },
    ],
  },
  {
    title: "Wo stehen Sie finanziell?",
    subtitle: "Diese Angaben helfen uns, realistische Empfehlungen zu geben.",
    fields: [
      {
        id: "equity",
        label: "Vorhandenes Eigenkapital für Investments",
        type: "slider",
        min: 0,
        max: 500000,
        step: 5000,
        suffix: "€",
      },
      {
        id: "monthlySavings",
        label: "Monatliche Sparrate",
        type: "slider",
        min: 0,
        max: 5000,
        step: 100,
        suffix: "€",
      },
      {
        id: "existingProperties",
        label: "Bestehende Immobilien",
        type: "radio",
        options: [
          { value: "Keine (Einsteiger)", label: "Keine (Einsteiger)" },
          { value: "1 Immobilie", label: "1 Immobilie" },
          { value: "2-3 Immobilien", label: "2-3 Immobilien" },
          { value: "4-10 Immobilien", label: "4-10 Immobilien" },
          { value: "Mehr als 10", label: "Mehr als 10" },
        ],
      },
      {
        id: "existingDebts",
        label: "Bestehende Schulden/Kredite (außer Immobilien)",
        type: "radio",
        options: [
          { value: "Keine", label: "Keine" },
          { value: "Unter 10.000 €", label: "Unter 10.000 €" },
          { value: "10.000 - 50.000 €", label: "10.000 - 50.000 €" },
          { value: "Über 50.000 €", label: "Über 50.000 €" },
        ],
      },
      {
        id: "schufa",
        label: "Schufa-Situation",
        type: "radio",
        options: [
          { value: "Sehr gut", label: "Sehr gut (keine negativen Einträge)" },
          { value: "Gut", label: "Gut (1-2 alte Einträge)" },
          { value: "Mittel", label: "Mittel (aktive Einträge)" },
          { value: "Weiß ich nicht", label: "Weiß ich nicht" },
        ],
      },
    ],
  },
  {
    title: "Was möchten Sie mit Immobilien erreichen?",
    subtitle: "Ihr Ziel bestimmt die Strategie.",
    fields: [
      {
        id: "mainGoal",
        label: "Hauptziel",
        type: "radio",
        options: [
          {
            value: "Passives Einkommen / Cashflow aufbauen",
            label: "Passives Einkommen / Cashflow aufbauen",
          },
          {
            value: "Vermögen aufbauen / Altersvorsorge",
            label: "Vermögen aufbauen / Altersvorsorge",
          },
          {
            value: "Hauptberuf kündigen / finanziell frei werden",
            label: "Finanziell frei werden",
          },
          {
            value: "Fix & Flip / aktives Immobilien-Business",
            label: "Fix & Flip / aktives Business",
          },
          {
            value: "Sichere Geldanlage / Inflationsschutz",
            label: "Sichere Geldanlage / Inflationsschutz",
          },
          {
            value: "Steueroptimierung",
            label: "Steueroptimierung",
          },
        ],
      },
      {
        id: "timeHorizon",
        label: "Zeithorizont",
        type: "radio",
        options: [
          { value: "Kurzfristig (1-3 Jahre)", label: "Kurzfristig (1-3 Jahre)" },
          {
            value: "Mittelfristig (3-7 Jahre)",
            label: "Mittelfristig (3-7 Jahre)",
          },
          {
            value: "Langfristig (7-15 Jahre)",
            label: "Langfristig (7-15 Jahre)",
          },
          {
            value: "Sehr langfristig (15+ Jahre)",
            label: "Sehr langfristig (15+ Jahre)",
          },
        ],
      },
      {
        id: "targetIncome",
        label: "Gewünschtes monatliches Ziel-Einkommen aus Immobilien",
        type: "slider",
        min: 500,
        max: 20000,
        step: 500,
        suffix: "€/Monat",
      },
      {
        id: "riskTolerance",
        label: "Risikobereitschaft",
        type: "radio",
        options: [
          { value: "Konservativ", label: "Konservativ — Sicherheit geht vor" },
          { value: "Ausgewogen", label: "Ausgewogen — gutes Risiko/Rendite-Verhältnis" },
          { value: "Offensiv", label: "Offensiv — höhere Rendite, mehr Risiko" },
          { value: "Sehr offensiv", label: "Sehr offensiv — maximale Rendite" },
        ],
      },
    ],
  },
  {
    title: "Wie möchten Sie investieren?",
    subtitle: "Letzte Fragen zu Ihren Präferenzen.",
    fields: [
      {
        id: "preferredTypes",
        label: "Bevorzugte Objektart (Mehrfachauswahl)",
        type: "multi",
        options: [
          { value: "Eigentumswohnungen", label: "Eigentumswohnungen" },
          { value: "Einfamilienhäuser", label: "Einfamilienhäuser" },
          { value: "Mehrfamilienhäuser", label: "Mehrfamilienhäuser" },
          { value: "Gewerbeimmobilien", label: "Gewerbeimmobilien" },
          { value: "Offen für alles", label: "Offen für alles" },
        ],
      },
      {
        id: "preferredRegion",
        label: "Bevorzugte Region",
        type: "radio",
        options: [
          { value: "Meine Stadt / Region", label: "Meine Stadt / Region" },
          { value: "Überall in Deutschland", label: "Überall in Deutschland" },
          { value: "Nur Großstädte", label: "Nur Großstädte (A/B-Städte)" },
          {
            value: "Auch kleinere Städte",
            label: "Auch kleinere Städte wenn Rendite stimmt",
          },
        ],
      },
      {
        id: "management",
        label: "Selbst verwalten oder verwalten lassen?",
        type: "radio",
        options: [
          { value: "Selbst verwalten", label: "Selbst verwalten (mehr Rendite)" },
          { value: "Hausverwaltung", label: "Hausverwaltung (weniger Aufwand)" },
          { value: "Weiß noch nicht", label: "Weiß noch nicht" },
        ],
      },
      {
        id: "timeAvailable",
        label: "Zeitaufwand den Sie investieren können",
        type: "radio",
        options: [
          { value: "Minimal (< 2h/Woche)", label: "Minimal (< 2h/Woche)" },
          { value: "Moderat (2-5h/Woche)", label: "Moderat (2-5h/Woche)" },
          { value: "Viel (5-10h/Woche)", label: "Viel (5-10h/Woche)" },
          { value: "Vollzeit", label: "Vollzeit (bereit den Job zu wechseln)" },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   LOADING MESSAGES
   ═══════════════════════════════════════════════════════ */
const LOADING_MESSAGES = [
  "Analysiere Ihre finanzielle Situation...",
  "Berechne optimale Investmentstrategie...",
  "Erstelle Ihren persönlichen Phasenplan...",
  "Berechne Meilensteine...",
  "Finalisiere Ihre Strategie...",
];

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
type View = "questionnaire" | "loading" | "result";

export default function StrategiesPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("questionnaire");
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [savedDate, setSavedDate] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);

  /* ── Load saved strategy on mount ── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: rows } = await getSupabase()
          .from("strategies")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (rows && rows.length > 0) {
          setStrategy(rows[0].result as StrategyResult);
          setSavedDate(rows[0].created_at);
          setData((rows[0].inputs as Record<string, unknown>) || {});
          setView("result");
        }
      } catch {
        /* table may not exist — ignore */
      }
    })();
  }, [user]);

  /* ── Loading animation ── */
  useEffect(() => {
    if (view !== "loading") return;
    const msgInterval = setInterval(() => {
      setLoadingMsg((m) => (m < LOADING_MESSAGES.length - 1 ? m + 1 : m));
    }, 2500);
    const pctInterval = setInterval(() => {
      setLoadingPct((p) => Math.min(p + 1, 95));
    }, 130);
    return () => {
      clearInterval(msgInterval);
      clearInterval(pctInterval);
    };
  }, [view]);

  /* ── Field updater ── */
  const setField = useCallback(
    (id: string, value: unknown) =>
      setData((prev) => ({ ...prev, [id]: value })),
    []
  );

  /* ── Submit strategy ── */
  async function submitStrategy() {
    setView("loading");
    setLoadingMsg(0);
    setLoadingPct(0);

    const inputs: StrategyInputs = {
      firstName: data.firstName as string,
      age: Number(data.age) || undefined,
      employment: data.employment as string,
      income: data.income as string,
      familyStatus: data.familyStatus as string,
      livingSituation: data.livingSituation as string,
      equity: Number(data.equity) || 0,
      monthlySavings: Number(data.monthlySavings) || 0,
      existingProperties: data.existingProperties as string,
      existingDebts: data.existingDebts as string,
      schufa: data.schufa as string,
      mainGoal: data.mainGoal as string,
      timeHorizon: data.timeHorizon as string,
      targetIncome: Number(data.targetIncome) || 0,
      riskTolerance: data.riskTolerance as string,
      preferredTypes: data.preferredTypes as string[],
      preferredRegion: data.preferredRegion as string,
      management: data.management as string,
      timeAvailable: data.timeAvailable as string,
    };

    let result: StrategyResult;

    try {
      const res = await fetch("/api/ai-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const json = await res.json();
      if (json.strategy) {
        result = json.strategy;
      } else {
        result = generateFallbackStrategy(inputs);
      }
    } catch {
      result = generateFallbackStrategy(inputs);
    }

    /* Save to Supabase */
    if (user) {
      try {
        await getSupabase().from("strategies").insert({
          user_id: user.id,
          inputs,
          result,
        });
      } catch {
        /* table may not exist */
      }
    }

    setStrategy(result);
    setSavedDate(new Date().toISOString());
    setLoadingPct(100);
    setTimeout(() => setView("result"), 400);
  }

  /* ── PDF Download ── */
  async function downloadPDF() {
    if (!strategy) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 20;

    const addPage = () => { doc.addPage(); y = 20; };
    const checkPage = (need: number) => { if (y + need > 270) addPage(); };

    // Header
    doc.setFillColor(8, 9, 14);
    doc.rect(0, 0, W, 40, "F");
    doc.setTextColor(237, 238, 242);
    doc.setFontSize(18);
    doc.text("Ihre Investmentstrategie", 15, 18);
    doc.setFontSize(12);
    doc.setTextColor(124, 106, 255);
    doc.text(strategy.strategyName, 15, 28);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 160);
    const name = (data.firstName as string) || "Investor";
    doc.text(
      `Erstellt für ${name} am ${new Date(savedDate || Date.now()).toLocaleDateString("de-DE")}`,
      15, 36
    );
    y = 50;

    // Body text helper
    const writeSection = (title: string, body: string) => {
      checkPage(25);
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 50);
      doc.setFont("helvetica", "bold");
      doc.text(title, 15, y);
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 90);
      const lines = doc.splitTextToSize(body, W - 30);
      for (const line of lines) {
        checkPage(5);
        doc.text(line, 15, y);
        y += 4.5;
      }
      y += 4;
    };

    writeSection("Zusammenfassung", strategy.summary);

    const phases = [strategy.phase1, strategy.phase2, strategy.phase3];
    for (const phase of phases) {
      writeSection(phase.title + " (" + phase.timeframe + ")", phase.description);
      checkPage(15);
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 90);
      doc.text(`Zielobjekt: ${phase.targetProperty}`, 20, y); y += 4.5;
      doc.text(`Budget: ${phase.estimatedBudget}`, 20, y); y += 4.5;
      doc.text(`Erwarteter Cashflow: ${phase.expectedCashflow}`, 20, y); y += 4.5;
      for (const a of phase.actions) {
        checkPage(5);
        doc.text(`  → ${a}`, 20, y); y += 4.5;
      }
      y += 3;
    }

    writeSection("Eigenkapital-Strategie", strategy.financialPlan.eigenkapitalPlan);
    writeSection("Sparplan", strategy.financialPlan.sparplan);
    writeSection("Finanzierungsstrategie", strategy.financialPlan.finanzierungsStrategie);

    writeSection("Risikomanagement", strategy.riskManagement.risks.join("\n"));
    writeSection("Rücklagen", strategy.riskManagement.reserves);

    checkPage(25);
    writeSection("Erste Schritte", strategy.firstSteps.map((s, i) => `${i + 1}. ${s}`).join("\n"));

    writeSection("Investment-Kriterien",
      `Ideale Städte: ${strategy.investmentCriteria.idealCity}\nPreisrange: ${strategy.investmentCriteria.priceRange}\nMindestrendite: ${strategy.investmentCriteria.minRendite}\nObjekttyp: ${strategy.investmentCriteria.objectType}`
    );

    writeSection("Steuer-Tipps", strategy.taxTips.join("\n"));

    // Footer on last page
    checkPage(15);
    y += 5;
    doc.setDrawColor(200, 200, 210);
    doc.line(15, y, W - 15, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text("Erstellt mit ImmoScorer", 15, y);
    doc.text("Kostenlose Finanzierungsberatung: immoscorer.vercel.app/financing", 15, y + 4);

    doc.save(`ImmoScorer-Strategie-${name}.pdf`);
  }

  /* ── Start new ── */
  function startNew() {
    setView("questionnaire");
    setStep(0);
    setData({});
    setStrategy(null);
    setSavedDate(null);
  }

  /* ═══════════════════ RENDER ═══════════════════ */

  if (view === "loading") return <LoadingView msg={LOADING_MESSAGES[loadingMsg]} pct={loadingPct} />;
  if (view === "result" && strategy)
    return (
      <ResultView
        strategy={strategy}
        data={data}
        savedDate={savedDate}
        onNew={startNew}
        onPDF={downloadPDF}
      />
    );

  /* Questionnaire */
  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
        style={{ color: C.dim }}
      >
        ← Dashboard
      </Link>

      <div className="flex items-center gap-3">
        <AIOrb size={32} active />
        <div>
          <h1 className="text-lg font-bold" style={{ color: C.text }}>
            Strategie-Finder
          </h1>
          <p className="text-xs" style={{ color: C.sub }}>
            Schritt {step + 1} von {STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div
          className="flex justify-between text-[10px]"
          style={{ color: C.dim }}
        >
          <span>
            {step + 1} / {STEPS.length}
          </span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: C.surface3 }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div key={step} className="space-y-6 animate-fade-up">
        <div>
          <h2
            className="text-base font-bold"
            style={{ color: C.text }}
          >
            {currentStep.title}
          </h2>
          <p className="text-xs mt-1" style={{ color: C.sub }}>
            {currentStep.subtitle}
          </p>
        </div>

        <div className="space-y-5">
          {currentStep.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={data[field.id]}
              onChange={(v) => setField(field.id, v)}
            />
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors"
              style={{ border: `1px solid ${C.border}`, color: C.sub }}
            >
              Zurück
            </button>
          )}
          {isLast ? (
            <button
              onClick={submitStrategy}
              className="flex-1 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                color: "#fff",
              }}
            >
              Strategie erstellen →
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: C.accent, color: "#fff" }}
            >
              Weiter →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FIELD RENDERER
   ═══════════════════════════════════════════════════════ */
function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "text") {
    return (
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: C.text }}>
          {field.label}
        </label>
        <input
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: C.text }}>
          {field.label}
        </label>
        <input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />
      </div>
    );
  }

  if (field.type === "slider") {
    const num = Number(value) || field.min;
    return (
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: C.text }}>
          {field.label}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={num}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 accent-[#7C6AFF]"
            style={{ accentColor: C.accent }}
          />
          <span
            className="text-sm font-bold min-w-[90px] text-right"
            style={{ color: C.accent }}
          >
            {num >= field.max
              ? `${num.toLocaleString("de-DE")}+`
              : num.toLocaleString("de-DE")}{" "}
            {field.suffix}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: C.text }}>
          {field.label}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {field.options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className="rounded-xl px-4 py-2.5 text-left transition-all text-xs"
                style={{
                  background: selected ? C.accentMid : C.surface,
                  border: `1px solid ${selected ? C.accent : C.border}`,
                  color: selected ? C.accent : C.text,
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "multi") {
    const arr = (value as string[]) || [];
    const toggle = (v: string) => {
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    };
    return (
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: C.text }}>
          {field.label}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {field.options.map((opt) => {
            const selected = arr.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="rounded-xl px-4 py-2.5 text-left transition-all text-xs flex items-center gap-2"
                style={{
                  background: selected ? C.accentMid : C.surface,
                  border: `1px solid ${selected ? C.accent : C.border}`,
                  color: selected ? C.accent : C.text,
                }}
              >
                <span
                  className="w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0"
                  style={{
                    borderColor: selected ? C.accent : C.dim,
                    background: selected ? C.accent : "transparent",
                    color: "#fff",
                  }}
                >
                  {selected ? "✓" : ""}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════════════════
   LOADING VIEW
   ═══════════════════════════════════════════════════════ */
function LoadingView({ msg, pct }: { msg: string; pct: number }) {
  return (
    <div className="mx-auto max-w-[500px] flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <AIOrb size={56} active />
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold" style={{ color: C.text }}>
          Ihre Strategie wird erstellt...
        </h2>
        <p className="text-xs animate-pulse" style={{ color: C.sub }}>
          {msg}
        </p>
      </div>
      <div className="w-full space-y-1">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: C.surface3 }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
            }}
          />
        </div>
        <p className="text-[10px] text-right" style={{ color: C.dim }}>
          {pct} %
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RESULT VIEW
   ═══════════════════════════════════════════════════════ */
function ResultView({
  strategy,
  data,
  savedDate,
  onNew,
  onPDF,
}: {
  strategy: StrategyResult;
  data: Record<string, unknown>;
  savedDate: string | null;
  onNew: () => void;
  onPDF: () => void;
}) {
  const phases = [strategy.phase1, strategy.phase2, strategy.phase3];
  const name = (data.firstName as string) || "Investor";

  return (
    <div className="mx-auto max-w-[860px] space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs" style={{ color: C.dim }}>
            {savedDate &&
              `Erstellt am ${new Date(savedDate).toLocaleDateString("de-DE")}`}
          </p>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>
            Ihre persönliche Investmentstrategie
          </h1>
          <p className="text-sm mt-1" style={{ color: C.accent }}>
            {strategy.strategyName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.sub }}>
            Erstellt für {name}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onPDF}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
          >
            PDF herunterladen
          </button>
          <button
            onClick={onNew}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
            style={{ border: `1px solid ${C.border}`, color: C.sub }}
          >
            Neue Strategie
          </button>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-6" glow style={{ borderLeft: `3px solid ${C.accent}` }}>
        <p className="text-sm leading-relaxed" style={{ color: C.sub, lineHeight: 1.7 }}>
          {strategy.summary}
        </p>
      </Card>

      {/* 3-Phase Timeline */}
      <div>
        <h2 className="text-sm font-bold mb-4" style={{ color: C.text }}>
          Ihr 3-Phasen-Plan
        </h2>
        <div className="relative space-y-0">
          {phases.map((phase, idx) => {
            const colors = [C.accent, C.blue, C.green];
            const c = colors[idx];
            const isLastPhase = idx === phases.length - 1;
            return (
              <div key={idx} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-4 h-4 rounded-full border-2 z-10"
                    style={{ borderColor: c, background: C.bg }}
                  />
                  {!isLastPhase && (
                    <div
                      className="w-px flex-1 -mt-px"
                      style={{ background: C.border }}
                    />
                  )}
                </div>
                {/* Content */}
                <Card className="flex-1 p-5 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3
                      className="text-sm font-bold"
                      style={{ color: c }}
                    >
                      {phase.title}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: C.surface2, color: C.dim }}
                    >
                      {phase.timeframe}
                    </span>
                  </div>
                  <p
                    className="text-xs mb-3"
                    style={{ color: C.sub, lineHeight: 1.7 }}
                  >
                    {phase.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <MiniStat label="Zielobjekt" value={phase.targetProperty} />
                    <MiniStat label="Budget" value={phase.estimatedBudget} />
                    <MiniStat label="Erw. Cashflow" value={phase.expectedCashflow} />
                  </div>
                  <div className="space-y-1">
                    {phase.actions.map((a, ai) => (
                      <p key={ai} className="text-xs" style={{ color: C.sub }}>
                        <span style={{ color: c }}>→</span> {a}
                      </p>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Plan */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
          Finanzplan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-[10px] font-bold mb-1" style={{ color: C.accent }}>
              Eigenkapital-Strategie
            </p>
            <p className="text-xs" style={{ color: C.sub, lineHeight: 1.7 }}>
              {strategy.financialPlan.eigenkapitalPlan}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-bold mb-1" style={{ color: C.blue }}>
              Sparplan
            </p>
            <p className="text-xs" style={{ color: C.sub, lineHeight: 1.7 }}>
              {strategy.financialPlan.sparplan}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-[10px] font-bold mb-1" style={{ color: C.green }}>
              Finanzierungsstrategie
            </p>
            <p className="text-xs" style={{ color: C.sub, lineHeight: 1.7 }}>
              {strategy.financialPlan.finanzierungsStrategie}
            </p>
          </Card>
        </div>
      </div>

      {/* Risk Management */}
      <Card className="p-5">
        <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
          Risikomanagement
        </h2>
        <div className="space-y-2 mb-3">
          {strategy.riskManagement.risks.map((r, i) => (
            <p key={i} className="text-xs" style={{ color: C.sub, lineHeight: 1.7 }}>
              <span style={{ color: C.amber }}>!</span> {r}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <div>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.dim }}>
              Rücklagen
            </p>
            <p className="text-xs" style={{ color: C.sub }}>
              {strategy.riskManagement.reserves}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.dim }}>
              Diversifikation
            </p>
            <p className="text-xs" style={{ color: C.sub }}>
              {strategy.riskManagement.diversification}
            </p>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      <div>
        <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
          Meilensteine
        </h2>
        <div className="flex overflow-x-auto gap-3 pb-2">
          {strategy.milestones.map((m, i) => (
            <Card key={i} className="p-3 min-w-[140px] shrink-0 text-center">
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{
                  background:
                    i === 0
                      ? C.accent
                      : i < 3
                        ? C.blue
                        : C.green,
                }}
              />
              <p
                className="text-[10px] font-bold mb-1"
                style={{ color: C.text }}
              >
                {m.time}
              </p>
              <p className="text-[10px]" style={{ color: C.sub }}>
                {m.goal}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* First Steps */}
      <Card className="p-5" glow>
        <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
          Ihre ersten Schritte — JETZT starten
        </h2>
        <div className="space-y-3">
          {strategy.firstSteps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                style={{ background: C.accentMid, color: C.accent }}
              >
                {i + 1}
              </span>
              <p className="text-xs pt-0.5" style={{ color: C.sub, lineHeight: 1.7 }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Investment Criteria */}
      <Card className="p-5">
        <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
          So sollten Sie suchen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CriterionRow label="Ideale Städte" value={strategy.investmentCriteria.idealCity} />
          <CriterionRow label="Preisrange" value={strategy.investmentCriteria.priceRange} />
          <CriterionRow label="Mindestrendite" value={strategy.investmentCriteria.minRendite} />
          <CriterionRow label="Objekttyp" value={strategy.investmentCriteria.objectType} />
        </div>
        {strategy.investmentCriteria.avoidList.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: C.red }}>
              Vermeiden
            </p>
            {strategy.investmentCriteria.avoidList.map((a, i) => (
              <p key={i} className="text-xs" style={{ color: C.sub }}>
                <span style={{ color: C.red }}>✕</span> {a}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Tax Tips */}
      <AIComment variant="info">
        <p className="text-xs font-semibold mb-1" style={{ color: C.text }}>
          Steuer-Tipps für Ihre Situation
        </p>
        {strategy.taxTips.map((t, i) => (
          <p key={i} className="text-xs mt-1" style={{ lineHeight: 1.7 }}>
            {t}
          </p>
        ))}
      </AIComment>

      {/* CTA */}
      <Card
        className="p-6 text-center"
        style={{
          background: `linear-gradient(135deg, ${C.accentDim}, ${C.surface2})`,
          border: `1px solid ${C.accentMid}`,
        }}
      >
        <p className="text-sm font-bold mb-1" style={{ color: C.text }}>
          Bereit für den ersten Schritt?
        </p>
        <p className="text-xs mb-4" style={{ color: C.sub }}>
          Lassen Sie Ihre Finanzierungsmöglichkeiten kostenlos prüfen — passend
          zu Ihrer Strategie.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/financing"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            Finanzierung anfragen →
          </Link>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{
              background: C.surface2,
              color: C.text,
              border: `1px solid ${C.border}`,
            }}
          >
            Erste Analyse starten →
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ── Small helpers ── */
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-2"
      style={{ background: C.surface }}
    >
      <p className="text-[9px] font-bold" style={{ color: C.dim }}>
        {label}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: C.text }}>
        {value}
      </p>
    </div>
  );
}

function CriterionRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold" style={{ color: C.dim }}>
        {label}
      </p>
      <p className="text-xs" style={{ color: C.sub }}>
        {value}
      </p>
    </div>
  );
}
