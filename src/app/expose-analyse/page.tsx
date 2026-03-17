"use client";

import { useState, useRef } from "react";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { C, scoreColor, scoreLabel } from "@/lib/theme";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

interface MarketingPhrase {
  phrase: string;
  realitaet: string;
}

interface Kategorie {
  name: string;
  score: number;
  bewertung: string;
  icon: string;
}

interface ExposeDaten {
  objektart: string;
  adresse: string;
  kaufpreis: string;
  wohnflaeche: string;
  zimmer: string;
  baujahr: string;
  energieklasse: string;
  kaltmiete: string;
  hausgeld: string;
  grundstueck: string;
  etage: string;
  provision: string;
}

interface AnalysisResult {
  zusammenfassung: string;
  score: number;
  extrahierte_daten: ExposeDaten;
  kategorien: Kategorie[];
  rote_flaggen: string[];
  fehlende_infos: string[];
  marketing_phrasen: MarketingPhrase[];
  handlungsempfehlungen: string[];
  fazit: string;
}

/* ═══════════════════════════════════════════════════════
   LOADING STEPS
   ═══════════════════════════════════════════════════════ */

const LOADING_STEPS = [
  { title: "Exposé einlesen", sub: "Text wird verarbeitet" },
  { title: "Daten extrahieren", sub: "Objektdaten identifizieren" },
  { title: "Marketing-Sprache analysieren", sub: "Formulierungen prüfen" },
  { title: "Risikobewertung", sub: "Rote Flaggen identifizieren" },
  { title: "Gesamtbewertung erstellen", sub: "Empfehlungen ableiten" },
];

/* ═══════════════════════════════════════════════════════
   EXAMPLE EXPOSE
   ═══════════════════════════════════════════════════════ */

const EXAMPLE_EXPOSE = `Charmante 3-Zimmer-Wohnung in begehrter Lage!

Objektbeschreibung:
Diese lichtdurchflutete Wohnung besticht durch ihren einzigartigen Charme und bietet Ihnen ein Wohnerlebnis der besonderen Art. Die großzügige Raumaufteilung mit offenem Wohnkonzept lädt zum Wohlfühlen ein.

Eckdaten:
- Wohnfläche: ca. 78 m²
- Zimmer: 3
- Etage: 2. OG (ohne Aufzug)
- Baujahr: 1965
- Kaufpreis: 285.000 €
- Hausgeld: 320 €/Monat
- Provision: 3,57% inkl. MwSt.

Ausstattung:
Das Badezimmer wurde vor einigen Jahren teilrenoviert. Die Küche ist im Preis nicht inbegriffen. Die Wohnung wird im renovierungsbedürftigen Zustand verkauft — ideal für Käufer mit Gestaltungswillen! Die Fenster sind original aus dem Baujahr.

Lage:
Die Wohnung befindet sich in einer aufstrebenden Gegend mit guter Verkehrsanbindung. Einkaufsmöglichkeiten und Schulen befinden sich in der Nähe.

Energieausweis:
Energiebedarfsausweis, Endenergiebedarf: 185 kWh/(m²·a), Energieeffizienzklasse F

Sonstiges:
Ein Kellerabteil gehört zur Wohnung. Die Eigentümergemeinschaft plant in den kommenden Jahren eine Fassadensanierung.`;

/* ═══════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════ */

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    case "clipboard":
      return <svg {...props}><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
    case "eye":
      return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
    case "trending":
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    case "alert":
      return <svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

/* ═══════════════════════════════════════════════════════
   SCORE RING (inline for this page)
   ═══════════════════════════════════════════════════════ */

function ExposeScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] font-medium" style={{ color: C.sub }}>{scoreLabel(score)}</span>
      </div>
    </div>
  );
}

function MiniScoreBar({ score, label }: { score: number; label: string }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium w-36 shrink-0" style={{ color: C.sub }}>{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color, transition: "width 1s ease-out" }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function ExposeAnalysePage() {
  const [exposeText, setExposeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleAnalyze() {
    if (exposeText.trim().length < 50) {
      setError("Bitte fügen Sie einen Exposé-Text mit mindestens 50 Zeichen ein.");
      return;
    }

    setError("");
    setResult(null);
    setLoading(true);
    setLoadingStep(0);

    // Simulate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => {
        if (s >= LOADING_STEPS.length - 1) {
          clearInterval(stepInterval);
          return s;
        }
        return s + 1;
      });
    }, 2500);

    try {
      const res = await fetch("/api/ai-expose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exposeText }),
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Ein Fehler ist aufgetreten.");
        setLoading(false);
        return;
      }

      setResult(data.analysis);
    } catch {
      clearInterval(stepInterval);
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setExposeText("");
    setError("");
    textareaRef.current?.focus();
  }

  function handleLoadExample() {
    setExposeText(EXAMPLE_EXPOSE);
    setError("");
  }

  /* ─── Input View ─── */
  if (!result && !loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <AIOrb size={32} active />
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.text }}>
              KI Exposé-Analyse
            </h1>
          </div>
          <p className="text-sm md:text-base max-w-2xl mx-auto" style={{ color: C.sub }}>
            Lassen Sie Immobilien-Exposés von unserer KI kritisch analysieren.
            Erkennen Sie Marketing-Sprache, Risiken und fehlende Informationen.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold" style={{ color: C.text }}>
                Exposé-Text einfügen
              </label>
              <button
                onClick={handleLoadExample}
                className="text-[11px] font-medium px-3 py-1 rounded-full transition-all"
                style={{ color: C.accent, background: C.accentDim, border: `1px solid rgba(124,106,255,0.2)` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.accentMid; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.accentDim; }}
              >
                Beispiel laden
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={exposeText}
              onChange={(e) => { setExposeText(e.target.value); setError(""); }}
              placeholder="Kopieren Sie hier den vollständigen Text eines Immobilien-Exposés ein...

Tipp: Je mehr Informationen das Exposé enthält, desto detaillierter wird die Analyse."
              className="w-full rounded-xl p-4 text-sm resize-none focus:outline-none transition-all"
              style={{
                background: C.surface,
                color: C.text,
                border: `1px solid ${error ? C.red : C.border}`,
                minHeight: 280,
              }}
              onFocus={(e) => { e.target.style.borderColor = error ? C.red : C.accent; }}
              onBlur={(e) => { e.target.style.borderColor = error ? C.red : C.border; }}
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px]" style={{ color: exposeText.length < 50 ? C.dim : C.sub }}>
                {exposeText.length} Zeichen {exposeText.length < 50 ? "(min. 50)" : ""}
              </span>
              {error && (
                <span className="text-[11px] font-medium" style={{ color: C.red }}>{error}</span>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={exposeText.trim().length < 50}
              className="w-full mt-4 h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
              style={{
                background: exposeText.trim().length >= 50 ? C.accent : C.surface2,
                color: exposeText.trim().length >= 50 ? "#fff" : C.dim,
                cursor: exposeText.trim().length >= 50 ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (exposeText.trim().length >= 50) e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Exposé analysieren
            </button>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { title: "Marketing entlarven", desc: "Beschönigende Formulierungen erkennen und richtig einordnen", icon: "search" },
            { title: "Risiken erkennen", desc: "Versteckte Kosten, Sanierungsbedarf und Warnsignale aufdecken", icon: "alert" },
            { title: "Vollständigkeit prüfen", desc: "Fehlende Informationen identifizieren, die Sie nachfragen sollten", icon: "clipboard" },
          ].map((f) => (
            <Card key={f.title}>
              <div className="p-4 flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.accentDim }}>
                  <CategoryIcon icon={f.icon} color={C.accent} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{f.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Loading View ─── */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center">
          <AIOrb size={48} active />
          <h2 className="text-lg font-bold mt-6 mb-2" style={{ color: C.text }}>Exposé wird analysiert...</h2>
          <p className="text-sm mb-8" style={{ color: C.sub }}>Unsere KI prüft das Exposé auf Herz und Nieren</p>

          <div className="w-full space-y-3">
            {LOADING_STEPS.map((step, i) => {
              const done = i < loadingStep;
              const active = i === loadingStep;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: active ? C.surface2 : done ? C.surface : "transparent",
                    border: `1px solid ${active ? C.accent : done ? C.border : "transparent"}`,
                    opacity: done || active ? 1 : 0.4,
                  }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: done ? C.green : active ? C.accent : C.surface2,
                      transition: "background 0.3s",
                    }}
                  >
                    {done ? (
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : active ? (
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: C.dim }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: done || active ? C.text : C.dim }}>{step.title}</p>
                    <p className="text-[11px]" style={{ color: C.sub }}>{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Result View ─── */
  if (!result) return null;

  const daten = result.extrahierte_daten;
  const datenEntries = [
    { label: "Objektart", value: daten.objektart },
    { label: "Adresse", value: daten.adresse },
    { label: "Kaufpreis", value: daten.kaufpreis },
    { label: "Wohnfläche", value: daten.wohnflaeche },
    { label: "Zimmer", value: daten.zimmer },
    { label: "Baujahr", value: daten.baujahr },
    { label: "Energieklasse", value: daten.energieklasse },
    { label: "Kaltmiete", value: daten.kaltmiete },
    { label: "Hausgeld", value: daten.hausgeld },
    { label: "Grundstück", value: daten.grundstueck },
    { label: "Etage", value: daten.etage },
    { label: "Provision", value: daten.provision },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header + Score */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <ExposeScoreRing score={result.score} />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Exposé-Analyse</h1>
          <p className="text-sm leading-relaxed" style={{ color: C.sub }}>{result.zusammenfassung}</p>
          <button
            onClick={handleReset}
            className="mt-3 text-[12px] font-medium px-4 py-1.5 rounded-full transition-all"
            style={{ color: C.accent, background: C.accentDim, border: `1px solid rgba(124,106,255,0.2)` }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.accentMid; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.accentDim; }}
          >
            Neues Exposé analysieren
          </button>
        </div>
      </div>

      {/* Kategorie-Scores */}
      <Card>
        <div className="p-5">
          <h2 className="text-sm font-bold mb-4" style={{ color: C.text }}>Bewertungskategorien</h2>
          <div className="space-y-3">
            {result.kategorien.map((kat) => (
              <MiniScoreBar key={kat.name} score={kat.score} label={kat.name} />
            ))}
          </div>
        </div>
      </Card>

      {/* Kategorie Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {result.kategorien.map((kat) => (
          <Card key={kat.name}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon icon={kat.icon} color={scoreColor(kat.score)} />
                <span className="text-sm font-semibold" style={{ color: C.text }}>{kat.name}</span>
                <span className="ml-auto text-xs font-bold" style={{ color: scoreColor(kat.score) }}>{kat.score}/100</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{kat.bewertung}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Extrahierte Daten */}
      <Card>
        <div className="p-5 mt-4">
          <h2 className="text-sm font-bold mb-4" style={{ color: C.text }}>Extrahierte Objektdaten</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {datenEntries.map((d) => (
              <div key={d.label} className="rounded-lg p-3" style={{ background: C.surface }}>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: C.dim }}>{d.label}</p>
                <p className="text-xs font-semibold" style={{ color: d.value === "Nicht angegeben" ? C.amber : C.text }}>
                  {d.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Rote Flaggen */}
      {result.rote_flaggen.length > 0 && (
        <Card>
          <div className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-sm font-bold" style={{ color: C.red }}>Rote Flaggen</h2>
            </div>
            <div className="space-y-2">
              {result.rote_flaggen.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-3" style={{ background: C.redDim, border: `1px solid rgba(248,113,113,0.15)` }}>
                  <span className="text-xs mt-0.5" style={{ color: C.red }}>!</span>
                  <p className="text-xs leading-relaxed" style={{ color: C.text }}>{flag}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Fehlende Infos */}
      {result.fehlende_infos.length > 0 && (
        <Card>
          <div className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <h2 className="text-sm font-bold" style={{ color: C.amber }}>Fehlende Informationen</h2>
            </div>
            <div className="space-y-2">
              {result.fehlende_infos.map((info, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-3" style={{ background: C.amberDim, border: `1px solid ${C.amberBorder}` }}>
                  <span className="text-xs mt-0.5" style={{ color: C.amber }}>?</span>
                  <p className="text-xs leading-relaxed" style={{ color: C.text }}>{info}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Marketing vs Realität */}
      {result.marketing_phrasen.length > 0 && (
        <Card>
          <div className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h2 className="text-sm font-bold" style={{ color: C.cyan }}>Marketing vs. Realität</h2>
            </div>
            <div className="space-y-3">
              {result.marketing_phrasen.map((mp, i) => (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                  <div className="px-4 py-2.5" style={{ background: C.surface2 }}>
                    <p className="text-xs font-medium italic" style={{ color: C.text }}>
                      &ldquo;{mp.phrase}&rdquo;
                    </p>
                  </div>
                  <div className="px-4 py-2.5" style={{ background: C.surface }}>
                    <p className="text-xs leading-relaxed" style={{ color: C.sub }}>
                      <span style={{ color: C.cyan, fontWeight: 600 }}>Realität: </span>
                      {mp.realitaet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Handlungsempfehlungen */}
      {result.handlungsempfehlungen.length > 0 && (
        <Card>
          <div className="p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <h2 className="text-sm font-bold" style={{ color: C.green }}>Handlungsempfehlungen</h2>
            </div>
            <div className="space-y-2">
              {result.handlungsempfehlungen.map((emp, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
                  <span className="text-xs font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.green, color: "#000" }}>
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: C.text }}>{emp}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Fazit */}
      <Card>
        <div className="p-5 mt-4" style={{ background: `linear-gradient(135deg, rgba(124,106,255,0.08), rgba(0,212,255,0.05))` }}>
          <div className="flex items-center gap-2 mb-3">
            <AIOrb size={20} active />
            <h2 className="text-sm font-bold" style={{ color: C.text }}>Fazit</h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.sub }}>{result.fazit}</p>
        </div>
      </Card>

      {/* Action */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleReset}
          className="h-11 px-6 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          style={{ background: C.accent, color: "#fff" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          Neues Exposé analysieren
        </button>
      </div>
    </div>
  );
}
