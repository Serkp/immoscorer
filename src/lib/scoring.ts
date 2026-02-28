/* ═══════════════════════════════════════════════════════════
   ImmoScorer — Deterministische Scoring-Engine v3
   Keine KI, keine Randomness. Pure Berechnungen.
   Jede Zahl muss stimmen.
   ═══════════════════════════════════════════════════════════ */

import { findCityData } from "@/data/german-cities";

export interface PropertyInput {
  street: string;
  city: string;
  price: number;
  rent: number;       // Always Kaltmiete (already adjusted if user entered Warmmiete)
  hausgeld: number;   // Total Hausgeld (WEG payment)
  area: number;
  year: number;
  energyClass: string;
  locationGrade: string;
  renovations: string[];
  /* Optional: echte Lage-Daten von Google Places */
  walkScore?: number;
  transitScore?: number;
  /* Optional: Hausgeld-Aufschlüsselung */
  hausgeldNichtUmlagefaehig?: number;
  hasHGBreakdown?: boolean;
  /* Optional: Extended property info */
  propertyType?: string;    // etw, efh, mfh, dhh
  apartmentType?: string;   // erdgeschoss, obergeschoss, dachgeschoss, penthouse, souterrain
  rooms?: number;           // 1-20
  unitCount?: number;       // MFH: Anzahl Wohneinheiten
  estimatedUtilities?: number;
}

export interface SubscoreEntry {
  key: string;
  label: string;
  value: number;
  weight: number;
  oneLiner: string;
  reasons: string[];
  actions: string[];
}

export type PlausibilityLevel = "ok" | "warning" | "error";

export interface PlausibilityCheck {
  level: PlausibilityLevel;
  message: string;
}

export interface RenovationEstimate {
  breakdown: Record<string, number>;
  total: number;
  hints: string[];
}

export interface ValuePotential {
  effectivePrice: number;
  effectiveSqmPrice: number;
  estimatedMarketValue: number;
  marketSqmPrice: number;
  delta: number;
  scoreBonus: number;
  message: string;
}

export interface ScoringResult {
  totalScore: number;
  confidence: "Hohe Bewertungssicherheit" | "Mittlere Bewertungssicherheit" | "Geringe Bewertungssicherheit" | "Eingaben prüfen";
  subscores: SubscoreEntry[];
  kpis: {
    netYield: number;
    grossYield: number;
    factor: number;
    sqmPrice: number;
    hausgeldRatio: number;
    netCashflow: number;
    hausgeldGesamt: number;
    hausgeldNichtUmlagefaehig: number;
    hasHGBreakdown: boolean;
  };
  strengths: string[];
  risks: string[];
  plausibility: PlausibilityCheck[];
  renovationEstimate: RenovationEstimate | null;
  valuePotential: ValuePotential | null;
  energyExplanation: string;
}

/* ─── Lookup-Tabellen ─── */

const ENERGY_RANK: Record<string, number> = {
  "A+": 100, A: 95, B: 85, C: 70, D: 55, E: 35, F: 20, G: 10, H: 5,
};

const ENERGY_COST_SQM: Record<string, number> = {
  "A+": 4, A: 5, B: 8, C: 11, D: 14, E: 18, F: 22, G: 28, H: 30,
};

const ENERGY_EXPLANATION: Record<string, string> = {
  "A+": "Passivhaus/KfW40-Standard — niedrigste Energiekosten (~4 €/m²/Jahr). Keine regulatorischen Pflichten.",
  A: "Sehr effizient — sehr niedrige Energiekosten (~5 €/m²/Jahr). Keine Sanierungspflicht.",
  B: "Gut — moderate Energiekosten (~8 €/m²/Jahr). Keine Sanierungspflicht.",
  C: "Durchschnitt — ca. 11 €/m²/Jahr. Akzeptabel, mittelfristig Optimierung sinnvoll.",
  D: "Unterdurchschnitt — ca. 14 €/m²/Jahr. Heizkosten überdurchschnittlich. Mittelfristig empfehlenswert: Fenster und/oder Dämmung.",
  E: "Schlecht — ca. 18 €/m²/Jahr. Hohe Heizkosten. GEG-Sanierungspflicht bei Eigentümerwechsel möglich.",
  F: "Sehr schlecht — ca. 22 €/m²/Jahr. Sanierungspflicht wahrscheinlich, Mieter beschweren sich über Nebenkosten.",
  G: "Katastrophal — ca. 28 €/m²/Jahr. Sofortige Sanierung nötig. GEG-Pflichten greifen.",
  H: "Nicht tragbar — > 28 €/m²/Jahr. In heutigem Markt schwer vermietbar. Sofortiger Handlungsbedarf.",
};

const LOCATION_LABEL: Record<string, string> = {
  A: "Top-Lage", B: "gute Lage", C: "durchschnittliche Lage", D: "Entwicklungslage",
};

const RENO_LABEL: Record<string, string> = {
  dach: "Dach", fassade: "Fassade", fenster: "Fenster",
  bad: "Bad", elektrik: "Elektrik", heizung: "Heizung",
};

/* ─── Grunderwerbsteuer nach Bundesland ─── */
const GRUNDERWERBSTEUER: Record<string, number> = {
  "Bayern": 3.5, "Sachsen": 3.5, "Hamburg": 5.5, "Nordrhein-Westfalen": 6.5,
  "Berlin": 6.0, "Baden-Württemberg": 5.0, "Hessen": 6.0, "Niedersachsen": 5.0,
  "Schleswig-Holstein": 6.5, "Brandenburg": 6.5, "Thüringen": 5.0,
  "Sachsen-Anhalt": 5.0, "Rheinland-Pfalz": 5.0, "Saarland": 6.5,
  "Bremen": 5.0, "Mecklenburg-Vorpommern": 6.0,
};

/* ─── Hilfsfunktionen ─── */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getRoomScore(rooms?: number): number {
  if (!rooms || rooms < 1) return 85;
  const ROOM_SCORE: Record<number, number> = { 1: 70, 2: 95, 3: 100, 4: 80, 5: 60 };
  if (rooms >= 6) return 55;
  return ROOM_SCORE[rooms] ?? 85;
}

function getGrunderwerbsteuer(state: string | undefined): number {
  if (!state) return 5.0; // Fallback average
  return GRUNDERWERBSTEUER[state] ?? 5.0;
}

/* ─── TEIL 11: Sanierungskosten nach Objektart ─── */

export function estimateRenovationCosts(
  propertyType: string | undefined,
  areaSqm: number,
  renovations: string[],
  unitCount = 1,
): RenovationEstimate {
  const breakdown: Record<string, number> = {};
  const hints: string[] = [];
  const isETW = propertyType === "etw";
  const isEFH = propertyType === "efh" || propertyType === "dhh";
  const isMFH = propertyType === "mfh";
  const units = Math.max(unitCount, 1);

  if (renovations.includes("fenster")) {
    const windowCount = Math.ceil(areaSqm / 15);
    if (isETW) { breakdown.fenster = windowCount * 1200; }
    else if (isEFH) { breakdown.fenster = windowCount * 1300; }
    else if (isMFH) { breakdown.fenster = units * Math.ceil(areaSqm / units / 15) * 1200; }
    else { breakdown.fenster = windowCount * 1200; }
  }

  if (renovations.includes("dach")) {
    if (isETW) {
      const totalRoofCost = areaSqm * 2 * 130;
      breakdown.dach = Math.round(totalRoofCost / Math.max(units || 8, 4));
      hints.push("Anteilige Kosten — wird über Eigentümergemeinschaft geteilt.");
    } else if (isEFH) { breakdown.dach = Math.round(areaSqm * 0.7 * 150); }
    else if (isMFH) { breakdown.dach = Math.round(areaSqm * 0.4 * 140); }
    else { breakdown.dach = Math.round(areaSqm * 0.7 * 150); }
  }

  if (renovations.includes("fassade")) {
    if (isETW) {
      const totalFacadeCost = areaSqm * 3 * 120;
      breakdown.fassade = Math.round(totalFacadeCost / Math.max(units || 8, 4));
      if (!hints.some(h => h.includes("Eigentümergemeinschaft"))) {
        hints.push("Anteilige Kosten — wird über Eigentümergemeinschaft geteilt.");
      }
    } else { breakdown.fassade = Math.round(areaSqm * 3.5 * 120); }
  }

  if (renovations.includes("heizung")) {
    if (isETW) { breakdown.heizung = 4500; }
    else if (isEFH) { breakdown.heizung = 12000; }
    else if (isMFH) { breakdown.heizung = 8000 + units * 2000; }
    else { breakdown.heizung = 4500; }
  }

  if (renovations.includes("elektrik")) {
    if (isETW) { breakdown.elektrik = Math.round(areaSqm * 60); }
    else if (isEFH) { breakdown.elektrik = Math.round(areaSqm * 70); }
    else if (isMFH) { breakdown.elektrik = Math.round(areaSqm * 55); }
    else { breakdown.elektrik = Math.round(areaSqm * 60); }
  }

  if (renovations.includes("baeder") || renovations.includes("bad")) {
    if (isETW) { breakdown.bad = 8000; }
    else if (isEFH) { breakdown.bad = areaSqm > 120 ? 18000 : 12000; }
    else if (isMFH) { breakdown.bad = units * 6500; }
    else { breakdown.bad = 8000; }
  }

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { breakdown, total, hints };
}

/* ─── TEIL 1: Plausibilitäts-Checks ─── */

function runPlausibilityChecks(p: PropertyInput): PlausibilityCheck[] {
  const checks: PlausibilityCheck[] = [];
  const grossYieldPct = p.price > 0 ? ((p.rent * 12) / p.price) * 100 : 0;
  const sqmPrice = p.area > 0 ? p.price / p.area : 0;
  const mieteSqm = p.area > 0 ? p.rent / p.area : 0;
  const factor = p.rent > 0 ? p.price / (p.rent * 12) : 0;

  // Bruttorendite
  if (grossYieldPct > 40) {
    checks.push({ level: "error", message: `Rendite von ${grossYieldPct.toFixed(1)}% ist nicht plausibel. Bitte korrigieren.` });
  } else if (grossYieldPct > 25) {
    checks.push({ level: "error", message: `Rendite von ${grossYieldPct.toFixed(1)}% ist ungewöhnlich. Stimmen Kaufpreis und Miete?` });
  } else if (grossYieldPct > 15) {
    checks.push({ level: "warning", message: `Überdurchschnittlich hohe Rendite (${grossYieldPct.toFixed(1)}%). Bitte Eingaben prüfen.` });
  } else if (grossYieldPct > 0 && grossYieldPct < 1) {
    checks.push({ level: "warning", message: `Sehr niedrige Rendite (${grossYieldPct.toFixed(1)}%).` });
  }

  // Miete pro m²
  if (mieteSqm > 25) {
    checks.push({ level: "warning", message: `Kaltmiete ${mieteSqm.toFixed(1)} €/m² — nur München-Zentrum erreicht das.` });
  } else if (mieteSqm > 20) {
    checks.push({ level: "warning", message: `Überdurchschnittliche Miete (${mieteSqm.toFixed(1)} €/m²).` });
  } else if (mieteSqm > 0 && mieteSqm < 3) {
    checks.push({ level: "warning", message: `Ungewöhnlich niedrige Miete (${mieteSqm.toFixed(1)} €/m²).` });
  }

  // Kaufpreis pro m²
  if (sqmPrice > 0 && sqmPrice < 300) {
    checks.push({ level: "warning", message: `Extrem niedriger Kaufpreis (${Math.round(sqmPrice)} €/m²). Bitte prüfen.` });
  } else if (sqmPrice > 12000) {
    checks.push({ level: "warning", message: `Sehr hoher Kaufpreis (${Math.round(sqmPrice).toLocaleString("de-DE")} €/m²).` });
  }

  // Kaufpreisfaktor
  if (factor > 0 && factor < 5) {
    checks.push({ level: "warning", message: `Ungewöhnlich niedriger Kaufpreisfaktor (${factor.toFixed(1)}x).` });
  } else if (factor > 40) {
    checks.push({ level: "warning", message: `Extrem hoher Kaufpreisfaktor (${factor.toFixed(1)}x).` });
  }

  // MFH: Miete pro Einheit
  if (p.propertyType === "mfh" && p.unitCount && p.unitCount > 0) {
    const rentPerUnit = p.rent / p.unitCount;
    if (rentPerUnit < 200) {
      checks.push({ level: "warning", message: `Gesamtmiete / Einheiten = ${Math.round(rentPerUnit)} €/Einheit — ungewöhnlich niedrig.` });
    } else if (rentPerUnit > 2000) {
      checks.push({ level: "warning", message: `Gesamtmiete / Einheiten = ${Math.round(rentPerUnit)} €/Einheit — ungewöhnlich hoch.` });
    }
  }

  return checks;
}

/* ─── KPI-Berechnung (TEIL 3) ─── */

function deriveKPIs(p: PropertyInput) {
  const cityData = findCityData(p.city);
  const annualRent = p.rent * 12;
  const renoEst = estimateRenovationCosts(p.propertyType, p.area, p.renovations, p.unitCount);
  const renovationCosts = renoEst.total;

  // Kaufnebenkosten (TEIL 3)
  const state = cityData?.state;
  const grestPct = getGrunderwerbsteuer(state);
  const notarPct = 2.0;
  const kaufnebenkosten = p.price * ((grestPct + notarPct) / 100);
  const gesamtinvestition = p.price + kaufnebenkosten + renovationCosts;

  const effectivePrice = p.price + renovationCosts;
  const grossYield = p.price > 0 ? annualRent / p.price : 0;
  const effectiveGrossYield = effectivePrice > 0 ? annualRent / effectivePrice : 0;

  // Nicht-umlagefähiges Hausgeld
  const ownerHausgeld = p.hausgeldNichtUmlagefaehig ?? (p.hausgeld * 0.40);
  // EFH Instandhaltungsrücklage: 1.50€/m²/Monat
  const instandhaltung = (p.propertyType === "efh" || p.propertyType === "dhh") ? p.area * 1.50 : 0;
  // Mietausfallrisiko: 2% der Jahresmiete
  const mietausfallRisiko = annualRent * 0.02;

  // Nettorendite (TEIL 3)
  const nettoJahresertrag = annualRent - (ownerHausgeld * 12) - instandhaltung * 12 - mietausfallRisiko;
  const netYield = gesamtinvestition > 0 ? nettoJahresertrag / gesamtinvestition : 0;

  // Cashflow
  const netCashflow = p.rent - ownerHausgeld - instandhaltung;

  // Geschätzte Kreditrate (80% Finanzierung, 3.5% Zins + 2% Tilgung = 5.5%)
  const finanzierungsBetrag = p.price * 0.80;
  const geschaetzteKreditrate = finanzierungsBetrag * 0.055 / 12;
  const cashflowNachFinanzierung = p.rent - ownerHausgeld - instandhaltung - geschaetzteKreditrate;

  const factor = annualRent > 0 ? p.price / annualRent : 0;
  const effectiveFactor = annualRent > 0 ? effectivePrice / annualRent : 0;
  const sqmPrice = p.area > 0 ? p.price / p.area : 0;
  const hausgeldRatio = p.rent > 0 ? ownerHausgeld / p.rent : 0;
  const age = new Date().getFullYear() - p.year;

  return {
    annualRent, grossYield, effectiveGrossYield, netCashflow, netYield,
    factor, effectiveFactor, sqmPrice, hausgeldRatio, age,
    renovationCosts, effectivePrice, ownerHausgeld, cityData,
    gesamtinvestition, kaufnebenkosten, grestPct, notarPct,
    instandhaltung, mietausfallRisiko, finanzierungsBetrag,
    geschaetzteKreditrate, cashflowNachFinanzierung,
  };
}

type KPIs = ReturnType<typeof deriveKPIs>;

/* ═══════════════════════════════════════════════════════════
   TEIL 4: Investitions-Score (30% vom Gesamt)
   ═══════════════════════════════════════════════════════════ */

function calcInvestment(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];

  // Effektive Bruttorendite (40% Gewichtung)
  const effYieldPct = k.effectiveGrossYield * 100;
  const yieldPts =
    effYieldPct >= 8 ? 100 : effYieldPct >= 7 ? 90 : effYieldPct >= 6 ? 80 :
    effYieldPct >= 5 ? 65 : effYieldPct >= 4 ? 50 : effYieldPct >= 3 ? 35 :
    effYieldPct >= 2 ? 20 : 5;
  s += yieldPts * 0.40;

  // Market comparison for reason
  if (k.cityData) {
    const avgYield = (k.cityData.avgRentPerSqm * 12) / k.cityData.avgPricePerSqm * 100;
    reasons.push(`Bruttorendite von ${(k.grossYield * 100).toFixed(1)}% liegt ${k.grossYield * 100 > avgYield ? "über" : "unter"} dem Durchschnitt für ${k.cityData.city} (Ø ${avgYield.toFixed(1)}%).`);
  } else {
    reasons.push(`Effektive Bruttorendite ${effYieldPct.toFixed(1)}% (inkl. Sanierungskosten).`);
  }

  if (k.renovationCosts > 0) {
    reasons.push(`Sanierungskosten ~${Math.round(k.renovationCosts).toLocaleString("de-DE")} € → Effektiver Kaufpreis ${Math.round(k.effectivePrice).toLocaleString("de-DE")} €.`);
  }

  // Kaufpreisfaktor (30% Gewichtung)
  const fac = k.effectiveFactor;
  const facPts =
    fac <= 12 ? 100 : fac <= 15 ? 90 : fac <= 18 ? 75 :
    fac <= 22 ? 60 : fac <= 25 ? 45 : fac <= 30 ? 30 :
    fac <= 35 ? 15 : 5;
  s += facPts * 0.30;
  reasons.push(`Faktor ${fac.toFixed(1)} bedeutet, dass sich der Kaufpreis in ${Math.round(fac)} Jahren durch Mieteinnahmen amortisiert.`);

  // Preis vs. Markt (30% Gewichtung)
  let marketPts = 50; // neutral if no city data
  if (k.cityData) {
    const ratio = k.sqmPrice / k.cityData.avgPricePerSqm;
    if (ratio < 0.70) { marketPts = 100; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — Schnäppchen (${Math.round(ratio * 100)}% vom Ø ${k.cityData.avgPricePerSqm.toLocaleString("de-DE")} €/m² in ${k.cityData.city}).`); }
    else if (ratio < 0.85) { marketPts = 85; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — deutlich unter Stadtdurchschnitt (${k.cityData.avgPricePerSqm.toLocaleString("de-DE")} €/m²).`); }
    else if (ratio <= 1.00) { marketPts = 70; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — fairer Preis (Ø ${k.cityData.avgPricePerSqm.toLocaleString("de-DE")} €/m² in ${k.cityData.city}).`); }
    else if (ratio <= 1.15) { marketPts = 50; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — leicht über Durchschnitt.`); }
    else if (ratio <= 1.30) { marketPts = 30; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — überteuert (${Math.round(ratio * 100)}% vom Ø).`); }
    else { marketPts = 10; reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² — deutlich überteuert.`); }
  } else {
    reasons.push(`${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m² (Stadt nicht in Datenbank — neutraler Vergleich).`);
  }
  s += marketPts * 0.30;

  // Actions
  if (effYieldPct >= 5) actions.push("Rendite trägt positiven Leverage — modellieren Sie 80% LTV bei 5% Annuität zur Cashflow-Validierung.");
  else if (effYieldPct >= 4) actions.push("Grenzwertige Rendite — zielen Sie auf 70–75% LTV oder verhandeln Sie 5–10% Preisnachlass.");
  else actions.push("Rendite unter 4% macht fremdfinanzierte Akquisition riskant — höheren Eigenkapitaleinsatz einkalkulieren.");

  if (fac >= 25) actions.push("Verhandeln Sie 10–15% unter Angebotspreis, um den Faktor in den Zielkorridor von 20–22x zu senken.");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 5: Vermietbarkeits-Score (15% vom Gesamt)
   ═══════════════════════════════════════════════════════════ */

function calcRentability(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const reasons: string[] = [];
  const actions: string[] = [];

  // Lageklasse (45% Gewichtung)
  let locPts: number;
  if (p.walkScore != null && p.transitScore != null) {
    const realScore = p.walkScore * 0.6 + p.transitScore * 0.4;
    const gradeFloor: Record<string, number> = { A: 90, B: 75, C: 45, D: 20 };
    locPts = Math.max(gradeFloor[p.locationGrade] || 45, Math.round(realScore));
  } else {
    const gradeScores: Record<string, number> = { A: 100, B: 85, C: 55, D: 25 };
    locPts = gradeScores[p.locationGrade] || 55;
  }
  // Vacancy bonus
  if (k.cityData && k.cityData.vacancyRate < 1) {
    locPts = Math.min(100, locPts + 5);
  }

  const locLabel = LOCATION_LABEL[p.locationGrade] || "Unbekannte Lage";
  if (k.cityData) {
    reasons.push(`${locLabel} (Klasse ${p.locationGrade}) — Leerstandsquote in ${k.cityData.city}: ${k.cityData.vacancyRate}%.${
      p.locationGrade === "A" ? " Top-Lage mit hervorragender Infrastruktur." :
      p.locationGrade === "B" ? " Beliebte Wohnlage mit stabiler Nachfrage." :
      p.locationGrade === "C" ? " Durchschnittliche Lage mit moderatem Vermietungspotenzial." :
      " Entwicklungslage mit eingeschränkter Nachfrage."
    }`);
  } else {
    reasons.push(`${locLabel} (Klasse ${p.locationGrade}).`);
  }

  // Wohnungsgröße (20% Gewichtung)
  let areaPts: number;
  if (p.area >= 50 && p.area <= 80) { areaPts = 100; reasons.push(`${p.area} m² Wohnfläche im Sweet Spot — breiteste Zielgruppe.`); }
  else if (p.area >= 30 && p.area < 50) { areaPts = 90; reasons.push(`Kompakte ${p.area} m² — hohe Nachfrage bei Singles und Paaren.`); }
  else if (p.area > 80 && p.area <= 120) { areaPts = 75; reasons.push(`${p.area} m² — Familiensegment, solide Nachfrage.`); }
  else if (p.area < 30) { areaPts = 70; reasons.push(`${p.area} m² Mikrowohnung — Nischenmarkt.`); }
  else { areaPts = 50; reasons.push(`${p.area} m² — Luxussegment, eingeschränkter Mietmarkt.`); }

  // Zimmeranzahl (15% Gewichtung)
  const roomPts = getRoomScore(p.rooms);
  if (p.rooms) {
    const roomLabels: Record<number, string> = {
      1: "1 Zimmer — Nischensegment, begrenzte Zielgruppe.",
      2: "2 Zimmer — höchste Nachfrage bei Singles und Paaren.",
      3: "3 Zimmer — breiteste Zielgruppe.",
      4: "4 Zimmer — Familiensegment.",
    };
    reasons.push(roomLabels[p.rooms] || `${p.rooms} Zimmer — Luxus/Spezial-Segment.`);
  }

  // Baujahr (10% Gewichtung)
  let agePts: number;
  if (k.age <= 10) { agePts = 100; reasons.push(`Neubau (${p.year}) — moderne Ausstattung, hohe Mieterakzeptanz.`); }
  else if (k.age <= 30) { agePts = 85; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — zeitgemäße Bausubstanz.`); }
  else if (k.age <= 50) { agePts = 70; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — solide Substanz, ggf. Modernisierungsbedarf.`); }
  else if (k.age <= 80) { agePts = 55; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — ältere Substanz.`); }
  else { agePts = 40; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — historische Substanz.`); }

  // Energieklasse (10% Gewichtung)
  let energyPts: number;
  const ec = p.energyClass;
  if (ec === "A+" || ec === "A") { energyPts = 100; }
  else if (ec === "B") { energyPts = 85; }
  else if (ec === "C") { energyPts = 70; }
  else if (ec === "D") { energyPts = 55; }
  else if (ec === "E") { energyPts = 35; }
  else if (ec === "F") { energyPts = 20; }
  else { energyPts = 10; } // G, H
  reasons.push(`Energieklasse ${ec} — ${energyPts >= 70 ? "attraktiv für Mieter" : energyPts >= 35 ? "höhere Nebenkosten können Mieter abschrecken" : "hohe Nebenkosten, eingeschränkte Vermietbarkeit"}.`);

  // Weighted sum: 45/20/15/10/10
  let s = Math.round(locPts * 0.45 + areaPts * 0.20 + roomPts * 0.15 + agePts * 0.10 + energyPts * 0.10);

  // Objektart-Anpassung
  const pt = p.propertyType;
  const at = p.apartmentType;
  if (pt === "etw") {
    if (at === "erdgeschoss") { s -= 5; reasons.push("ETW Erdgeschoss — weniger beliebt."); }
    else if (at === "dachgeschoss") { s += 3; }
    else if (at === "penthouse") { s += 8; reasons.push("Penthouse — Premium-Segment mit hoher Nachfrage."); }
    else if (at === "souterrain") { s -= 15; reasons.push("Souterrain — schwer vermietbar."); }
  } else if (pt === "efh") {
    s += 5; reasons.push("Einfamilienhaus — hohe Familien-Nachfrage.");
  }

  // Actions
  if (p.locationGrade === "A" || p.locationGrade === "B") {
    actions.push("Mietpreisbremse prüfen (§556d BGB) — Höchstmiete 10% über Mietspiegel bei Neuvermietung.");
  }
  if (p.area >= 30 && p.area <= 80) {
    actions.push("Zielgruppe Singles/Paare — hohe Nachfrage, kurze Wiedervermietungszeiten.");
  }
  if (energyPts <= 35) {
    actions.push("Energetische Sanierung kann Vermietbarkeit und Mietpreispotenzial deutlich steigern.");
  }

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 6: Risiko-Score (15% vom Gesamt)
   0 = höchstes Risiko, 100 = kein Risiko
   ═══════════════════════════════════════════════════════════ */

function calcRisk(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const reasons: string[] = [];
  const actions: string[] = [];
  const renoCount = p.renovations.length;

  // Sanierungsbedarf (35%)
  const renoPts = renoCount === 0 ? 100 : renoCount === 1 ? 85 : renoCount === 2 ? 70 :
    renoCount === 3 ? 55 : renoCount === 4 ? 35 : renoCount === 5 ? 20 : 5;
  if (renoCount === 0) { reasons.push("Kein Sanierungsbedarf — ab Tag 1 cashflow-fähig."); }
  else {
    const items = p.renovations.map(r => RENO_LABEL[r] || r).join(", ");
    reasons.push(`${renoCount} Sanierungen nötig (${items}). Geschätzte Kosten: ${Math.round(k.renovationCosts).toLocaleString("de-DE")} €. Verhandlungsargument beim Kauf.`);
    actions.push("Verbindliche Handwerkerangebote vor Kaufvertrag einholen. Kostenpuffer 15–20% einkalkulieren.");
  }

  // Gebäudealter (20%)
  const agePts = k.age < 5 ? 100 : k.age <= 15 ? 90 : k.age <= 30 ? 75 :
    k.age <= 50 ? 60 : k.age <= 80 ? 40 : 25;
  if (k.age > 50) actions.push("Bautechnisches Gutachten empfohlen — Fokus Abdichtung, Elektrik, tragende Wände.");

  // Hausgeld-Quote (20%)
  let hgPts: number;
  if (p.hasHGBreakdown) {
    const hgPct = k.hausgeldRatio * 100;
    const label = `Bereinigte HG-Quote ${hgPct.toFixed(0)}% (${Math.round(k.ownerHausgeld)} € nicht-umlagefähig von ${Math.round(p.hausgeld)} € gesamt)`;
    if (hgPct < 15) { hgPts = 100; reasons.push(`${label} — sehr gesunder Cashflow-Puffer.`); }
    else if (hgPct <= 25) { hgPts = 80; reasons.push(`${label} — im normalen Bereich.`); }
    else if (hgPct <= 35) { hgPts = 50; reasons.push(`${label} — erhöht, WEG-Kosten prüfen.`); }
    else if (hgPct <= 50) { hgPts = 25; reasons.push(`${label} — kritisch hoch.`); }
    else { hgPts = 5; reasons.push(`${label} — Cashflow-Killer.`); }
  } else {
    const hgPct = p.rent > 0 ? (p.hausgeld / p.rent) * 100 : 0;
    const label = `Geschätzte HG-Quote ${hgPct.toFixed(0)}% (gesamt / Miete)`;
    if (hgPct < 25) { hgPts = 100; reasons.push(`${label} — gesund.`); }
    else if (hgPct <= 35) { hgPts = 80; reasons.push(`${label} — im Rahmen.`); }
    else if (hgPct <= 45) { hgPts = 55; reasons.push(`${label} — erhöht.`); }
    else if (hgPct <= 60) { hgPts = 30; reasons.push(`${label} — kritisch.`); }
    else { hgPts = 10; reasons.push(`${label} — Cashflow-Killer.`); }
    actions.push("Hausgeld aufschlüsseln für genauere Analyse — umlagefähige Kosten werden vom Mieter getragen.");
  }

  // Energieklasse (15%)
  const ec = p.energyClass;
  const energyPts = (ec === "A+" || ec === "A") ? 100 : ec === "B" ? 90 : ec === "C" ? 75 :
    ec === "D" ? 55 : ec === "E" ? 30 : ec === "F" ? 15 : 5;
  if (energyPts <= 30) {
    reasons.push(`Energieklasse ${ec} — GEG-Sanierungspflicht möglich.`);
    actions.push("Energieausweis anfordern. GEG-Erfüllungsfristen prüfen.");
  }

  // Leerstandsrisiko (10%)
  let vacPts = 60; // neutral
  if (k.cityData) {
    const vr = k.cityData.vacancyRate;
    vacPts = vr < 1 ? 100 : vr < 2 ? 85 : vr < 4 ? 60 : vr < 6 ? 35 : 15;
    if (vr >= 4) reasons.push(`Leerstandsquote in ${k.cityData.city}: ${vr}% — erhöhtes Leerstandsrisiko.`);
  }

  // Weighted sum: 35/20/20/15/10
  let s = Math.round(renoPts * 0.35 + agePts * 0.20 + hgPts * 0.20 + energyPts * 0.15 + vacPts * 0.10);

  // Location risk adjustment
  if (p.walkScore != null) {
    const riskAdj: Record<string, number> = { A: 5, B: 2, C: 0, D: -8 };
    s += riskAdj[p.locationGrade] ?? 0;
  }

  if (k.netCashflow < 0) reasons.push(`Negativer Netto-Cashflow von ${Math.round(k.netCashflow)} €/Monat vor Finanzierung.`);

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 7: Finanzierungs-Score (15% vom Gesamt)
   ═══════════════════════════════════════════════════════════ */

function calcFinancing(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];

  // Rendite-Zins-Spread (35%)
  const spread = (k.grossYield * 100) - 3.5;
  const spreadPts = spread > 4 ? 100 : spread > 3 ? 85 : spread > 2 ? 70 :
    spread > 1 ? 55 : spread > 0 ? 35 : 15;
  s += spreadPts * 0.35;
  reasons.push(`Rendite-Zins-Spread: ${spread.toFixed(1)}% (Bruttorendite ${(k.grossYield * 100).toFixed(1)}% minus 3,5% Zinsniveau).`);

  // LTV & Lage (25%)
  let ltvPts: number;
  const locGrade = p.locationGrade;
  if (locGrade === "A") { ltvPts = 100; reasons.push("A-Lage — Bank finanziert gerne, günstige Konditionen."); }
  else if (locGrade === "B") { ltvPts = 85; reasons.push("B-Lage — Standard-Beleihungswerte."); }
  else if (locGrade === "C") { ltvPts = 55; reasons.push("C-Lage — Banken kalkulieren leichte Risikoabschläge."); }
  else { ltvPts = 30; reasons.push("D-Lage — Banken verlangen höheren Eigenkapitaleinsatz."); }
  // Bonus wenn unter Markt
  if (k.cityData && k.sqmPrice < k.cityData.avgPricePerSqm * 0.85) {
    ltvPts = Math.min(100, ltvPts + 10);
    reasons.push("Kaufpreis unter Markt — positiv für Bankbewertung.");
  }
  s += ltvPts * 0.25;

  // DSCR (25%)
  const kreditrate = k.geschaetzteKreditrate;
  const netRent = p.rent - k.ownerHausgeld - k.instandhaltung;
  const dscr = kreditrate > 0 ? netRent / kreditrate : 0;
  let dscrPts: number;
  if (dscr >= 1.5) { dscrPts = 100; reasons.push(`DSCR ${dscr.toFixed(2)} — Mieteinnahmen decken ${Math.round(dscr * 100)}% der geschätzten Kreditrate.`); }
  else if (dscr >= 1.2) { dscrPts = 80; reasons.push(`DSCR ${dscr.toFixed(2)} — Kapitaldienstdeckung ausreichend (${Math.round(dscr * 100)}%).`); }
  else if (dscr >= 1.0) { dscrPts = 60; reasons.push(`DSCR ${dscr.toFixed(2)} — knapp, Stresstest empfohlen.`); }
  else if (dscr >= 0.8) { dscrPts = 40; reasons.push(`DSCR ${dscr.toFixed(2)} — Mieteinnahmen decken nicht den Kapitaldienst.`); }
  else { dscrPts = 20; reasons.push(`DSCR ${dscr.toFixed(2)} — deutlich negativer Cashflow nach Finanzierung.`); }
  // Korrektur bei niedrigen Kaufpreisen mit guter Rendite
  if (p.price < 100000 && k.grossYield >= 0.06 && dscrPts < 50) {
    dscrPts = 50;
  }
  s += dscrPts * 0.25;

  // Sanierungsbedarf (15%)
  const renoCount = p.renovations.length;
  const renoPts = renoCount === 0 ? 100 : renoCount <= 2 ? 75 : renoCount <= 4 ? 45 : 20;
  s += renoPts * 0.15;
  if (renoCount > 0) reasons.push(`${renoCount} Sanierungen — Banken können zusätzliches Eigenkapital verlangen.`);

  // Actions — NIEMALS Interhyp/Check24 empfehlen
  actions.push("Lassen Sie Ihre Finanzierung kostenlos von unseren Experten prüfen — unverbindlich, innerhalb von 24h.");
  if (dscr >= 1.0) actions.push("Stresstest bei 5,5% Zinssatz durchführen.");
  if ((ENERGY_RANK[p.energyClass] || 50) >= 76) actions.push("KfW-Programm 261/262 prüfen — bis zu 150.000 € zinsgünstiges Darlehen.");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 8: Zukunfts-Score (15% vom Gesamt)
   ═══════════════════════════════════════════════════════════ */

function calcProjection(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];

  // Bevölkerungstrend (40%)
  let trendPts = 60; // stable default
  if (k.cityData) {
    const t = k.cityData.populationTrend;
    trendPts = t === "growing" ? 100 : t === "stable" ? 60 : 20;
    reasons.push(`${k.cityData.city} — Bevölkerungstrend: ${t === "growing" ? "wachsend" : t === "stable" ? "stabil" : "schrumpfend"}.`);
  } else {
    reasons.push("Stadt nicht in Datenbank — neutraler Bevölkerungstrend angenommen.");
  }
  s += trendPts * 0.40;

  // Leerstandsquote (25%)
  let vacPts = 55;
  if (k.cityData) {
    const vr = k.cityData.vacancyRate;
    vacPts = vr < 1 ? 100 : vr < 2 ? 80 : vr < 4 ? 55 : vr < 6 ? 30 : 10;
    if (vr < 1) reasons.push(`Leerstandsquote ${vr}% — extrem angespannter Wohnungsmarkt.`);
    else if (vr < 2) reasons.push(`Leerstandsquote ${vr}% — niedriger Leerstand, stabile Nachfrage.`);
    else if (vr >= 4) reasons.push(`Leerstandsquote ${vr}% — erhöhter Leerstand, Risiko.`);
  }
  s += vacPts * 0.25;

  // Energieklasse Zukunftssicherheit (20%)
  const ec = p.energyClass;
  const energyFuturePts = (ec === "A+" || ec === "A") ? 100 : ec === "B" ? 90 : ec === "C" ? 70 :
    ec === "D" ? 50 : ec === "E" ? 30 : 10;
  s += energyFuturePts * 0.20;
  if (energyFuturePts >= 70) reasons.push(`Energieklasse ${ec} — zukunftssicher gegenüber GEG-Verschärfungen.`);
  else if (energyFuturePts >= 30) reasons.push(`Energieklasse ${ec} — mittelfristig regulatorisch vertretbar.`);
  else reasons.push(`Energieklasse ${ec} — Sanierungspflicht innerhalb der nächsten Dekade möglich.`);

  // Mietentwicklungspotenzial (15%)
  let mietPts = 50;
  if (k.cityData) {
    const rentPerSqm = p.area > 0 ? p.rent / p.area : 0;
    const ratio = k.cityData.avgRentPerSqm > 0 ? rentPerSqm / k.cityData.avgRentPerSqm : 1;
    if (ratio < 0.80) { mietPts = 100; reasons.push(`Aktuelle Miete ${rentPerSqm.toFixed(1)} €/m² liegt deutlich unter Durchschnitt (${k.cityData.avgRentPerSqm} €/m²) — Mieterhöhung möglich.`); }
    else if (ratio < 0.95) { mietPts = 75; }
    else if (ratio <= 1.05) { mietPts = 50; }
    else { mietPts = 25; reasons.push(`Aktuelle Miete bereits über Stadtdurchschnitt — kaum Steigerungspotenzial.`); }
  }
  s += mietPts * 0.15;

  // Actions
  if (trendPts <= 20) actions.push("ÖPNV-Ausbau und Gewerbeansiedlung in der Region beobachten.");
  if (energyFuturePts < 50) actions.push("Proaktive energetische Sanierung kann Energieklasse um 1–2 Stufen verbessern.");
  if (mietPts >= 75) actions.push("Mietsteigerungspotenzial nach §558 BGB prüfen — 15–20% in 3 Jahren möglich.");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 9: Energie-Score (10% vom Gesamt)
   ═══════════════════════════════════════════════════════════ */

function calcEnergy(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const reasons: string[] = [];
  const actions: string[] = [];
  const ec = p.energyClass;

  // Energieklasse (60%)
  const classRank = ENERGY_RANK[ec] || 50;

  // GEG-Risiko (25%)
  let gegPts: number;
  if (ec === "A+" || ec === "A" || ec === "B" || ec === "C") { gegPts = 100; }
  else if (ec === "D") { gegPts = 70; }
  else if (ec === "E") { gegPts = 40; }
  else { gegPts = 10; } // F, G, H

  // Geschätzte Energiekosten (15%)
  const costPerSqm = ENERGY_COST_SQM[ec] || 15;
  const monthlyEnergyCost = Math.round(costPerSqm * p.area / 12);
  const costPts = (ec === "A+" || ec === "A") ? 100 : ec === "B" ? 85 : ec === "C" ? 70 :
    ec === "D" ? 55 : ec === "E" ? 35 : ec === "F" ? 20 : 5;

  let s = Math.round(classRank * 0.60 + gegPts * 0.25 + costPts * 0.15);

  reasons.push(`Energieklasse ${ec} — geschätzte Energiekosten: ~${costPerSqm} €/m²/Jahr (~${monthlyEnergyCost} €/Monat für diese Wohnung).`);

  if (classRank >= 76) reasons.push(`Keine regulatorischen Risiken.`);
  else if (gegPts >= 70) reasons.push(`Mittelfristig regulatorisch vertretbar.`);
  else reasons.push(`GEG §72 kann Heizungstauschpflicht auslösen.`);

  if (k.age <= 10) { s += 5; }
  else if (k.age <= 25) { s += 2; }

  // Renovation impact
  if (p.renovations.includes("heizung") && classRank < 50) {
    s -= 5;
    actions.push("Wärmepumpe, Pellets oder Fernwärmeanschluss prüfen (GEG §71 — 65%-EE-Vorgabe).");
  }
  if (p.renovations.includes("fenster")) { actions.push("Fenstertausch zu Dreifachverglasung — KfW-förderfähig."); }
  if (p.renovations.includes("fassade")) { actions.push("Fassadendämmung (WDVS) — förderfähig über BEG-EM."); }

  // GEG hard caps
  if (ec === "E") { s = Math.min(s, 40); }
  else if (ec === "F") { s = Math.min(s, 25); }
  else if (ec === "G") { s = Math.min(s, 15); }
  else if (ec === "H") { s = Math.min(s, 10); }

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   TEIL 3: Value creation potential after renovation
   ═══════════════════════════════════════════════════════════ */

function calcValuePotential(p: PropertyInput, k: KPIs, renovationTotal: number): ValuePotential | null {
  if (renovationTotal <= 0 || p.renovations.length === 0) return null;

  const effectivePrice = p.price + renovationTotal;
  const effectiveSqmPrice = p.area > 0 ? effectivePrice / p.area : 0;

  let marketSqmPrice: number;
  if (k.cityData) {
    // Use city avg price with location correction
    const locMult: Record<string, number> = { A: 1.15, B: 1.0, C: 0.85, D: 0.70 };
    marketSqmPrice = Math.round(k.cityData.avgPricePerSqm * (locMult[p.locationGrade] || 0.85));
  } else {
    // Fallback: current sqm price * 1.15 improvement
    const sqmPrice = p.area > 0 ? p.price / p.area : 0;
    const locMult: Record<string, number> = { A: 1.15, B: 1.0, C: 0.85, D: 0.70 };
    marketSqmPrice = Math.round(sqmPrice * (locMult[p.locationGrade] || 0.85) * 1.15);
  }

  const estimatedMarketValue = marketSqmPrice * p.area;
  const delta = estimatedMarketValue - effectivePrice;

  let scoreBonus = 0;
  let message = "";
  if (effectivePrice < estimatedMarketValue * 0.70) {
    scoreBonus = 8;
    message = `Nach Sanierung (~${Math.round(renovationTotal).toLocaleString("de-DE")} €) liegt der effektive Kaufpreis bei ${Math.round(effectiveSqmPrice).toLocaleString("de-DE")} €/m², deutlich unter dem geschätzten Marktwert von ${marketSqmPrice.toLocaleString("de-DE")} €/m². Mögliche Wertsteigerung: ~${Math.round(delta).toLocaleString("de-DE")} €.`;
  } else if (effectivePrice < estimatedMarketValue * 0.85) {
    scoreBonus = 4;
    message = `Nach Sanierung (~${Math.round(renovationTotal).toLocaleString("de-DE")} €) liegt der effektive Kaufpreis bei ${Math.round(effectiveSqmPrice).toLocaleString("de-DE")} €/m², unter dem Marktdurchschnitt von ${marketSqmPrice.toLocaleString("de-DE")} €/m². Mögliche Wertsteigerung: ~${Math.round(delta).toLocaleString("de-DE")} €.`;
  } else if (effectivePrice > estimatedMarketValue) {
    scoreBonus = -5;
    message = `Nach Sanierung (~${Math.round(renovationTotal).toLocaleString("de-DE")} €) liegt der effektive Kaufpreis bei ${Math.round(effectiveSqmPrice).toLocaleString("de-DE")} €/m² — über dem geschätzten Marktwert von ${marketSqmPrice.toLocaleString("de-DE")} €/m².`;
  } else {
    message = `Nach Sanierung (~${Math.round(renovationTotal).toLocaleString("de-DE")} €) liegt der effektive Kaufpreis bei ${Math.round(effectiveSqmPrice).toLocaleString("de-DE")} €/m², nahe am Marktwert von ${marketSqmPrice.toLocaleString("de-DE")} €/m².`;
  }

  return { effectivePrice, effectiveSqmPrice, estimatedMarketValue, marketSqmPrice, delta, scoreBonus, message };
}

/* ═══════════════════════════════════════════════════════════
   Confidence / Badge (TEIL 1)
   ═══════════════════════════════════════════════════════════ */

function calcConfidence(p: PropertyInput, plausibility: PlausibilityCheck[]): ScoringResult["confidence"] {
  const warnings = plausibility.filter(c => c.level === "warning").length;
  const errors = plausibility.filter(c => c.level === "error").length;

  if (errors > 0) return "Eingaben prüfen";
  if (warnings >= 2) return "Geringe Bewertungssicherheit";
  if (warnings === 1) return "Mittlere Bewertungssicherheit";
  if (!p.hasHGBreakdown || !p.walkScore) return "Mittlere Bewertungssicherheit";
  return "Hohe Bewertungssicherheit";
}

/* ═══════════════════════════════════════════════════════════
   Stärken + Risiken (TEIL 12)
   ═══════════════════════════════════════════════════════════ */

function generateStrengths(p: PropertyInput, k: KPIs): string[] {
  const l: string[] = [];
  if (k.effectiveGrossYield >= 0.06) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)}% deutlich über Marktdurchschnitt.`);
  else if (k.effectiveGrossYield >= 0.05) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)}% übertrifft den Bundesdurchschnitt.`);
  if (k.hausgeldRatio <= 0.25) l.push(`${p.hasHGBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote nur ${(k.hausgeldRatio * 100).toFixed(0)}% — gesunder Cashflow-Puffer.`);
  if (p.renovations.length === 0) l.push("Kein Sanierungsbedarf — stabilisiertes Objekt, ab Tag 1 cashflow-fähig.");
  if ((ENERGY_RANK[p.energyClass] || 50) >= 76) l.push(`Energieklasse ${p.energyClass} — zukunftssicher gegenüber GEG-Verschärfungen.`);
  if (p.locationGrade === "A" || p.locationGrade === "B") l.push(`${LOCATION_LABEL[p.locationGrade]} — geringe Leerstandsquote, günstige Bankkonditionen.`);
  if (k.effectiveFactor <= 20) l.push(`Effektiver Kaufpreisfaktor ${k.effectiveFactor.toFixed(1)}x unter dem Metropol-Korridor.`);
  if (k.netCashflow >= 400) l.push(`${Math.round(k.netCashflow)} € monatlicher Nettocashflow — tragfähige Kapitaldienstdeckung.`);
  if (k.cityData && k.cityData.vacancyRate < 1) l.push(`Leerstandsquote nur ${k.cityData.vacancyRate}% — extrem angespannter Markt.`);
  if (k.cityData && k.cityData.populationTrend === "growing") l.push(`${k.cityData.city} — wachsende Bevölkerung, steigende Nachfrage.`);
  return l.length > 0 ? l : ["Objekt bewegt sich in allen Dimensionen nahe am Marktdurchschnitt."];
}

function generateRisks(p: PropertyInput, k: KPIs): string[] {
  const l: string[] = [];
  if (k.effectiveGrossYield < 0.03) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)}% unter Break-even-Schwelle.`);
  else if (k.effectiveGrossYield < 0.04) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)}% — minimaler Spielraum bei Zinsanstieg.`);
  if (k.hausgeldRatio >= 0.5) l.push(`${p.hasHGBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote ${(k.hausgeldRatio * 100).toFixed(0)}% — hohe nicht-umlagefähige WEG-Kosten.`);
  if (p.renovations.length >= 4) l.push(`${p.renovations.length} Gewerke sanierungsbedürftig — geschätzte Kosten ${Math.round(k.renovationCosts).toLocaleString("de-DE")} €.`);
  else if (p.renovations.length >= 2) l.push(`${p.renovations.length} Sanierungen mit Ausführungsrisiken und Kapitalbedarf.`);
  if ((ENERGY_RANK[p.energyClass] || 50) < 35) l.push(`Energieklasse ${p.energyClass} — regulatorischer Druck durch GEG 2024.`);
  if (p.locationGrade === "D") l.push("Lageklasse D — erhöhtes Leerstandsrisiko, eingeschränkte Exit-Liquidität.");
  if (k.cityData && k.cityData.vacancyRate >= 4) l.push(`Leerstandsquote ${k.cityData.vacancyRate}% in ${k.cityData.city} — strukturelles Leerstandsrisiko.`);
  if (k.cityData && k.cityData.populationTrend === "shrinking") l.push(`${k.cityData.city} — schrumpfende Bevölkerung, sinkende Nachfrage.`);
  if (k.age >= 60) l.push(`Gebäudealter ${k.age} Jahre — Gutachten empfohlen.`);
  if (k.netCashflow < 0) l.push(`Negativer Netto-Cashflow ${Math.round(k.netCashflow)} €/Monat.`);
  if (k.effectiveFactor >= 30) l.push(`Effektiver Kaufpreisfaktor ${k.effectiveFactor.toFixed(1)}x — primär Wertsteigerungswette.`);
  return l.length > 0 ? l : ["Keine wesentlichen Risiken — standardmäßige Due Diligence ausreichend."];
}

/* ═══════════════════════════════════════════════════════════
   TEIL 10: Gesamt-Score — Haupt-Entry-Point
   ═══════════════════════════════════════════════════════════ */

export function computeScore(p: PropertyInput): ScoringResult {
  const k = deriveKPIs(p);

  // TEIL 1: Plausibility checks
  const plausibility = runPlausibilityChecks(p);

  // TEIL 11: Renovation estimate
  const renoEst = p.renovations.length > 0
    ? estimateRenovationCosts(p.propertyType, p.area, p.renovations, p.unitCount)
    : null;

  // TEIL 3: Value potential
  const valuePotential = calcValuePotential(p, k, renoEst?.total ?? 0);

  // TEIL 9: Energy explanation with cost
  const costPerSqm = ENERGY_COST_SQM[p.energyClass] || 15;
  const monthlyEnergyCost = Math.round(costPerSqm * p.area / 12);
  const baseExplanation = ENERGY_EXPLANATION[p.energyClass] || `Energieklasse ${p.energyClass} — keine detaillierten Informationen verfügbar.`;
  const energyExplanation = `${baseExplanation} Geschätzte Energiekosten: ~${costPerSqm} €/m²/Jahr (~${monthlyEnergyCost} €/Monat für diese Wohnung).`;

  const inv = calcInvestment(p, k);
  const rent = calcRentability(p, k);
  const risk = calcRisk(p, k);
  const fin = calcFinancing(p, k);
  const proj = calcProjection(p, k);
  const energy = calcEnergy(p, k);

  const subscores: SubscoreEntry[] = [
    { key: "investment", label: "Investitions-Score", value: inv.value, weight: 30, oneLiner: `Eff. Rendite ${(k.effectiveGrossYield * 100).toFixed(1)}%, Faktor ${k.effectiveFactor.toFixed(1)}x, ${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m²`, reasons: inv.reasons, actions: inv.actions },
    { key: "rentability", label: "Vermietbarkeits-Score", value: rent.value, weight: 15, oneLiner: `Lageklasse ${p.locationGrade}, ${p.area} m², Baujahr ${p.year}`, reasons: rent.reasons, actions: rent.actions },
    { key: "risk", label: "Risiko-Score", value: risk.value, weight: 15, oneLiner: `${p.renovations.length} Sanierungen, ${(k.hausgeldRatio * 100).toFixed(0)}% ${p.hasHGBreakdown ? "bereinigte" : "gesch."} HG-Quote, ${k.age} J. alt`, reasons: risk.reasons, actions: risk.actions },
    { key: "financing", label: "Finanzierungs-Score", value: fin.value, weight: 15, oneLiner: `Spread ${((k.grossYield * 100) - 3.5).toFixed(1)}%, DSCR, Lage ${p.locationGrade}`, reasons: fin.reasons, actions: fin.actions },
    { key: "projection", label: "Zukunfts-Score", value: proj.value, weight: 15, oneLiner: `${k.cityData?.populationTrend === "growing" ? "Wachsend" : k.cityData?.populationTrend === "shrinking" ? "Schrumpfend" : "Stabil"}, Energie ${p.energyClass}, Leerstand ${k.cityData?.vacancyRate ?? "?"}%`, reasons: proj.reasons, actions: proj.actions },
    { key: "energy", label: "Energie-Score", value: energy.value, weight: 10, oneLiner: `Klasse ${p.energyClass}, ~${costPerSqm} €/m²/Jahr, Hülle ${!p.renovations.includes("fenster") && !p.renovations.includes("fassade") ? "intakt" : "san.bedürftig"}`, reasons: energy.reasons, actions: energy.actions },
  ];

  // TEIL 10: Gewichteter Gesamt-Score
  let totalScore = Math.round(subscores.reduce((sum, s) => sum + s.value * (s.weight / 100), 0));

  // MALUS bei extremen Werten
  const grossYieldPct = k.grossYield * 100;
  if (grossYieldPct > 25) {
    totalScore = Math.min(totalScore, 60);
  }
  if (p.renovations.length >= 6) {
    totalScore -= 10;
  }
  if (p.energyClass === "G" || p.energyClass === "H") {
    totalScore -= 5;
  }
  if (k.cityData && k.cityData.vacancyRate > 6) {
    totalScore -= 5;
  }

  // BONUS für Wertschöpfungspotenzial
  if (valuePotential) {
    totalScore += valuePotential.scoreBonus;
  }

  return {
    totalScore: clamp(totalScore),
    confidence: calcConfidence(p, plausibility),
    subscores,
    kpis: {
      netYield: k.netYield,
      grossYield: k.grossYield,
      factor: k.factor,
      sqmPrice: k.sqmPrice,
      hausgeldRatio: k.hausgeldRatio,
      netCashflow: k.netCashflow,
      hausgeldGesamt: p.hausgeld,
      hausgeldNichtUmlagefaehig: k.ownerHausgeld,
      hasHGBreakdown: !!p.hasHGBreakdown,
    },
    strengths: generateStrengths(p, k),
    risks: generateRisks(p, k),
    plausibility,
    renovationEstimate: renoEst,
    valuePotential,
    energyExplanation,
  };
}
