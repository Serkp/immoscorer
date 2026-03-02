"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { C } from "@/lib/theme";

/* ─── Types ─── */

export interface AIAdvisorData {
  address: string;
  city: string;
  propertyType: string;
  apartmentType?: string;
  rooms?: string;
  area: number;
  buildingYear: number;
  energyClass: string;
  purchasePrice: number;
  monthlyRent: number;
  managementFee: number;
  renovations: string[];
  renovationCosts?: number;
  effectivePrice?: number;
  totalScore: number;
  investmentScore: number;
  rentabilityScore: number;
  riskScore: number;
  financingScore: number;
  futureScore: number;
  energyScore: number;
  grossYield: string;
  netYield: string;
  priceFactor: string;
  locationGrade: string;
  vacancyRate?: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

/* ─── Offline / Fallback Advice ─── */

function getOfflineAdvice(question: string, d: AIAdvisorData): string {
  const q = question.toLowerCase();
  const city = d.city || "dieser Stadt";
  const pricePerSqm = d.area > 0 ? Math.round(d.purchasePrice / d.area) : 0;
  const rentPerSqm = d.area > 0 ? (d.monthlyRent / d.area).toFixed(2) : "0";

  if (q.includes("besichtigung") || q.includes("beachten")) {
    let advice = `Bei diesem Objekt (Bj. ${d.buildingYear}) in ${city} sollten Sie besonders auf folgende Punkte achten:\n\n`;
    if (d.buildingYear < 1970)
      advice += "- Zustand der Elektrik und Wasserleitungen (oft noch Originalleitungen)\n";
    if (d.buildingYear < 1995)
      advice += "- Fensterzustand und Wärmedämmung prüfen\n";
    if (d.energyClass >= "E")
      advice += `- Energieklasse ${d.energyClass}: Heizungsanlage und Dämmung genau inspizieren\n`;
    if (d.renovations.length > 0)
      advice += `- Sanierungsbedarf (${d.renovations.join(", ")}): Lassen Sie einen Gutachter die tatsächlichen Kosten schätzen\n`;
    advice += "- Protokolle der letzten 3 Eigentümerversammlungen anfordern\n";
    advice += "- Instandhaltungsrücklage und geplante Sonderumlagen erfragen";
    return advice;
  }

  if (q.includes("verhandl") || q.includes("kaufpreis")) {
    let advice = `Der aktuelle Kaufpreis liegt bei ${pricePerSqm} €/m². `;
    if (d.renovations.length > 0 && d.renovationCosts) {
      advice += `Mit geschätzten Sanierungskosten von ${d.renovationCosts.toLocaleString("de-DE")} € ergibt sich ein effektiver Preis von ${d.effectivePrice?.toLocaleString("de-DE")} €. `;
      advice += "Nutzen Sie den Sanierungsbedarf als Verhandlungsargument — Verkäufer akzeptieren oft 5-10% Nachlass bei offensichtlichem Renovierungsstau.\n\n";
    }
    if (d.totalScore < 50) {
      advice += `Der Score von ${d.totalScore}/100 deutet auf Schwächen hin. Fordern Sie mindestens 10-15% Nachlass.`;
    } else if (d.totalScore < 70) {
      advice += `Bei einem Score von ${d.totalScore}/100 ist ein Verhandlungsspielraum von 5-8% realistisch.`;
    } else {
      advice += `Bei einem guten Score von ${d.totalScore}/100 ist der Preis grundsätzlich angemessen, aber 3-5% Nachlass sind fast immer möglich.`;
    }
    return advice;
  }

  if (q.includes("sanierung") || q.includes("renovierung")) {
    if (d.renovations.length === 0) {
      return `Für dieses Objekt wurde kein Sanierungsbedarf angegeben. Bei einem Baujahr von ${d.buildingYear} sollten Sie dennoch den Zustand bei der Besichtigung prüfen. Holen Sie im Zweifel einen Sachverständigen hinzu.`;
    }
    const costs = d.renovationCosts?.toLocaleString("de-DE") || "unbekannt";
    return `Die geschätzten Sanierungskosten betragen ca. ${costs} €. Betroffen: ${d.renovations.join(", ")}.\n\nBei einem Kaufpreis von ${d.purchasePrice.toLocaleString("de-DE")} € und einem effektiven Gesamtpreis von ${d.effectivePrice?.toLocaleString("de-DE")} € (${d.effectivePrice && d.area > 0 ? Math.round(d.effectivePrice / d.area) : "?"} €/m²) sollten Sie die Sanierung einpreisen.\n\nWichtig: Dies sind Schätzwerte. Holen Sie vor dem Kauf konkrete Handwerker-Angebote ein, besonders für ${d.renovations[0]}.`;
  }

  if (q.includes("rendite") || q.includes("yield")) {
    const gy = parseFloat(d.grossYield);
    let advice = `Die Bruttorendite beträgt ${d.grossYield}%, die Nettorendite ${d.netYield}%. `;
    if (gy > 8) {
      advice += "Eine Rendite über 8% ist ungewöhnlich hoch. Prüfen Sie, ob die Miete nachhaltig erzielbar ist und ob versteckte Risiken bestehen (Leerstand, Zustand, Lage).";
    } else if (gy > 5) {
      advice += "Das ist eine solide Rendite für den aktuellen Markt. Achten Sie darauf, dass die Miete dem Mietspiegel entspricht.";
    } else if (gy > 3) {
      advice += "Die Rendite liegt im unteren Bereich. Das Investment lohnt sich nur, wenn Sie auf Wertsteigerung setzen und die Lage das hergibt.";
    } else {
      advice += "Bei unter 3% Bruttorendite ist das Investment aus reiner Rendite-Perspektive nicht attraktiv. Prüfen Sie Alternativen.";
    }
    return advice;
  }

  if (q.includes("score") && (q.includes("niedrig") || q.includes("schlecht"))) {
    const weak = [];
    if (d.investmentScore < 50) weak.push(`Investition (${d.investmentScore})`);
    if (d.rentabilityScore < 50) weak.push(`Vermietbarkeit (${d.rentabilityScore})`);
    if (d.riskScore < 50) weak.push(`Risiko (${d.riskScore})`);
    if (d.financingScore < 50) weak.push(`Finanzierung (${d.financingScore})`);
    if (d.futureScore < 50) weak.push(`Zukunft (${d.futureScore})`);
    if (d.energyScore < 50) weak.push(`Energie (${d.energyScore})`);
    return `Der Gesamt-Score von ${d.totalScore}/100 ist ${d.totalScore < 35 ? "kritisch" : "unterdurchschnittlich"}. Die schwächsten Teilscores: ${weak.join(", ") || "keiner unter 50"}.\n\nEmpfehlung: Prüfen Sie, ob der Kaufpreis deutlich reduziert werden kann, oder ob ein anderes Objekt bessere Konditionen bietet.`;
  }

  if (q.includes("leerstand") || q.includes("vacancy")) {
    const vr = d.vacancyRate;
    if (vr !== undefined) {
      return `Die Leerstandsquote in ${city} liegt bei ${vr}%. ${vr > 5 ? "Das ist erhöht und stellt ein Risiko dar. Rechnen Sie mit möglichen Mietausfällen." : vr > 3 ? "Das ist moderat. Achten Sie auf die Mikrolage und die Nachfrage im direkten Umfeld." : "Das ist niedrig — gute Voraussetzungen für stabile Mieteinnahmen."}`;
    }
    return `Leider liegen keine konkreten Leerstandsdaten für ${city} vor. Prüfen Sie die Situation vor Ort und fragen Sie den Verwalter nach der Vermietungshistorie.`;
  }

  if (q.includes("finanzierung") || q.includes("kredit") || q.includes("bank")) {
    return `Bei einem Kaufpreis von ${d.purchasePrice.toLocaleString("de-DE")} € und einer Kaltmiete von ${d.monthlyRent.toLocaleString("de-DE")} €/Monat (Bruttorendite ${d.grossYield}%) sollten Sie verschiedene Finanzierungsoptionen vergleichen.\n\nDer Finanzierungs-Score liegt bei ${d.financingScore}/100. ${d.financingScore < 50 ? "Die Bankkonditionen könnten schwierig werden — mehr Eigenkapital verbessert Ihre Position." : "Grundsätzlich gute Voraussetzungen für eine Finanzierung."}\n\nNutzen Sie die kostenlose Finanzierungsberatung von ImmoScorer für ein individuelles Angebot.`;
  }

  if (q.includes("kaufen") || q.includes("investment") || q.includes("empfehlung")) {
    const label =
      d.totalScore >= 75 ? "gut" : d.totalScore >= 50 ? "akzeptabel" : "kritisch";
    return `Das Objekt in ${city} erhält einen Score von ${d.totalScore}/100 — das ist ${label}.\n\nStärken: Miete ${rentPerSqm} €/m², ${d.renovations.length === 0 ? "kein Sanierungsbedarf" : `Sanierungsbedarf (${d.renovations.join(", ")})`}.\n\n${d.totalScore >= 65 ? "Das Objekt kann sich als Kapitalanlage eignen, sofern die Zahlen bei der Besichtigung bestätigt werden." : d.totalScore >= 45 ? "Das Objekt hat Schwächen. Nur kaufen, wenn der Preis deutlich verhandelt werden kann." : "Von diesem Investment rate ich bei den aktuellen Konditionen ab. Suchen Sie nach Alternativen."}\n\nFür eine persönliche Einschätzung nutzen Sie unsere kostenlose Finanzierungsberatung.`;
  }

  if (q.includes("hausgeld") || q.includes("nebenkosten")) {
    const hgPerSqm = d.area > 0 ? (d.managementFee / d.area).toFixed(2) : "?";
    const ratio = d.monthlyRent > 0 ? ((d.managementFee / d.monthlyRent) * 100).toFixed(0) : "?";
    return `Das Hausgeld beträgt ${d.managementFee.toLocaleString("de-DE")} €/Monat (${hgPerSqm} €/m²). Das entspricht ${ratio}% der Kaltmiete.\n\n${Number(ratio) > 35 ? "Das ist überdurchschnittlich hoch. Prüfen Sie die Hausgeld-Abrechnung auf Sonderumlagen und ineffiziente Kostenstrukturen." : Number(ratio) > 25 ? "Das liegt im normalen Bereich für eine Eigentumswohnung." : "Das ist vergleichsweise günstig."}`;
  }

  if (q.includes("förder") || q.includes("kfw") || q.includes("energetisch")) {
    return `Bei Energieklasse ${d.energyClass} ${["E", "F", "G", "H"].includes(d.energyClass) ? "besteht dringender Handlungsbedarf bezüglich des GEG (Gebäudeenergiegesetz). Prüfen Sie KfW-Förderprogramme für die energetische Sanierung — insbesondere KfW 261/262 für Einzelmaßnahmen oder KfW 261 für Komplettsanierung zum Effizienzhaus." : "ist die energetische Situation akzeptabel. Dennoch können KfW-Förderprogramme für Einzelmaßnahmen wie Heizungstausch oder Dämmung attraktiv sein."}\n\nWichtig: Förderanträge müssen VOR Beginn der Maßnahme gestellt werden. Lassen Sie sich vorab von einem Energieberater beraten.`;
  }

  // Default
  return `Für dieses Objekt in ${city} (Score: ${d.totalScore}/100, Bruttorendite: ${d.grossYield}%, Kaufpreis: ${d.purchasePrice.toLocaleString("de-DE")} €) kann ich Ihnen folgende Themen beantworten: Besichtigung, Verhandlung, Sanierung, Rendite, Finanzierung, Hausgeld und Marktvergleich.\n\nStellen Sie mir eine spezifische Frage zu diesem Objekt.`;
}

/* ─── Dynamic Suggestions ─── */

function getSuggestions(d: AIAdvisorData): string[] {
  const suggestions: string[] = [
    "Was sollte ich bei der Besichtigung beachten?",
    "Wie kann ich den Kaufpreis verhandeln?",
  ];

  const gy = parseFloat(d.grossYield);

  if (d.renovations.length > 0)
    suggestions.push("Lohnt sich die Sanierung bei diesem Preis?");
  if (d.totalScore < 50)
    suggestions.push("Sollte ich von diesem Investment Abstand nehmen?");
  if (d.totalScore > 75)
    suggestions.push("Was sind die versteckten Risiken trotz gutem Score?");
  if (["E", "F", "G", "H"].includes(d.energyClass))
    suggestions.push("Welche Fördermittel gibt es für die energetische Sanierung?");
  if (d.propertyType === "mfh")
    suggestions.push("Worauf muss ich bei einem MFH besonders achten?");
  if (gy > 8)
    suggestions.push("Warum ist die Rendite so hoch — gibt es einen Haken?");
  if (gy < 3 && gy > 0)
    suggestions.push("Macht dieses Investment bei dieser Rendite überhaupt Sinn?");
  if (d.vacancyRate !== undefined && d.vacancyRate > 3)
    suggestions.push("Wie hoch ist das Leerstandsrisiko in dieser Stadt?");
  if (d.financingScore < 50)
    suggestions.push("Wie bekomme ich trotzdem eine gute Finanzierung?");
  if (d.managementFee > 0 && d.monthlyRent > 0 && d.managementFee / d.monthlyRent > 0.35)
    suggestions.push("Ist das Hausgeld normal oder zu hoch?");

  return suggestions.slice(0, 4);
}

/* ─── Component ─── */

export function AIAdvisor({ analysisData }: { analysisData: AIAdvisorData }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const suggestions = getSuggestions(analysisData);

  // Auto-scroll on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isLoading) return;
      setError(null);
      setSuggestionsVisible(false);
      setIsLoading(true);

      const userMsg: Message = { role: "user", content: question.trim() };
      const updated = [...messages, userMsg].slice(-10);
      setMessages(updated);
      setInputValue("");

      // Build conversation history for API (exclude the current question)
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch("/api/ai-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.trim(),
            analysisData,
            conversationHistory,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.status === 503) {
          // No API key — use offline fallback
          const fallback = getOfflineAdvice(question, analysisData);
          setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
          setIsLoading(false);
          return;
        }

        if (res.status === 429) {
          setError("Zu viele Anfragen. Bitte warten Sie einen Moment.");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.answer || "Keine Antwort erhalten." },
          ]);
        }
      } catch (err: unknown) {
        clearTimeout(timeout);
        if (err instanceof DOMException && err.name === "AbortError") {
          setError("Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.");
        } else {
          // Network error — use offline fallback
          const fallback = getOfflineAdvice(question, analysisData);
          setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
        }
      }
      setIsLoading(false);
    },
    [isLoading, messages, analysisData],
  );

  return (
    <div
      className="rounded-2xl overflow-hidden mt-6 transition-all"
      style={{
        background: C.surface2,
        border: "1px solid transparent",
        backgroundClip: "padding-box",
        boxShadow: `inset 0 0 0 1px ${C.border}`,
        backgroundImage: `linear-gradient(${C.surface2}, ${C.surface2}), linear-gradient(135deg, rgba(124,106,255,0.3), rgba(76,154,255,0.3))`,
        backgroundOrigin: "border-box",
      }}
    >
      {/* ── Header (always visible) ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center gap-3 text-left transition-colors"
        style={{ background: "transparent" }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: C.accentDim }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>
            KI-Investitionsberater
          </h3>
          <p className="text-[11px]" style={{ color: C.dim }}>
            Objektbezogene Beratung basierend auf Ihrer Analyse.
          </p>
        </div>
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.dim}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Collapsible Content ── */}
      <div
        ref={contentRef}
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? "700px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {/* ── Suggestions ── */}
          {suggestionsVisible && (
            <div className="px-5 py-3 flex flex-wrap gap-2">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setIsOpen(true);
                    sendMessage(q);
                  }}
                  disabled={isLoading}
                  className="rounded-full px-3.5 py-2 text-[11px] font-medium transition-all disabled:opacity-40"
                  style={{
                    background: "transparent",
                    color: C.sub,
                    border: `1px solid ${C.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.color = C.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.sub;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── Chat Messages ── */}
          {(messages.length > 0 || isLoading) && (
            <div
              ref={chatRef}
              className="px-5 py-3 space-y-3 overflow-y-auto"
              style={{
                maxHeight: "400px",
                borderTop: suggestionsVisible ? `1px solid ${C.border}` : undefined,
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start gap-2 max-w-[85%]">
                    {msg.role === "assistant" && (
                      <span className="mt-1 text-sm shrink-0">🤖</span>
                    )}
                    <div
                      className="rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap"
                      style={{
                        background:
                          msg.role === "user" ? C.accentDim : C.surface3,
                        color: msg.role === "user" ? C.accent : C.text,
                        border: `1px solid ${msg.role === "user" ? "rgba(124,106,255,0.2)" : C.border}`,
                      }}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <span className="mt-1 text-sm shrink-0">👤</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 text-sm shrink-0">🤖</span>
                    <div
                      className="rounded-xl px-4 py-3 flex items-center gap-1.5"
                      style={{
                        background: C.surface3,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: C.accent, animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: C.accent, animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: C.accent, animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Error message ── */}
          {error && (
            <div className="px-5 py-2">
              <div
                className="rounded-lg px-3 py-2 flex items-center justify-between text-xs"
                style={{ background: C.redDim, color: C.red, border: `1px solid rgba(248,113,113,0.2)` }}
              >
                <span>{error}</span>
                <button
                  onClick={() => {
                    setError(null);
                    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
                      const lastQ = messages[messages.length - 1].content;
                      setMessages((prev) => prev.slice(0, -1));
                      sendMessage(lastQ);
                    }
                  }}
                  className="ml-3 font-bold underline shrink-0"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          )}

          {/* ── Input ── */}
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
              placeholder="Ihre Frage zu diesem Objekt..."
              disabled={isLoading}
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 disabled:opacity-50"
              style={{
                background: C.bg2,
                border: `1px solid ${C.border}`,
                color: C.text,
              }}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-30 flex items-center gap-1.5 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                color: "#fff",
              }}
            >
              Senden
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
