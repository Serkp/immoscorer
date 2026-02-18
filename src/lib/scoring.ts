/* ═══════════════════════════════════════════════════════════
   ImmoScorer — Deterministische Scoring-Engine
   Keine KI, keine Randomness. Pure Berechnungen.
   ═══════════════════════════════════════════════════════════ */

export interface PropertyInput {
  street: string;
  city: string;
  price: number;
  rent: number;
  hausgeld: number;
  area: number;
  year: number;
  energyClass: string;
  locationGrade: string;
  renovations: string[];
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

export interface ScoringResult {
  totalScore: number;
  confidence: "Hohe Bewertungssicherheit" | "Mittlere Bewertungssicherheit" | "Geringe Bewertungssicherheit";
  subscores: SubscoreEntry[];
  kpis: {
    netYield: number;
    grossYield: number;
    factor: number;
    sqmPrice: number;
    hausgeldRatio: number;
    netCashflow: number;
  };
  strengths: string[];
  risks: string[];
}

/* ─── Lookup-Tabellen ─── */

const ENERGY_RANK: Record<string, number> = {
  "A+": 100, A: 88, B: 76, C: 62, D: 48, E: 35, F: 22, G: 12, H: 5,
};

const LOCATION_RANK: Record<string, number> = { A: 100, B: 72, C: 45, D: 20 };

const LOCATION_LABEL: Record<string, string> = {
  A: "Top-Lage", B: "gute Lage", C: "durchschnittliche Lage", D: "Entwicklungslage",
};

const RENO_LABEL: Record<string, string> = {
  dach: "Dach", fassade: "Fassade", fenster: "Fenster",
  bad: "Bad", elektrik: "Elektrik", heizung: "Heizung",
};

const RENO_COST: Record<string, string> = {
  dach: "15.000–40.000 €", fassade: "20.000–50.000 €", fenster: "8.000–20.000 €",
  bad: "10.000–25.000 €", elektrik: "8.000–18.000 €", heizung: "12.000–35.000 €",
};

/* ─── Hilfsfunktionen ─── */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function deriveKPIs(p: PropertyInput) {
  const annualRent = p.rent * 12;
  const grossYield = annualRent / p.price;
  const netCashflow = p.rent - p.hausgeld;
  const netYield = (netCashflow * 12) / p.price;
  const factor = p.price / annualRent;
  const sqmPrice = p.price / p.area;
  const hausgeldRatio = p.hausgeld / p.rent;
  const age = new Date().getFullYear() - p.year;
  return { annualRent, grossYield, netCashflow, netYield, factor, sqmPrice, hausgeldRatio, age };
}

type KPIs = ReturnType<typeof deriveKPIs>;

/* ═══════════════════════════════════════════════════════════
   1. Investitions-Score (30%)
   ═══════════════════════════════════════════════════════════ */

function calcInvestment(_p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];
  const yieldPct = (k.grossYield * 100).toFixed(1);

  if (k.grossYield >= 0.08) { s += 40; reasons.push(`Bruttorendite ${yieldPct} % liegt weit über dem Marktdurchschnitt von 4 % — exzellentes Ertragsprofil.`); }
  else if (k.grossYield >= 0.06) { s += 32; reasons.push(`Bruttorendite ${yieldPct} % deutlich über dem Bundesdurchschnitt — guter Einkommenspuffer gegen steigende Zinsen.`); }
  else if (k.grossYield >= 0.05) { s += 24; reasons.push(`Bruttorendite ${yieldPct} % übertrifft den Marktdurchschnitt und ermöglicht positiven Leverage.`); }
  else if (k.grossYield >= 0.04) { s += 16; reasons.push(`Bruttorendite ${yieldPct} % ist marktüblich, lässt jedoch wenig Spielraum bei steigenden Zinsen.`); }
  else if (k.grossYield >= 0.03) { s += 8; reasons.push(`Bruttorendite ${yieldPct} % liegt unter der Rentabilitätsschwelle für fremdfinanzierte Akquisitionen (3,5–4,5 %).`); }
  else { s += 2; reasons.push(`Bruttorendite ${yieldPct} % ist für ein Kapitalanlage-Investment kritisch niedrig.`); }

  const f = k.factor.toFixed(1);
  if (k.factor <= 15) { s += 30; reasons.push(`Kaufpreisfaktor ${f}x ist außergewöhnlich attraktiv — schnelle Amortisation.`); }
  else if (k.factor <= 20) { s += 24; reasons.push(`Kaufpreisfaktor ${f}x liegt deutlich unter dem Metropol-Korridor von 22–28x.`); }
  else if (k.factor <= 25) { s += 16; reasons.push(`Kaufpreisfaktor ${f}x ist marktüblich für deutsche B-/C-Standorte.`); }
  else if (k.factor <= 30) { s += 8; reasons.push(`Kaufpreisfaktor ${f}x impliziert eine Amortisation von über 25 Jahren.`); }
  else { s += 2; reasons.push(`Kaufpreisfaktor ${f}x — die Investmentthese muss primär auf Wertsteigerung basieren.`); }

  const sqm = Math.round(k.sqmPrice).toLocaleString("de-DE");
  if (k.sqmPrice <= 1500) { s += 30; reasons.push(`Einstiegspreis ${sqm} €/m² weit unter dem Marktmedian — organisches Upside durch Preiskonvergenz.`); }
  else if (k.sqmPrice <= 2500) { s += 24; reasons.push(`${sqm} €/m² bietet ein attraktives Preisniveau mit Wertsteigerungspotenzial.`); }
  else if (k.sqmPrice <= 3500) { s += 18; reasons.push(`${sqm} €/m² entspricht dem Marktdurchschnitt für solide Standorte.`); }
  else if (k.sqmPrice <= 5000) { s += 10; reasons.push(`${sqm} €/m² liegt im gehobenen Segment — limitiertes Preis-Upside.`); }
  else { s += 3; reasons.push(`${sqm} €/m² im Premium-Segment — weiteres Upside nur bei absoluter Spitzenmikrolage.`); }

  if (k.grossYield >= 0.05) actions.push("Rendite trägt positiven Leverage — modellieren Sie 80 % LTV bei 4 % Annuität zur Cashflow-Validierung.");
  else if (k.grossYield >= 0.04) actions.push("Grenzwertige Rendite — zielen Sie auf 70–75 % LTV oder verhandeln Sie 5–10 % Preisnachlass.");
  else actions.push("Rendite unter 4 % macht fremdfinanzierte Akquisition riskant — höheren Eigenkapitaleinsatz einkalkulieren.");

  if (k.factor >= 25) actions.push("Verhandeln Sie 10–15 % unter Angebotspreis, um den Faktor in den Zielkorridor von 20–22x zu senken.");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   2. Vermietbarkeits-Score (15%)
   ═══════════════════════════════════════════════════════════ */

function calcRentability(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];
  const locRank = LOCATION_RANK[p.locationGrade] || 45;

  s += Math.round((locRank / 100) * 40);
  reasons.push(`${LOCATION_LABEL[p.locationGrade] || "Unbekannte Lage"} (Klasse ${p.locationGrade}) — ${
    locRank >= 72 ? "geringe Leerstandsquote und planbare Mietnachfrage gemäß §558 BGB Mietspiegel." :
    locRank >= 45 ? "durchschnittliches Vermietungspotenzial, Mietspiegel als Orientierung für §558 BGB Mieterhöhungen." :
    "erhöhtes Leerstandsrisiko, eingeschränkte Mietpreisbremse nach §556d BGB."
  }`);

  if (p.area >= 50 && p.area <= 85) { s += 30; reasons.push(`${p.area} m² Wohnfläche im nachfragestärksten Segment — ideal für Singles und Paare.`); }
  else if (p.area >= 35 && p.area <= 100) { s += 22; reasons.push(`${p.area} m² ist gut vermietbar und deckt breite Zielgruppen ab.`); }
  else if (p.area > 100) { s += 12; reasons.push(`${p.area} m² — große Einheiten sind schwieriger vermietbar mit höherem m²-Leerstandsverlust.`); }
  else { s += 8; reasons.push(`${p.area} m² ist eine sehr kleine Einheit — eingeschränkter Mieterkreis.`); }

  if (k.age <= 10) { s += 30; reasons.push(`Neubau (${p.year}) — moderne Ausstattung, hohe Mieterakzeptanz.`); }
  else if (k.age <= 25) { s += 24; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — zeitgemäße Bausubstanz.`); }
  else if (k.age <= 40) { s += 16; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — solide Substanz, mittelfristiger Modernisierungsbedarf möglich.`); }
  else if (k.age <= 60) { s += 8; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — ältere Bausubstanz, Mieter erwarten ggf. Modernisierungsstandard.`); }
  else { s += 3; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — vor modernen Baustandards, Vollgutachten empfohlen.`); }

  if (locRank >= 72) actions.push("Mietpreisbremse prüfen (§556d BGB) — Höchstmiete 10 % über Mietspiegel bei Neuvermietung.");
  if (p.area >= 50 && p.area <= 85) actions.push("Zielgruppe Singles/Paare — hohe Nachfrage, kurze Wiedervermietungszeiten.");
  if (k.age >= 40) actions.push("Modernisierungskosten nach §559 BGB zu 8 % p.a. auf Mieter umlegbar (gedeckelt §559 Abs. 3a BGB).");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   3. Risiko-Score (15%)
   ═══════════════════════════════════════════════════════════ */

function calcRisk(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 100;
  const reasons: string[] = [];
  const actions: string[] = [];
  const renoCount = p.renovations.length;

  s -= renoCount * 12;
  if (renoCount === 0) {
    reasons.push("Kein Sanierungsbedarf — das Objekt ist stabilisiert und ab Tag 1 cashflow-fähig.");
  } else {
    const items = p.renovations.map(r => RENO_LABEL[r] || r).join(", ");
    const costs = p.renovations.map(r => RENO_COST[r]).filter(Boolean).join("; ");
    reasons.push(`${renoCount} von 6 Gewerken sanierungsbedürftig (${items}). Geschätzte Bandbreiten: ${costs}.`);
    actions.push("Verbindliche Handwerkerangebote vor Kaufvertrag einholen. Kostenpuffer 15–20 % einkalkulieren.");
  }

  if (k.hausgeldRatio >= 0.6) {
    s -= 10;
    reasons.push(`Hausgeld absorbiert ${(k.hausgeldRatio * 100).toFixed(0)} % der Bruttomiete — deutet auf hohe WEG-Kosten oder aufgestaute Rücklagen hin.`);
    actions.push("WEG-Wirtschaftsplan und Hausgeldabrechnung der letzten 3 Jahre anfordern (§28 WEG).");
  } else if (k.hausgeldRatio >= 0.45) {
    s -= 5;
    reasons.push(`Hausgeld-Quote bei ${(k.hausgeldRatio * 100).toFixed(0)} % — überschreitet die empfohlene 30 %-Obergrenze.`);
  } else if (k.hausgeldRatio <= 0.25) {
    reasons.push(`Hausgeld-Quote nur ${(k.hausgeldRatio * 100).toFixed(0)} % der Miete — gesunder Cashflow-Puffer.`);
  }

  if (k.age >= 80) { s -= 20; reasons.push(`${k.age} Jahre Gebäudealter — erhöhtes Risiko für verdeckte Mängel.`); actions.push("Unabhängiges Baugutachten beauftragen. Schadstoffprüfung (Asbest, PCB) empfohlen."); }
  else if (k.age >= 60) { s -= 14; reasons.push(`${k.age} Jahre — vor modernen Baustandards, latente Mängel möglich.`); actions.push("Bautechnisches Gutachten empfohlen — Fokus Abdichtung, Elektrik, tragende Wände."); }
  else if (k.age >= 40) { s -= 8; reasons.push(`${k.age} Jahre — mittelalte Substanz, planmäßige Instandhaltung prüfen.`); }
  else if (k.age >= 20) { s -= 3; reasons.push(`${k.age} Jahre — relativ junge Bausubstanz mit moderatem Risikoprofil.`); }
  else { reasons.push(`Nur ${k.age} Jahre alt — niedriges Substanzrisiko.`); }

  if (p.renovations.includes("dach")) actions.push("Dacherneuerung höchstes Capex-Risiko (15.000–40.000 € Anteil) — WEG-Beschluss und Sonderumlage prüfen.");
  if (p.renovations.includes("heizung") && (ENERGY_RANK[p.energyClass] || 50) < 50) actions.push("Heizungstausch bei schlechter Energieklasse kann gemäß GEG §§71–72 gebäudeweite Sanierung auslösen.");

  if (k.netCashflow < 0) { s -= 5; reasons.push(`Negativer Netto-Cashflow von ${Math.round(k.netCashflow)} €/Monat vor Finanzierung.`); }

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   4. Finanzierungs-Score (15%)
   ═══════════════════════════════════════════════════════════ */

function calcFinancing(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];
  const locRank = LOCATION_RANK[p.locationGrade] || 45;
  const energyRank = ENERGY_RANK[p.energyClass] || 50;

  s += Math.round((locRank / 100) * 30);
  reasons.push(`Lageklasse ${p.locationGrade} — ${locRank >= 72 ? "günstige Bankkonditionen und höhere Beleihungsausläufe." : locRank >= 45 ? "Standard-Beleihungswerte." : "Banken kalkulieren Risikoabschläge."}`);

  if (k.grossYield >= 0.05) { s += 25; reasons.push("Rendite über 5 % — positiver Leverage bei aktuellen Zinsen sicher darstellbar."); }
  else if (k.grossYield >= 0.04) { s += 18; reasons.push("Rendite um 4 % — Kapitaldienstdeckung knapp, Stresstest empfohlen."); }
  else if (k.grossYield >= 0.03) { s += 10; reasons.push("Rendite unter 4 % — negativer Leverage bei marktüblichen Zinsen wahrscheinlich."); }
  else { s += 3; reasons.push("Rendite unter 3 % — Fremdfinanzierung wirtschaftlich kaum darstellbar."); }

  s += Math.max(0, 25 - p.renovations.length * 5);
  if (p.renovations.length === 0) reasons.push("Kein Sanierungsbedarf — einfacheres Underwriting, keine Nachfinanzierung.");
  else reasons.push(`${p.renovations.length} Sanierungen — Banken können zusätzliches Eigenkapital (30 %+) verlangen.`);

  s += Math.round((energyRank / 100) * 20);
  if (energyRank >= 76) { reasons.push(`Energieklasse ${p.energyClass} — KfW-Förderung möglich.`); actions.push("KfW-Programm 261/262 prüfen — bis zu 150.000 € zinsgünstiges Darlehen."); }
  else if (energyRank < 35) { reasons.push(`Energieklasse ${p.energyClass} — GEG-Konformitätsrisiko, möglicher Beleihungswert-Abschlag.`); actions.push("Energieausweis anfordern. GEG-Erfüllungsfristen prüfen."); }

  if (k.grossYield >= 0.04) actions.push("Stresstest bei 5,5 % Zinssatz durchführen.");
  actions.push("Mindestens 3 Finanzierungsangebote einholen (Interhyp, Direktbanken, Hausbank).");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   5. Zukunfts-Score (15%)
   ═══════════════════════════════════════════════════════════ */

function calcProjection(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];
  const locRank = LOCATION_RANK[p.locationGrade] || 45;
  const energyRank = ENERGY_RANK[p.energyClass] || 50;

  const locGrowth: Record<string, number> = { A: 20, B: 25, C: 30, D: 35 };
  s += locGrowth[p.locationGrade] || 20;
  if (locRank >= 72) reasons.push(`Lageklasse ${p.locationGrade} — stabiles Wertwachstum, hohe Wiederverkaufsliquidität.`);
  else if (locRank >= 45) reasons.push(`Lageklasse ${p.locationGrade} — gutes Mietwachstumspotenzial durch Infrastrukturentwicklung.`);
  else { reasons.push(`Lageklasse ${p.locationGrade} — hohes Aufholpotenzial, abhängig von Infrastrukturkatalysatoren.`); actions.push("ÖPNV-Ausbau und Gewerbeansiedlung in der Region beobachten."); }

  if (energyRank >= 76) { s += 30; reasons.push(`Energieklasse ${p.energyClass} — zukunftssicher gegenüber GEG-Verschärfungen.`); }
  else if (energyRank >= 48) { s += 18; reasons.push(`Energieklasse ${p.energyClass} — mittelfristig regulatorisch vertretbar.`); }
  else { s += 5; reasons.push(`Energieklasse ${p.energyClass} — Sanierungspflicht innerhalb der nächsten Dekade möglich.`); }

  if (locRank >= 72 && k.grossYield < 0.04) { s += 20; reasons.push("Mietwachstum gemäß §558 BGB bis Mietspiegel-Obergrenze realisierbar."); actions.push("Mietsteigerungspotenzial nach §558 BGB prüfen — 15–20 % in 3 Jahren möglich."); }
  else if (locRank >= 72) { s += 12; reasons.push("Premiumlage sichert Mietwachstum über Inflation."); }
  else { s += 6; reasons.push("Mietwachstum an wirtschaftliche Entwicklung der Region gekoppelt."); }

  if (k.age >= 10 && k.age <= 35) s += 15;
  else if (k.age < 10) s += 8;
  else s += 5;

  if (k.grossYield >= 0.06 && locRank < 72) actions.push("Cashflow-first-Strategie — Einnahmen akkumulieren, Katalysatoren beobachten.");
  if (k.grossYield < 0.04 && locRank >= 72) actions.push("Wertsteigerungswette — 10-Jahres-Preistrends validieren.");
  if (energyRank < 48) actions.push("Proaktive energetische Sanierung kann Energieklasse um 1–2 Stufen verbessern.");

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   6. Energie-Score (10%)
   ═══════════════════════════════════════════════════════════ */

function calcEnergy(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const energyRank = ENERGY_RANK[p.energyClass] || 50;
  let s = energyRank;
  const reasons: string[] = [];
  const actions: string[] = [];

  if (energyRank >= 76) reasons.push(`Energieklasse ${p.energyClass} — hervorragend. Keine regulatorischen Risiken.`);
  else if (energyRank >= 48) reasons.push(`Energieklasse ${p.energyClass} — akzeptabel, mittelfristig Modernisierung sinnvoll.`);
  else reasons.push(`Energieklasse ${p.energyClass} — schwach. GEG §72 kann Heizungstauschpflicht auslösen.`);

  if (k.age <= 10) { s += 10; reasons.push("Jüngere Bausubstanz — aktuelle GEG-Standards bei Errichtung eingehalten."); }
  else if (k.age <= 25) s += 5;

  if (p.renovations.includes("heizung") && energyRank < 50) {
    s -= 10;
    reasons.push("Sanierungsbedürftige Heizung bei schlechter Energieklasse — 65 %-EE-Vorgabe gemäß GEG §71 beachten.");
    actions.push("Wärmepumpe, Pellets oder Fernwärmeanschluss prüfen (GEG §71).");
  }

  if (!p.renovations.includes("fenster") && !p.renovations.includes("fassade")) {
    s += 5;
    reasons.push("Fenster und Fassade intakt — Gebäudehülle energetisch stabil.");
  } else {
    if (p.renovations.includes("fenster")) { reasons.push("Fenster sanierungsbedürftig — Dreifachverglasung verbessert U-Wert um 50–70 %."); actions.push("Fenstertausch zu Dreifachverglasung — KfW-förderfähig."); }
    if (p.renovations.includes("fassade")) { reasons.push("Fassade sanierungsbedürftig — WDVS hebt Energieklasse um 1–2 Stufen."); actions.push("Fassadendämmung (WDVS) — förderfähig über BEG-EM."); }
  }

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   Confidence-Berechnung
   ═══════════════════════════════════════════════════════════ */

function calcConfidence(p: PropertyInput, k: KPIs): ScoringResult["confidence"] {
  let d = 0;
  if (p.renovations.length >= 4) d += 2; else if (p.renovations.length >= 2) d += 1;
  if (k.age >= 60) d += 2; else if (k.age >= 40) d += 1;
  if (p.locationGrade === "D") d += 1;
  if (k.netCashflow < 0) d += 1;
  if (p.year < 1960) d += 1;
  if (d <= 1) return "Hohe Bewertungssicherheit";
  if (d <= 3) return "Mittlere Bewertungssicherheit";
  return "Geringe Bewertungssicherheit";
}

/* ═══════════════════════════════════════════════════════════
   Stärken + Risiken
   ═══════════════════════════════════════════════════════════ */

function generateStrengths(p: PropertyInput, k: KPIs): string[] {
  const l: string[] = [];
  if (k.grossYield >= 0.06) l.push(`Bruttomietrendite ${(k.grossYield * 100).toFixed(1)} % deutlich über Marktdurchschnitt — robuster Einkommenspuffer.`);
  else if (k.grossYield >= 0.05) l.push(`Bruttomietrendite ${(k.grossYield * 100).toFixed(1)} % übertrifft den Bundesdurchschnitt.`);
  if (k.hausgeldRatio <= 0.25) l.push(`Hausgeld nur ${(k.hausgeldRatio * 100).toFixed(0)} % der Bruttomiete — innerhalb der 30 %-Schwelle.`);
  if (p.renovations.length === 0) l.push("Kein Sanierungsbedarf — stabilisiertes Objekt, ab Tag 1 cashflow-fähig.");
  if ((ENERGY_RANK[p.energyClass] || 50) >= 76) l.push(`Energieklasse ${p.energyClass} — zukunftssicher gegenüber GEG-Verschärfungen.`);
  if ((LOCATION_RANK[p.locationGrade] || 45) >= 72) l.push(`${LOCATION_LABEL[p.locationGrade]} — geringe Leerstandsquote, günstige Bankkonditionen.`);
  if (k.factor <= 20) l.push(`Kaufpreisfaktor ${k.factor.toFixed(1)}x deutlich unter dem Metropol-Korridor von 22–28x.`);
  if (k.netCashflow >= 400) l.push(`${Math.round(k.netCashflow)} € monatlicher Nettocashflow — tragfähige Kapitaldienstdeckung.`);
  if (k.age <= 15) l.push(`Jüngere Bausubstanz (${k.age} Jahre) — moderne Standards, geringer Instandhaltungsaufwand.`);
  return l.length > 0 ? l : ["Objekt bewegt sich in allen Dimensionen nahe am Marktdurchschnitt."];
}

function generateRisks(p: PropertyInput, k: KPIs): string[] {
  const l: string[] = [];
  if (k.grossYield < 0.03) l.push(`Bruttomietrendite ${(k.grossYield * 100).toFixed(1)} % unter Break-even-Schwelle für fremdfinanzierte Akquisitionen.`);
  else if (k.grossYield < 0.04) l.push(`Bruttomietrendite ${(k.grossYield * 100).toFixed(1)} % — minimaler Spielraum bei Zinsanstieg.`);
  if (k.hausgeldRatio >= 0.5) l.push(`Hausgeld absorbiert ${(k.hausgeldRatio * 100).toFixed(0)} % der Miete — hohe WEG-Kosten.`);
  if (p.renovations.length >= 4) l.push(`${p.renovations.length} Gewerke sanierungsbedürftig — Capex 50.000–150.000 €+.`);
  else if (p.renovations.length >= 2) l.push(`${p.renovations.length} Sanierungen mit Ausführungsrisiken und Kapitalbedarf.`);
  if ((ENERGY_RANK[p.energyClass] || 50) < 35) l.push(`Energieklasse ${p.energyClass} — regulatorischer Druck, Sanierungspflicht möglich.`);
  if (p.locationGrade === "D") l.push("Lageklasse D — erhöhtes Leerstandsrisiko, eingeschränkte Exit-Liquidität.");
  if (k.age >= 60) l.push(`Gebäudealter ${k.age} Jahre — Gutachten empfohlen, latente Mängel wahrscheinlich.`);
  if (k.netCashflow < 0) l.push(`Negativer Netto-Cashflow ${Math.round(k.netCashflow)} €/Monat.`);
  if (k.factor >= 30) l.push(`Kaufpreisfaktor ${k.factor.toFixed(1)}x — primär Wertsteigerungswette.`);
  return l.length > 0 ? l : ["Keine wesentlichen Risiken — standardmäßige Due Diligence ausreichend."];
}

/* ═══════════════════════════════════════════════════════════
   Haupt-Entry-Point
   ═══════════════════════════════════════════════════════════ */

export function computeScore(p: PropertyInput): ScoringResult {
  const k = deriveKPIs(p);

  const inv = calcInvestment(p, k);
  const rent = calcRentability(p, k);
  const risk = calcRisk(p, k);
  const fin = calcFinancing(p, k);
  const proj = calcProjection(p, k);
  const energy = calcEnergy(p, k);

  const subscores: SubscoreEntry[] = [
    { key: "investment", label: "Investitions-Score", value: inv.value, weight: 30, oneLiner: `Bruttorendite ${(k.grossYield * 100).toFixed(1)} %, Faktor ${k.factor.toFixed(1)}x, ${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m²`, reasons: inv.reasons, actions: inv.actions },
    { key: "rentability", label: "Vermietbarkeits-Score", value: rent.value, weight: 15, oneLiner: `Lageklasse ${p.locationGrade}, ${p.area} m², Baujahr ${p.year}`, reasons: rent.reasons, actions: rent.actions },
    { key: "risk", label: "Risiko-Score", value: risk.value, weight: 15, oneLiner: `${p.renovations.length} Sanierungen, ${(k.hausgeldRatio * 100).toFixed(0)} % HG-Quote, ${k.age} J. alt`, reasons: risk.reasons, actions: risk.actions },
    { key: "financing", label: "Finanzierungs-Score", value: fin.value, weight: 15, oneLiner: `LTV-Potenzial: Lage ${p.locationGrade}, Rendite ${(k.grossYield * 100).toFixed(1)} %`, reasons: fin.reasons, actions: fin.actions },
    { key: "projection", label: "Zukunfts-Score", value: proj.value, weight: 15, oneLiner: "Wachstumspotenzial, Energiekonformität, Mietentwicklung", reasons: proj.reasons, actions: proj.actions },
    { key: "energy", label: "Energie-Score", value: energy.value, weight: 10, oneLiner: `Klasse ${p.energyClass}, Gebäudehülle ${!p.renovations.includes("fenster") && !p.renovations.includes("fassade") ? "intakt" : "sanierungsbedürftig"}`, reasons: energy.reasons, actions: energy.actions },
  ];

  const totalScore = clamp(Math.round(subscores.reduce((sum, s) => sum + s.value * (s.weight / 100), 0)));

  return {
    totalScore,
    confidence: calcConfidence(p, k),
    subscores,
    kpis: { netYield: k.netYield, grossYield: k.grossYield, factor: k.factor, sqmPrice: k.sqmPrice, hausgeldRatio: k.hausgeldRatio, netCashflow: k.netCashflow },
    strengths: generateStrengths(p, k),
    risks: generateRisks(p, k),
  };
}
