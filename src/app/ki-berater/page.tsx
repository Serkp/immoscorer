"use client";

import { AIChat } from "@/components/AIChat";
import { C } from "@/lib/theme";

const SUGGESTED_QUESTIONS = [
  "Was ist eine gute Bruttorendite?",
  "Wie funktioniert die AfA bei Immobilien?",
  "Lohnt sich eine GmbH für Immobilien?",
  "Worauf muss ich bei einer Besichtigung achten?",
  "Wie verhandle ich den Kaufpreis?",
  "Was sind die Kaufnebenkosten?",
  "Wann lohnt sich ein Forward-Darlehen?",
  "Welche Versicherungen brauche ich als Vermieter?",
];

export default function KIBeraterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: C.text }}>
          KI-Berater
        </h1>
        <p className="text-sm md:text-base" style={{ color: C.sub }}>
          Ihr persönlicher Experte für Immobilien, Finanzierung, Steuern und Kapitalanlagen.
        </p>
      </div>

      {/* Chat */}
      <AIChat
        context={{ type: "general", data: null }}
        suggestedQuestions={SUGGESTED_QUESTIONS}
        title="Fragen Sie mich alles rund um Immobilien"
        subtitle="Von Renditeberechnung über Finanzierung bis hin zu Steuern und Strategien"
        defaultOpen
      />
    </div>
  );
}
