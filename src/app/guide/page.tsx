"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

const TOPICS = [
  {
    num: "01",
    title: "Den Score verstehen",
    paragraphs: [
      "Der ImmoScorer Gesamtscore (0–100) setzt sich aus sechs gewichteten Teilscores zusammen: Rendite (25 %), Lage (20 %), Substanz (20 %), Energie (15 %), Cashflow (10 %) und Wertsteigerungspotenzial (10 %).",
      "Ein Score ab 75 gilt als sehr gutes Investment, 50–74 als solide mit Optimierungsbedarf. Unter 50 weist auf erhöhtes Risiko oder überhöhten Kaufpreis hin.",
      "Jeder Teilscore berücksichtigt marktübliche Benchmarks für den deutschen Immobilienmarkt. Die Gewichtung können Sie in zukünftigen Versionen individuell anpassen.",
    ],
  },
  {
    num: "02",
    title: "Wichtige Kennzahlen",
    paragraphs: [
      "Bruttorendite = (Jahreskaltmiete / Kaufpreis) × 100. Unter 4 % ist in den meisten Märkten zu wenig, über 6 % gilt als attraktiv.",
      "Kaufpreisfaktor = Kaufpreis / Jahreskaltmiete. Er zeigt, nach wie vielen Jahren sich der Kaufpreis durch Mieteinnahmen amortisiert. Unter 20 ist gut, über 25 teuer.",
      "Cashflow = Nettomieteinnahmen nach Abzug aller laufenden Kosten (Hausgeld, Instandhaltung, Verwaltung, Kreditrate). Positiver Cashflow ab dem ersten Monat ist das Ziel.",
      "Preis pro Quadratmeter: Vergleichen Sie diesen Wert mit dem lokalen Mietspiegel und den Bodenrichtwerten, um eine Über- oder Unterbewertung zu erkennen.",
    ],
  },
  {
    num: "03",
    title: "Sanierungen & Kosten",
    paragraphs: [
      "Typische Sanierungskosten: Dach (150–250 €/m²), Fenster (500–800 €/Stück), Heizung (8.000–15.000 €), Bad (8.000–15.000 €), Fassadendämmung (100–200 €/m²).",
      "Das GEG (Gebäudeenergiegesetz) schreibt bei Eigentümerwechsel bestimmte Nachrüstpflichten vor: Dämmung oberster Geschossdecke, Austausch alter Heizkessel (>30 Jahre), hydraulischer Abgleich.",
      "Sanierungen steigern den Wert überproportional: Eine Komplettsanierung kann den Wert um 20–40 % erhöhen und gleichzeitig die Energiekosten um bis zu 60 % senken.",
      "KfW-Förderung: Nutzen Sie zinsgünstige Darlehen und Tilgungszuschüsse der KfW für energetische Sanierungen (z. B. KfW 261/262).",
    ],
  },
  {
    num: "04",
    title: "Lageklassen erklärt",
    paragraphs: [
      "A-Lage: Innerstädtische Toplage, höchste Nachfrage, niedrigste Renditen (3–4 %), aber maximale Wertstabilität. Beispiel: München Innenstadt, Hamburg Eppendorf.",
      "B-Lage: Gute Wohnlagen mit solider Infrastruktur. Renditen 4–6 %, gutes Verhältnis von Risiko zu Ertrag. Ideal für Buy & Hold.",
      "C-Lage: Randlagen oder aufstrebende Viertel. Renditen 5–8 %, höheres Leerstandsrisiko, aber auch höheres Wertsteigerungspotenzial bei positiver Stadtentwicklung.",
      "D-Lage: Strukturschwache Gebiete, hohe Renditen (8–12 %), aber erhöhtes Leerstandsrisiko und eingeschränkte Verkäuflichkeit. Nur für erfahrene Investoren.",
    ],
  },
  {
    num: "05",
    title: "Finanzierung & Steuern",
    paragraphs: [
      "80 % Finanzierung (LTV) ist der Standardhebel. Bei guter Bonität und Objektqualität sind auch 90–100 % möglich, erhöhen aber das Risiko und die monatliche Belastung.",
      "Sondertilgungsrecht (5–10 % p.a.) ist essentiell, um die Gesamtzinsbelastung zu reduzieren und Flexibilität zu behalten.",
      "Spekulationsfrist: Gewinne aus dem Verkauf vermieteter Immobilien sind nach 10 Jahren Haltedauer komplett steuerfrei (§ 23 EStG).",
      "AfA (Absetzung für Abnutzung): 2 % p.a. für Gebäude ab 1925, 2,5 % für ältere Gebäude. Sanierungskosten können über §7h/§7i EStG beschleunigt abgeschrieben werden.",
      "Grunderwerbsteuer: Je nach Bundesland 3,5–6,5 % des Kaufpreises. Als Nebenkosten in der Renditeberechnung berücksichtigen.",
    ],
  },
  {
    num: "06",
    title: "Strukturen & Strategie",
    paragraphs: [
      "GmbH-Struktur: Ab ca. 3–5 Immobilien kann eine vermögensverwaltende GmbH steuerlich sinnvoll sein. Steuersatz auf Mieteinnahmen sinkt von bis zu 45 % (privat) auf ~15,8 % (GmbH).",
      "Achtung: Bei mehr als 3 Objektverkäufen in 5 Jahren droht gewerblicher Grundstückshandel (Drei-Objekt-Grenze). Planen Sie Ihre Exit-Strategie sorgfältig.",
      "Skalierung: Beginnen Sie mit einer soliden Buy & Hold-Immobilie, bauen Sie Track Record auf, und nutzen Sie den Wertzuwachs als Eigenkapital für die nächste Investition.",
      "Diversifikation: Streuen Sie über verschiedene Städte, Objekttypen (Wohnung, MFH, Gewerbe) und Strategien, um Klumpenrisiken zu minimieren.",
    ],
  },
] as const;

export default function GuidePage() {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(idx: number) {
    setOpen((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Wissensbereich</h1>
        <p className="text-sm mt-1" style={{ color: C.sub }}>
          Grundlagen, Kennzahlen und Strategien für erfolgreiche Immobilien-Investments.
        </p>
      </div>

      {/* Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOPICS.map((topic, idx) => {
          const isOpen = open === idx;
          return (
            <Card key={idx} className="overflow-hidden">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                style={{ background: isOpen ? C.surface2 : "transparent" }}
              >
                {/* Number badge */}
                <span
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                  style={{ background: C.accentDim, color: C.accent }}
                >
                  {topic.num}
                </span>

                {/* Title */}
                <span className="flex-1 text-sm font-bold" style={{ color: C.text }}>
                  {topic.title}
                </span>

                {/* Chevron */}
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.dim}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px" style={{ background: C.border }} />
                  {topic.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-xs leading-relaxed" style={{ color: C.sub }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
