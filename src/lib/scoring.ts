import { EnergyClass, LocationGrade, Renovations } from "./types";

/* ═══════════════════════════════════════════════════
   Public types
   ═══════════════════════════════════════════════════ */

export interface Subscore {
  label: string;
  value: number;  // 0-100
  weight: number; // fraction, all weights sum to 1
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface CategorizedRecommendations {
  financing: string[];
  technical: string[];
  legal: string[];
  strategy: string[];
}

export interface ComparisonMetrics {
  yield: number;            // gross yield as decimal, e.g. 0.056
  factor: number;           // rent multiplier, e.g. 22.1
  renovationCount: number;  // 0-6
  energyRank: number;       // 0-100 from energy class
  bankScore: number;        // 0-100 bankability subscore
  riskLevel: number;        // 0-100 risk subscore (higher = safer)
}

export interface ScoringResult {
  totalScore: number;
  confidenceLevel: ConfidenceLevel;
  subscores: {
    investmentScore: Subscore;
    rentabilityScore: Subscore;
    riskScore: Subscore;
    energyScore: Subscore;
    bankabilityScore: Subscore;
    projectionScore: Subscore;
  };
  explanation: string;
  strengths: string[];
  risks: string[];
  recommendations: CategorizedRecommendations;
  comparisonMetrics: ComparisonMetrics;
}

export interface ScoringInput {
  purchasePrice: number;
  monthlyRent: number;
  housegeld: number;
  baujahr: number;
  energyClass: EnergyClass;
  areaSqm: number;
  locationGrade: LocationGrade;
  renovations: Renovations;
}

/* ─── Weights (sum = 1.00) ─── */

const WEIGHTS = {
  investment:   0.30,
  rentability:  0.15,
  risk:         0.15,
  bankability:  0.15,
  energy:       0.10,
  projection:   0.15,
} as const;

/* ─── Lookup tables ─── */

const ENERGY_RANK: Record<EnergyClass, number> = {
  "A+": 100, A: 88, B: 76, C: 62, D: 48, E: 35, F: 22, G: 12, H: 5,
};

const ENERGY_LABEL: Record<EnergyClass, string> = {
  "A+": "hervorragend", A: "sehr gut", B: "gut", C: "akzeptabel",
  D: "unterdurchschnittlich", E: "schwach", F: "sehr schwach", G: "kritisch", H: "ungen\u00FCgend",
};

const LOCATION_RANK: Record<LocationGrade, number> = { A: 100, B: 72, C: 45, D: 20 };
const LOCATION_LABEL: Record<LocationGrade, string> = {
  A: "Top-Lage", B: "gute Lage", C: "durchschnittliche Lage", D: "Entwicklungslage",
};

/* ─── Renovation labels ─── */

const RENO_LABEL: Record<keyof Renovations, string> = {
  roof: "Dach", facade: "Fassade", windows: "Fenster",
  bathroom: "Bad", electrical: "Elektrik", heating: "Heizung",
};

/* ─── Helpers ─── */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

type Metrics = ReturnType<typeof deriveMetrics>;

function deriveMetrics(p: ScoringInput) {
  const annualRent = p.monthlyRent * 12;
  const grossYield = annualRent / p.purchasePrice;
  const netRent = p.monthlyRent - p.housegeld;
  const netYield = (netRent * 12) / p.purchasePrice;
  const rentMultiplier = p.purchasePrice / annualRent;
  const pricePerSqm = p.purchasePrice / p.areaSqm;
  const hausgeldRatio = p.housegeld / p.monthlyRent;
  const age = new Date().getFullYear() - p.baujahr;
  const renoCount = Object.values(p.renovations).filter(Boolean).length;
  const renoKeys = (Object.entries(p.renovations) as [keyof Renovations, boolean][])
    .filter(([, v]) => v)
    .map(([k]) => k);

  return {
    annualRent, grossYield, netRent, netYield,
    rentMultiplier, pricePerSqm, hausgeldRatio,
    age, renoCount, renoKeys,
  };
}

/* ═══════════════════════════════════════════════════
   1. Investment Score (30%)
   ═══════════════════════════════════════════════════ */

function calcInvestmentScore(_p: ScoringInput, m: Metrics): number {
  let s = 0;

  if (m.grossYield >= 0.08) s += 40;
  else if (m.grossYield >= 0.06) s += 32;
  else if (m.grossYield >= 0.05) s += 24;
  else if (m.grossYield >= 0.04) s += 16;
  else if (m.grossYield >= 0.03) s += 8;
  else s += 2;

  if (m.rentMultiplier <= 15) s += 30;
  else if (m.rentMultiplier <= 20) s += 24;
  else if (m.rentMultiplier <= 25) s += 16;
  else if (m.rentMultiplier <= 30) s += 8;
  else s += 2;

  if (m.pricePerSqm <= 1500) s += 30;
  else if (m.pricePerSqm <= 2500) s += 24;
  else if (m.pricePerSqm <= 3500) s += 18;
  else if (m.pricePerSqm <= 5000) s += 10;
  else s += 3;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   2. Rentability Score (15%)
   ═══════════════════════════════════════════════════ */

function calcRentabilityScore(_p: ScoringInput, m: Metrics): number {
  let s = 0;

  if (m.netYield >= 0.05) s += 40;
  else if (m.netYield >= 0.04) s += 32;
  else if (m.netYield >= 0.03) s += 24;
  else if (m.netYield >= 0.02) s += 14;
  else if (m.netYield >= 0.01) s += 6;
  else s += 0;

  if (m.hausgeldRatio <= 0.15) s += 30;
  else if (m.hausgeldRatio <= 0.25) s += 24;
  else if (m.hausgeldRatio <= 0.35) s += 16;
  else if (m.hausgeldRatio <= 0.50) s += 8;
  else s += 0;

  if (m.netRent >= 600) s += 30;
  else if (m.netRent >= 400) s += 24;
  else if (m.netRent >= 200) s += 16;
  else if (m.netRent >= 0) s += 8;
  else s += 0;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   3. Risk Score (15%)
   ═══════════════════════════════════════════════════ */

function calcRiskScore(p: ScoringInput, m: Metrics): number {
  let s = 100;

  s -= m.renoCount * 12;

  if (m.age >= 80) s -= 20;
  else if (m.age >= 60) s -= 14;
  else if (m.age >= 40) s -= 8;
  else if (m.age >= 20) s -= 3;

  if (p.locationGrade === "D") s -= 15;
  else if (p.locationGrade === "C") s -= 7;

  if (m.hausgeldRatio >= 0.6) s -= 10;
  else if (m.hausgeldRatio >= 0.45) s -= 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   4. Energy Score (10%)
   ═══════════════════════════════════════════════════ */

function calcEnergyScore(p: ScoringInput, m: Metrics): number {
  let s = ENERGY_RANK[p.energyClass];

  if (m.age <= 10) s += 10;
  else if (m.age <= 25) s += 5;

  if (p.renovations.heating && ENERGY_RANK[p.energyClass] < 50) s -= 10;

  if (!p.renovations.facade && !p.renovations.windows) s += 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   5. Bankability Score (15%)
   ═══════════════════════════════════════════════════ */

function calcBankabilityScore(p: ScoringInput, m: Metrics): number {
  let s = 0;

  s += (LOCATION_RANK[p.locationGrade] / 100) * 30;

  if (m.grossYield >= 0.05) s += 25;
  else if (m.grossYield >= 0.04) s += 18;
  else if (m.grossYield >= 0.03) s += 10;
  else s += 3;

  s += Math.max(0, 25 - m.renoCount * 5);

  s += (ENERGY_RANK[p.energyClass] / 100) * 20;

  return clamp(Math.round(s));
}

/* ═══════════════════════════════════════════════════
   6. Projection Score (15%)
   ═══════════════════════════════════════════════════ */

function calcProjectionScore(p: ScoringInput, m: Metrics): number {
  let s = 0;

  const locGrowth: Record<LocationGrade, number> = { A: 20, B: 25, C: 30, D: 35 };
  s += locGrowth[p.locationGrade];

  if (ENERGY_RANK[p.energyClass] >= 76) s += 30;
  else if (ENERGY_RANK[p.energyClass] >= 48) s += 18;
  else s += 5;

  if (p.locationGrade <= "B" && m.grossYield < 0.04) s += 20;
  else if (p.locationGrade <= "B" && m.grossYield < 0.05) s += 12;
  else s += 6;

  if (m.age >= 10 && m.age <= 35) s += 15;
  else if (m.age < 10) s += 8;
  else s += 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   Bewertungssicherheit
   ═══════════════════════════════════════════════════ */

function calcConfidence(p: ScoringInput, m: Metrics, riskScore: number): ConfidenceLevel {
  let deductions = 0;

  if (m.renoCount >= 4) deductions += 2;
  else if (m.renoCount >= 2) deductions += 1;

  if (m.age >= 60) deductions += 2;
  else if (m.age >= 40) deductions += 1;

  if (p.locationGrade === "D") deductions += 1;

  if (riskScore < 40) deductions += 1;

  if (m.netRent < 0) deductions += 1;

  if (deductions <= 1) return "high";
  if (deductions <= 3) return "medium";
  return "low";
}

/* ─── Confidence label mapping ─── */

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: "hoch",
  medium: "mittel",
  low: "gering",
};

/* ═══════════════════════════════════════════════════
   Erkl\u00E4rung (professionell, investorenorientiert)
   ═══════════════════════════════════════════════════ */

function generateExplanation(p: ScoringInput, m: Metrics, total: number, confidence: ConfidenceLevel): string {
  const yieldPct = (m.grossYield * 100).toFixed(2);
  const netPct = (m.netYield * 100).toFixed(2);
  const ppsm = Math.round(m.pricePerSqm).toLocaleString("de-DE");
  const factor = m.rentMultiplier.toFixed(1);

  let verdict: string;
  if (total >= 80) verdict = "stellt einen aussichtsreichen Akquisitionskandidaten mit attraktivem risikoadjustiertem Renditeprofil dar";
  else if (total >= 65) verdict = "bietet eine solide Investmentgrundlage mit tragf\u00E4higen Fundamentaldaten, geeignet f\u00FCr eine Buy-and-Hold-Strategie";
  else if (total >= 50) verdict = "zeigt moderates Potenzial, erfordert jedoch eine sorgf\u00E4ltige Due Diligence vor der Kaufentscheidung";
  else if (total >= 35) verdict = "weist wesentliche Schw\u00E4chen auf, die durch Preisverhandlung oder eine klar definierte Value-Add-Strategie adressiert werden m\u00FCssen";
  else verdict = "erf\u00FCllt die Mindestanforderungen an ein tragf\u00E4higes Investment unter Standardannahmen nicht";

  const parts: string[] = [];

  // Einordnungssatz
  parts.push(
    `Investmentzusammenfassung: Dieses Objekt erreicht einen gewichteten Gesamtscore von ${total}/100 (Bewertungssicherheit: ${CONFIDENCE_LABEL[confidence]}) und ${verdict}.`
  );

  // Begr\u00FCndungssatz
  parts.push(
    `Das Objekt ist mit \u20AC${p.purchasePrice.toLocaleString("de-DE")} (\u20AC${ppsm}/m\u00B2 bei ${p.areaSqm}\u00A0m\u00B2 Wohnfl\u00E4che) angesetzt und generiert \u20AC${p.monthlyRent.toLocaleString("de-DE")} monatliche Kaltmiete bei \u20AC${p.housegeld} Hausgeld. Daraus ergibt sich eine Bruttomietrendite von ${yieldPct}\u00A0% und eine Nettorendite von ${netPct}\u00A0% bei einem Kaufpreisfaktor von ${factor}x Jahresnettokaltmiete.`
  );

  // Risikohinweis
  if (m.netRent > 0) {
    parts.push(
      `Nach Abzug des Hausgeldes erwirtschaftet das Objekt einen monatlichen Netto-Cashflow von \u20AC${Math.round(m.netRent).toLocaleString("de-DE")} vor Kapitaldienst \u2013 ein Puffer f\u00FCr Finanzierungskosten und Leerstandsreserven.`
    );
  } else {
    parts.push(
      `Nach Abzug des Hausgeldes entsteht ein monatlicher Netto-Fehlbetrag von \u20AC${Math.abs(Math.round(m.netRent)).toLocaleString("de-DE")} vor Finanzierung \u2013 dieser negative Carry muss durch Wertsteigerung oder Mietwachstum kompensiert werden, um die Investition zu rechtfertigen.`
    );
  }

  if (m.renoCount > 0) {
    const items = m.renoKeys.map(k => RENO_LABEL[k]).join(", ");
    parts.push(
      `Sanierungsbedarf: Bei ${m.renoCount} von 6 bewerteten Gewerken besteht Handlungsbedarf (${items}). Dies birgt Capex-Risiken und m\u00F6gliche Verz\u00F6gerungen im Bauzeitenplan.`
    );
  } else {
    parts.push(
      "Das Objekt weist bei keinem der sechs bewerteten Gewerke unmittelbaren Investitionsbedarf auf \u2013 die kurzfristige Cashflow-Prognose ist damit stabil unterlegt."
    );
  }

  parts.push(
    `Baujahr ${p.baujahr} (${m.age} Jahre), Energieeffizienzklasse ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}), ${LOCATION_LABEL[p.locationGrade]} (Lageklasse ${p.locationGrade}). ${p.locationGrade <= "B" ? "Dies sichert eine starke Mietnachfrage und hohe Wiederverkaufsliquidit\u00E4t." : "Dies kann die Exit-Optionen einschr\u00E4nken und l\u00E4ngere Haltezeitr\u00E4ume erfordern."}`
  );

  return parts.join(" ");
}

/* ═══════════════════════════════════════════════════
   St\u00E4rken
   ═══════════════════════════════════════════════════ */

function generateStrengths(p: ScoringInput, m: Metrics): string[] {
  const list: string[] = [];

  if (m.grossYield >= 0.06)
    list.push(`Eine Bruttomietrendite von ${(m.grossYield * 100).toFixed(1)}\u00A0% liegt deutlich \u00FCber dem deutschen Marktdurchschnitt von ca.\u00A04\u00A0% und bietet einen robusten Einkommenspuffer gegen steigende Zinsen.`);
  else if (m.grossYield >= 0.05)
    list.push(`Die Bruttomietrendite von ${(m.grossYield * 100).toFixed(1)}\u00A0% \u00FCbertrifft den Bundesdurchschnitt und erm\u00F6glicht positiven Leverage bei aktuellen Finanzierungskonditionen.`);

  if (m.hausgeldRatio <= 0.25)
    list.push(`Das Hausgeld beansprucht lediglich ${(m.hausgeldRatio * 100).toFixed(0)}\u00A0% der Bruttomiete \u2013 deutlich innerhalb der \u226430\u00A0%-Schwelle institutioneller Bewertungsstandards.`);

  if (m.renoCount === 0)
    list.push("Kein Sanierungsbedarf bei s\u00E4mtlichen sechs Gewerken \u2013 das Objekt ist stabilisiert und ab dem ersten Tag cashflow-f\u00E4hig.");

  if (ENERGY_RANK[p.energyClass] >= 76)
    list.push(`Energieeffizienzklasse ${p.energyClass} positioniert das Objekt vorausschauend gegen\u00FCber k\u00FCnftigen GEG-Versch\u00E4rfungen und vermeidet erzwungene Nachr\u00FCstungsinvestitionen.`);

  if (p.locationGrade <= "B")
    list.push(`${LOCATION_LABEL[p.locationGrade]} (Lageklasse ${p.locationGrade}) sichert ein geringes Leerstandsrisiko, planbare Mietnachfrage und vorteilhaftere Beleihungsbedingungen der Banken.`);

  if (m.rentMultiplier <= 20)
    list.push(`Ein Kaufpreisfaktor von ${m.rentMultiplier.toFixed(1)}x ist attraktiv im Vergleich zum Korridor von 20\u201325x, der in deutschen Metropolregionen typisch ist.`);

  if (m.pricePerSqm <= 2500)
    list.push(`Der Einstiegspreis von \u20AC${Math.round(m.pricePerSqm).toLocaleString("de-DE")}/m\u00B2 liegt unter dem Marktmedian und bietet eingebettetes Upside durch organische Preiskonvergenz.`);

  if (m.netRent >= 400)
    list.push(`Ein monatlicher Netto\u00FCberschuss von \u20AC${Math.round(m.netRent)} nach Hausgeld gew\u00E4hrleistet eine tragf\u00E4hige Kapitaldienstdeckung.`);

  if (m.age <= 15)
    list.push(`J\u00FCngere Bausubstanz (${m.age} Jahre) impliziert moderne Baustandards und einen geringeren mittelfristigen Instandhaltungsaufwand.`);

  return list.length > 0 ? list : ["Keine herausragenden St\u00E4rken identifiziert \u2013 das Objekt bewegt sich in allen Dimensionen nahe am Marktdurchschnitt."];
}

/* ═══════════════════════════════════════════════════
   Risiken
   ═══════════════════════════════════════════════════ */

function generateRisks(p: ScoringInput, m: Metrics): string[] {
  const list: string[] = [];

  if (m.grossYield < 0.03)
    list.push(`Eine Bruttomietrendite von ${(m.grossYield * 100).toFixed(1)}\u00A0% liegt deutlich unter der Break-even-Schwelle f\u00FCr fremdfinanzierte Akquisitionen bei aktuellen Zinss\u00E4tzen (3,5\u20134,5\u00A0%).`);
  else if (m.grossYield < 0.04)
    list.push(`Eine Bruttomietrendite von ${(m.grossYield * 100).toFixed(1)}\u00A0% l\u00E4sst nur minimalen Spielraum gegen steigende Zinsen \u2013 ein Zinsanstieg um 50 Basispunkte k\u00F6nnte den Cashflow eliminieren.`);

  if (m.hausgeldRatio >= 0.5)
    list.push(`Das Hausgeld absorbiert ${(m.hausgeldRatio * 100).toFixed(0)}\u00A0% der Bruttomiete \u2013 dies deutet auf hohe Verwaltungskosten oder aufgestaute Instandhaltungsr\u00FCcklage-Beitr\u00E4ge hin.`);
  else if (m.hausgeldRatio >= 0.35)
    list.push(`Das Hausgeld liegt bei ${(m.hausgeldRatio * 100).toFixed(0)}\u00A0% der Miete und \u00FCberschreitet die empfohlene 30\u00A0%-Obergrenze \u2013 die Aufschl\u00FCsselung zwischen Verwaltung und R\u00FCcklagen sollte gepr\u00FCft werden.`);

  if (m.renoCount >= 4)
    list.push(`${m.renoCount} von 6 Gewerken erfordern Sanierung \u2013 die kumulierte Capex-Belastung kann \u20AC50.000\u2013150.000+ erreichen und die Gesamterwerbskosten wesentlich beeinflussen.`);
  else if (m.renoCount >= 2) {
    const items = m.renoKeys.map(k => RENO_LABEL[k]).join(", ");
    list.push(`${m.renoCount} anstehende Sanierungen (${items}) bergen Ausf\u00FChrungsrisiken und Kapitalbedarf, der in den Angebotspreis eingerechnet werden muss.`);
  }

  if (p.renovations.roof)
    list.push("Eine Dacherneuerung stellt eines der h\u00F6chsten Einzelposten-Capex-Risiken dar (\u20AC15.000\u201340.000 typischer Miteigentumsanteil) und l\u00F6st h\u00E4ufig Sonderumlage-Beschl\u00FCsse aus.");

  if (p.renovations.heating && ENERGY_RANK[p.energyClass] < 50)
    list.push("Ein erforderlicher Heizungstausch bei einer Energieklasse unter D kann gem\u00E4\u00DF GEG \u00A7\u00A7\u00A071\u201372 eine geb\u00E4udeweite energetische Sanierung ausl\u00F6sen.");

  if (ENERGY_RANK[p.energyClass] < 35)
    list.push(`Energieklasse ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}) steht unter zunehmendem regulatorischem Druck \u2013 die EU-Richtlinie 2024/1275 und GEG-Novellen k\u00F6nnen innerhalb der n\u00E4chsten Dekade eine Sanierungspflicht ausl\u00F6sen.`);

  if (p.locationGrade === "D")
    list.push("Lageklasse D birgt erh\u00F6htes Leerstands- und Wiedervermietungsrisiko, schw\u00E4chere Bankbewertungen und eingeschr\u00E4nkte Exit-Liquidit\u00E4t.");

  if (m.age >= 60)
    list.push(`Bei einem Geb\u00E4udealter von ${m.age} Jahren liegt die Bausubstanz vor modernen Baustandards \u2013 ein bautechnisches Gutachten sollte latente M\u00E4ngel identifizieren, die \u00FCber die Renovierungscheckliste hinausgehen.`);

  if (m.netRent < 0)
    list.push(`Ein negativer Netto-Carry von \u20AC${Math.abs(Math.round(m.netRent))}/Monat vor Finanzierung erzeugt einen sofortigen Liquidit\u00E4tsabfluss, der sich unter Fremdfinanzierung verst\u00E4rkt.`);

  if (m.rentMultiplier >= 30)
    list.push(`Ein Kaufpreisfaktor von ${m.rentMultiplier.toFixed(1)}x impliziert eine Amortisationsdauer von \u00FCber 30 Jahren \u2013 die Investmentthese muss sich vorrangig auf Wertsteigerung statt auf Einnahmen st\u00FCtzen.`);

  if (m.pricePerSqm >= 6000)
    list.push(`Bei \u20AC${Math.round(m.pricePerSqm).toLocaleString("de-DE")}/m\u00B2 liegt der Einstiegspreis im Premium-Segment \u2013 weiteres Upside ist begrenzt, sofern das Objekt keine absolute Spitzenmikrolage besetzt.`);

  return list.length > 0 ? list : ["Keine wesentlichen Risiken auf Basis der vorliegenden Daten identifiziert \u2013 standardm\u00E4\u00DFige Due Diligence ist ausreichend."];
}

/* ═══════════════════════════════════════════════════
   Kategorisierte Handlungsempfehlungen
   ═══════════════════════════════════════════════════ */

function generateRecommendations(p: ScoringInput, m: Metrics, total: number, bank: number): CategorizedRecommendations {
  const financing: string[] = [];
  const technical: string[] = [];
  const legal: string[] = [];
  const strategy: string[] = [];

  /* ─── Finanzierung ─── */

  if (m.grossYield >= 0.05 && m.netRent > 0)
    financing.push("Die Rendite tr\u00E4gt einen positiven Leverage \u2013 modellieren Sie eine Finanzierung mit 80\u00A0% Beleihungsauslauf, um den Cashflow nach Kapitaldienst bei 4\u00A0% Annuit\u00E4t zu validieren.");
  else if (m.grossYield >= 0.04)
    financing.push("Grenzwertige Rendite \u2013 zielen Sie auf einen niedrigeren Beleihungsauslauf (70\u201375\u00A0%) oder verhandeln Sie den Kaufpreis um 5\u201310\u00A0% herunter, um Finanzierungsspielraum zu schaffen.");
  else
    financing.push("Eine Rendite unter 4\u00A0% macht eine fremdfinanzierte Akquisition bei aktuellen Zinsen riskant \u2013 erw\u00E4gen Sie einen h\u00F6heren Eigenkapitaleinsatz oder verzichten Sie, sofern kein signifikantes Mietwachstum realisierbar ist.");

  if (bank >= 70)
    financing.push("Starkes Finanzierungsprofil \u2013 rechnen Sie mit wettbewerbsf\u00E4higen Konditionen. Holen Sie Angebote von mindestens 3 Kreditgebern ein, darunter Interhyp und Direktbanken.");
  else if (bank < 50)
    financing.push("Unterdurchschnittliche Bankf\u00E4higkeit \u2013 Banken k\u00F6nnen h\u00F6heres Eigenkapital (30\u00A0%+), k\u00FCrzere Laufzeiten oder zus\u00E4tzliche Sicherheiten verlangen. Bereiten Sie die Unterlagen im Vorfeld auf.");

  if (m.hausgeldRatio >= 0.35)
    financing.push("Das erh\u00F6hte Hausgeld reduziert die Kapitaldienstdeckungsquote \u2013 stellen Sie das vollst\u00E4ndige Hausgeld in der Bankpr\u00E4sentation dar, um \u00DCberraschungen im Underwriting zu vermeiden.");

  if (m.grossYield >= 0.04)
    financing.push("F\u00FChren Sie einen Stresstest bei 5,5\u00A0% Zinssatz durch, um die Belastbarkeit gegen\u00FCber m\u00F6glichen Zinserh\u00F6hungen zu validieren.");

  /* ─── Technik ─── */

  if (m.renoCount >= 2) {
    technical.push("Holen Sie verbindliche Handwerkerangebote f\u00FCr alle identifizierten Sanierungsma\u00DFnahmen vor Unterzeichnung des Kaufvertrags ein.");
    technical.push("Kalkulieren Sie einen Kostenpuffer von 15\u201320\u00A0% \u00FCber den Angebotssummen, um Nachtr\u00E4ge und Umfangserweiterungen bei \u00E4lteren Geb\u00E4uden abzudecken.");
  }

  if (p.renovations.roof || p.renovations.facade)
    technical.push("Dach- und Fassadenarbeiten erfordern einen WEG-Beschluss \u2013 pr\u00FCfen Sie den Zeitplan der Eigent\u00FCmerversammlung und bestehende Beschlusslage vor der Budgetierung.");

  if (ENERGY_RANK[p.energyClass] < 50) {
    technical.push("Fordern Sie den aktuellen Energieausweis an und pr\u00FCfen Sie die Erf\u00FCllungsfristen nach GEG 2024 \u2013 bei Nichtkonformit\u00E4t drohen beh\u00F6rdliche Sanierungsanordnungen.");
    if (!p.renovations.facade)
      technical.push("Eine proaktive Fassadend\u00E4mmung (WDVS) kann die Energieeffizienzklasse um 1\u20132 Stufen verbessern und sowohl regulatorische Konformit\u00E4t als auch Mietsteigerungspotenzial erschlie\u00DFen.");
  }

  if (p.renovations.heating)
    technical.push("Die Heizungsmodernisierung muss der 65\u00A0%-EE-Vorgabe gem\u00E4\u00DF GEG \u00A7\u00A071 entsprechen \u2013 W\u00E4rmepumpe oder Fernw\u00E4rmeanschluss sollten gepr\u00FCft werden.");

  if (m.age >= 40 && m.renoCount === 0)
    technical.push("Trotz fehlender Auff\u00E4lligkeiten: Bei einem Geb\u00E4ude dieses Alters empfiehlt sich ein unabh\u00E4ngiges Baugutachten \u2013 verdeckte M\u00E4ngel an Leitungen, tragenden Bauteilen oder Abdichtungen sind h\u00E4ufig.");

  /* ─── Recht ─── */

  if (m.renoCount >= 1)
    legal.push("Pr\u00FCfen Sie die WEG-Protokolle der letzten 3 Jahre auf geplante Sonderumlagen, anh\u00E4ngige Rechtsstreitigkeiten und den aktuellen Stand der Instandhaltungsr\u00FCcklage.");

  if (m.grossYield < 0.04 && p.locationGrade <= "B")
    legal.push("Pr\u00FCfen Sie das Mietsteigerungspotenzial nach \u00A7\u00A0559 BGB \u2013 bis zu 8\u00A0% der Modernisierungskosten k\u00F6nnen j\u00E4hrlich auf den Mieter umgelegt werden, gedeckelt bei \u20AC2\u20133/m\u00B2 je nach Vormiete.");

  if (p.locationGrade <= "B")
    legal.push("Pr\u00FCfen Sie die Anwendbarkeit der Mietpreisbremse \u2013 in regulierten M\u00E4rkten ist die H\u00F6chstmiete bei Neuvermietung auf 10\u00A0% \u00FCber dem \u00F6rtlichen Mietspiegel begrenzt.");

  legal.push("Grundbuch-Pr\u00FCfung (Abt. II & III): Kl\u00E4ren Sie Wegerechte, Nie\u00DFbrauch, Vorkaufsrechte und bestehende Grundschulden des Verk\u00E4ufers.");

  if (ENERGY_RANK[p.energyClass] < 35)
    legal.push("Die niedrige Energieklasse l\u00F6st Offenlegungspflichten nach \u00A7\u00A080 GEG aus \u2013 stellen Sie sicher, dass der Verk\u00E4ufer einen g\u00FCltigen Energieausweis vorgelegt hat, und kalkulieren Sie Konformit\u00E4tskosten in Ihr Angebot ein.");

  /* ─── Strategie ─── */

  if (total >= 75) {
    strategy.push("Starke Fundamentaldaten sprechen f\u00FCr eine Core-Buy-and-Hold-Strategie \u2013 planen Sie eine Haltedauer von 10+ Jahren mit organischem Mietwachstum und Tilgung als prim\u00E4ren Renditetreibern.");
    strategy.push("Leiten Sie die Finanzierungsvoranfrage und den Notartermin ein. Die Standard-Due-Diligence-Checkliste ist anwendbar.");
  } else if (total >= 55) {
    strategy.push("Moderater Score \u2013 benchmarken Sie gegen 2\u20133 vergleichbare Angebote, bevor Sie sich festlegen, um den relativen Wert sicherzustellen.");
    if (m.renoCount >= 2)
      strategy.push("Value-Add-Ansatz: Verhandeln Sie einen Sanierungsabschlag in den Kaufpreis, f\u00FChren Sie gezielte Aufwertungen durch und repositionieren Sie das Objekt f\u00FCr h\u00F6here Mieten innerhalb von 12\u201318 Monaten.");
    else
      strategy.push("Optimieren Sie durch Mietanpassung auf Mietspiegel-Niveau und Hausgeld-Reduktion \u00FCber WEG-Kostenmanagement.");
  } else {
    strategy.push("Unterdurchschnittlicher Score \u2013 verfolgen Sie das Objekt nur mit einer konkreten Value-Add-These (Kernsanierung, Nutzungs\u00E4nderung oder Zusammenlegung) und quantifizierten Renditeprognosen.");
    if (m.rentMultiplier >= 25)
      strategy.push("Verhandeln Sie 10\u201315\u00A0% unter Angebotspreis, um den Kaufpreisfaktor in den Bereich von 20\u201322x zu bringen, der f\u00FCr eine rentable Fremdfinanzierung erforderlich ist.");
  }

  if (p.locationGrade >= "C" && m.grossYield >= 0.06)
    strategy.push("Hohe Rendite in einer Entwicklungslage spricht f\u00FCr eine Cashflow-first-Strategie \u2013 akkumulieren Sie Einnahmen und beobachten Sie Infrastrukturkatalysatoren, die Wertsteigerungen ausl\u00F6sen k\u00F6nnten.");

  if (p.locationGrade <= "B" && m.grossYield < 0.04)
    strategy.push("Niedrige Rendite in Premiumlage ist eine Wertsteigerungswette \u2013 validieren Sie anhand von 10-Jahres-Preistrends und pr\u00FCfen Sie das Refinanzierungspotenzial nach 5 Jahren.");

  return { financing, technical, legal, strategy };
}

/* ═══════════════════════════════════════════════════
   Main entry point
   ═══════════════════════════════════════════════════ */

export function computeScore(params: ScoringInput): ScoringResult {
  const m = deriveMetrics(params);

  const inv    = calcInvestmentScore(params, m);
  const rent   = calcRentabilityScore(params, m);
  const risk   = calcRiskScore(params, m);
  const energy = calcEnergyScore(params, m);
  const bank   = calcBankabilityScore(params, m);
  const proj   = calcProjectionScore(params, m);

  const totalScore = clamp(Math.round(
    inv    * WEIGHTS.investment +
    rent   * WEIGHTS.rentability +
    risk   * WEIGHTS.risk +
    energy * WEIGHTS.energy +
    bank   * WEIGHTS.bankability +
    proj   * WEIGHTS.projection
  ));

  const confidenceLevel = calcConfidence(params, m, risk);

  return {
    totalScore,
    confidenceLevel,
    subscores: {
      investmentScore:   { label: "Investitions-Score",      value: inv,    weight: WEIGHTS.investment },
      rentabilityScore:  { label: "Vermietbarkeits-Score",   value: rent,   weight: WEIGHTS.rentability },
      riskScore:         { label: "Risiko-Score",            value: risk,   weight: WEIGHTS.risk },
      energyScore:       { label: "Energie-Score",           value: energy, weight: WEIGHTS.energy },
      bankabilityScore:  { label: "Finanzierungs-Score",     value: bank,   weight: WEIGHTS.bankability },
      projectionScore:   { label: "Zukunfts-Score",          value: proj,   weight: WEIGHTS.projection },
    },
    explanation: generateExplanation(params, m, totalScore, confidenceLevel),
    strengths: generateStrengths(params, m),
    risks: generateRisks(params, m),
    recommendations: generateRecommendations(params, m, totalScore, bank),
    comparisonMetrics: {
      yield: m.grossYield,
      factor: m.rentMultiplier,
      renovationCount: m.renoCount,
      energyRank: ENERGY_RANK[params.energyClass],
      bankScore: bank,
      riskLevel: risk,
    },
  };
}

export function scoreTrend(): "up" | "down" | "stable" {
  const r = Math.random();
  if (r < 0.33) return "up";
  if (r < 0.66) return "stable";
  return "down";
}
