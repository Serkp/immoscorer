"use client";

import { useState } from "react";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { C } from "@/lib/theme";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; desc?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "goal",
    question: "Was ist Ihr primäres Investitionsziel?",
    options: [
      { value: "cashflow", label: "Cashflow", desc: "Monatliche Einnahmen" },
      { value: "wealth", label: "Vermögensaufbau", desc: "Langfristige Wertsteigerung" },
      { value: "tax", label: "Steueroptimierung", desc: "AfA und Verlustverrechnung" },
      { value: "retirement", label: "Altersvorsorge", desc: "Schuldenfreie Immobilie" },
    ],
  },
  {
    id: "equity",
    question: "Wie viel Eigenkapital steht Ihnen zur Verfügung?",
    options: [
      { value: "0-30k", label: "0–30.000 €" },
      { value: "30-60k", label: "30.000–60.000 €" },
      { value: "60-100k", label: "60.000–100.000 €" },
      { value: "100k+", label: "Über 100.000 €" },
    ],
  },
  {
    id: "income",
    question: "Ihr monatliches Nettoeinkommen (Haushalt)?",
    options: [
      { value: "2-3k", label: "2.000–3.000 €" },
      { value: "3-5k", label: "3.000–5.000 €" },
      { value: "5-8k", label: "5.000–8.000 €" },
      { value: "8k+", label: "Über 8.000 €" },
    ],
  },
  {
    id: "experience",
    question: "Ihre Immobilien-Erfahrung?",
    options: [
      { value: "none", label: "Keine", desc: "Erstes Investment" },
      { value: "1-2", label: "1–2 Objekte", desc: "Grundkenntnisse" },
      { value: "3-5", label: "3–5 Objekte", desc: "Erfahren" },
      { value: "5+", label: "Über 5", desc: "Profi-Investor" },
    ],
  },
  {
    id: "risk",
    question: "Ihre Risikobereitschaft?",
    options: [
      { value: "low", label: "Konservativ", desc: "Sicherheit geht vor" },
      { value: "medium", label: "Moderat", desc: "Ausgewogenes Risiko" },
      { value: "high", label: "Offensiv", desc: "Rendite vor Sicherheit" },
    ],
  },
  {
    id: "timeline",
    question: "Ihr Zeithorizont für das Investment?",
    options: [
      { value: "short", label: "1–3 Jahre", desc: "Kurzfristig" },
      { value: "medium", label: "3–10 Jahre", desc: "Mittelfristig" },
      { value: "long", label: "Über 10 Jahre", desc: "Langfristig" },
    ],
  },
  {
    id: "involvement",
    question: "Wie aktiv möchten Sie investieren?",
    options: [
      { value: "passive", label: "Passiv", desc: "Hausverwaltung macht alles" },
      { value: "semi", label: "Semi-aktiv", desc: "Gelegentlich eingreifen" },
      { value: "active", label: "Aktiv", desc: "Selbst verwalten & sanieren" },
    ],
  },
  {
    id: "location",
    question: "Bevorzugte Objektlage?",
    options: [
      { value: "metro", label: "Großstadt", desc: "München, Berlin, Hamburg..." },
      { value: "city", label: "Mittelstadt", desc: "50.000–500.000 Einwohner" },
      { value: "rural", label: "Ländlich", desc: "Unter 50.000 Einwohner" },
      { value: "flexible", label: "Flexibel", desc: "Rendite entscheidet" },
    ],
  },
];

interface StrategyResult {
  strategy: string;
  strategyDesc: string;
  maxFinancing: string;
  budgetRange: string;
  recommendedObjects: string[];
  feasibility: number;
  tips: string[];
}

function computeStrategy(answers: Record<string, string>): StrategyResult {
  const { goal, equity, income, experience, risk, timeline, involvement } = answers;

  // Calculate max financing
  const incomeMap: Record<string, number> = { "2-3k": 2500, "3-5k": 4000, "5-8k": 6500, "8k+": 10000 };
  const equityMap: Record<string, number> = { "0-30k": 20000, "30-60k": 45000, "60-100k": 80000, "100k+": 150000 };
  const monthlyIncome = incomeMap[income] || 3000;
  const availableEquity = equityMap[equity] || 30000;

  const maxMonthlyRate = monthlyIncome * 0.35;
  const maxLoan = maxMonthlyRate * 12 / 0.05; // 5% annuity rate
  const maxBudget = availableEquity + maxLoan;

  // Determine strategy
  let strategy = "Buy & Hold";
  let strategyDesc = "";

  if (goal === "cashflow" && risk !== "low" && involvement === "active") {
    strategy = "Value-Add";
    strategyDesc = "Objekte unter Marktwert kaufen, gezielt sanieren und Miete steigern. Aktive Wertschöpfung durch Optimierung.";
  } else if (timeline === "short" && risk === "high" && involvement === "active") {
    strategy = "Fix & Flip";
    strategyDesc = "Schneller Kauf, gezielte Sanierung, Verkauf mit Gewinn. Hohe Rendite bei hohem Risiko und Aufwand.";
  } else if (goal === "tax" || goal === "retirement") {
    strategy = "Buy & Hold (Steueroptimiert)";
    strategyDesc = "Langfristiger Bestandsaufbau mit Fokus auf AfA-Optimierung und schuldenfreien Vermögensaufbau zur Altersvorsorge.";
  } else {
    strategy = "Buy & Hold";
    strategyDesc = "Kaufen, vermieten, halten. Passiver Vermögensaufbau durch Mieteinnahmen, Tilgung und Wertsteigerung. Die bewährteste Strategie.";
  }

  // Recommended objects
  const objects: string[] = [];
  if (maxBudget < 150000) {
    objects.push("1–2 Zimmer Wohnung in B/C-Lage");
    objects.push("Studenten-Apartment in Universitätsstadt");
  } else if (maxBudget < 300000) {
    objects.push("2–3 Zimmer Wohnung in B-Lage");
    objects.push("Eigentumswohnung in aufstrebender Mittelstadt");
    if (risk !== "low") objects.push("Sanierungsobjekt mit Wertsteigerungspotenzial");
  } else {
    objects.push("3–4 Zimmer Wohnung in A/B-Lage");
    objects.push("Mehrfamilienhaus (2–4 Einheiten)");
    if (experience !== "none") objects.push("Gewerbeeinheit mit langfristigem Mietvertrag");
  }

  // Feasibility score
  let feasibility = 60;
  if (availableEquity >= 60000) feasibility += 15;
  else if (availableEquity >= 30000) feasibility += 5;
  if (monthlyIncome >= 5000) feasibility += 10;
  if (experience !== "none") feasibility += 10;
  if (timeline !== "short") feasibility += 5;
  feasibility = Math.min(100, feasibility);

  // Tips
  const tips: string[] = [];
  if (availableEquity < 30000) {
    tips.push("Bauen Sie zunächst Eigenkapital auf. Mindestens 10–15 % des Kaufpreises plus Nebenkosten sollten verfügbar sein.");
  }
  if (experience === "none") {
    tips.push("Als Erstinvestor empfehlen wir: Start mit einer überschaubaren Wohnung, Hausverwaltung einschalten, konservativ kalkulieren.");
  }
  if (risk === "high" && experience === "none") {
    tips.push("Vorsicht: Offensive Strategien erfordern Erfahrung. Beginnen Sie konservativ und steigern Sie schrittweise.");
  }
  tips.push(`Maximale monatliche Kreditrate: ca. ${Math.round(maxMonthlyRate).toLocaleString("de-DE")} € (35 % des Nettoeinkommens).`);
  if (goal === "tax") {
    tips.push("Nutzen Sie die AfA (2–2,5 % p.a.) und sprechen Sie mit einem Steuerberater über § 7h/7i EStG für Sanierungsobjekte.");
  }

  return {
    strategy,
    strategyDesc,
    maxFinancing: `${Math.round(maxLoan / 1000)}k €`,
    budgetRange: `${Math.round(maxBudget / 1000)}k €`,
    recommendedObjects: objects,
    feasibility,
    tips,
  };
}

export default function StrategiesPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<StrategyResult | null>(null);

  function selectAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 200);
    } else {
      // Last question answered — compute result
      const finalAnswers = { ...answers, [questionId]: value };
      setResult(computeStrategy(finalAnswers));
    }
  }

  function resetQuiz() {
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  // Show result
  if (result) {
    const content = (
      <div className="mx-auto max-w-[800px] space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Ihre persönliche Strategie</h1>
            <p className="text-sm mt-1" style={{ color: C.sub }}>Basierend auf Ihrem Investorenprofil</p>
          </div>
          <button
            onClick={resetQuiz}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ border: `1px solid ${C.border}`, color: C.sub }}
          >
            Neu starten
          </button>
        </div>

        {/* Strategy Card */}
        <Card className="p-6 space-y-4" glow>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: C.accentDim }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: C.text }}>{result.strategy}</h2>
              <p className="text-xs" style={{ color: C.sub }}>{result.strategyDesc}</p>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <p className="text-lg font-bold" style={{ color: C.accent }}>{result.maxFinancing}</p>
            <p className="text-[10px]" style={{ color: C.dim }}>Max. Finanzierung</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-lg font-bold" style={{ color: C.green }}>{result.budgetRange}</p>
            <p className="text-[10px]" style={{ color: C.dim }}>Gesamtbudget</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-lg font-bold" style={{ color: scoreColor(result.feasibility) }}>{result.feasibility}/100</p>
            <p className="text-[10px]" style={{ color: C.dim }}>Machbarkeit</p>
          </Card>
        </div>

        {/* Recommended Objects */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>Empfohlene Objekttypen</h3>
          <ul className="space-y-2">
            {result.recommendedObjects.map((obj, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                <span className="mt-0.5 shrink-0" style={{ color: C.green }}>{"\u2192"}</span>
                {obj}
              </li>
            ))}
          </ul>
        </Card>

        {/* Tips */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>Handlungsempfehlungen</h3>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                <span className="mt-0.5 shrink-0 font-bold" style={{ color: C.accent }}>{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        <AIComment variant={result.feasibility >= 70 ? "good" : result.feasibility >= 50 ? "info" : "warn"}>
          {result.feasibility >= 70
            ? "Gute Ausgangslage! Ihre finanziellen Voraussetzungen und Ihr Profil passen gut zu der empfohlenen Strategie."
            : result.feasibility >= 50
              ? "Machbar mit Vorbereitung. Fokussieren Sie sich auf die Handlungsempfehlungen, bevor Sie investieren."
              : "Zusätzliche Vorbereitung empfohlen. Bauen Sie Eigenkapital und Wissen auf, bevor Sie starten."}
        </AIComment>

        <div className="flex gap-3">
          <Link
            href="/analysis"
            className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-center transition-all"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
          >
            Passende Immobilie analysieren
          </Link>
        </div>
      </div>
    );

    return content;
  }

  // Questionnaire
  const currentQ = QUESTIONS[step];
  const progress = ((step + (answers[currentQ?.id] ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div className="mx-auto max-w-[640px] space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <AIOrb size={32} active />
        <div>
          <h1 className="text-lg font-bold">Strategie-Finder</h1>
          <p className="text-xs" style={{ color: C.sub }}>
            {QUESTIONS.length} Fragen zu Ihrem Investorenprofil
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]" style={{ color: C.dim }}>
          <span>Frage {step + 1} von {QUESTIONS.length}</span>
          <span>{Math.round(progress)} %</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})` }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQ && (
        <div className="space-y-4 animate-fade-up" key={currentQ.id}>
          <h2 className="text-base font-bold" style={{ color: C.text }}>{currentQ.question}</h2>

          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt) => {
              const selected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => selectAnswer(currentQ.id, opt.value)}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: selected ? C.accentMid : C.surface,
                    border: `1px solid ${selected ? C.accent : C.border}`,
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: selected ? C.accent : C.text }}>
                    {opt.label}
                  </span>
                  {opt.desc && (
                    <p className="text-xs mt-0.5" style={{ color: C.dim }}>{opt.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Back button */}
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl px-4 py-2 text-xs font-semibold"
              style={{ border: `1px solid ${C.border}`, color: C.sub }}
            >
              Zurück
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function scoreColor(v: number) {
  return v >= 75 ? C.green : v >= 55 ? C.blue : v >= 40 ? C.amber : C.red;
}
