/* ═══════════════════════════════════════════════════════════
   ImmoScorer — Deterministische Scoring-Engine v2
   Keine KI, keine Randomness. Pure Berechnungen.
   ═══════════════════════════════════════════════════════════ */

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
  hausgeldNichtUmlagefaehig?: number; // Owner's actual cost (non-apportionable)
  hasHGBreakdown?: boolean;           // User provided detailed breakdown
  /* Optional: Extended property info */
  propertyType?: string;    // etw, efh, mfh, dhh
  apartmentType?: string;   // erdgeschoss, obergeschoss, dachgeschoss, penthouse, souterrain
  rooms?: number;           // 1-20
  unitCount?: number;       // MFH: Anzahl Wohneinheiten
  estimatedUtilities?: number; // Geschätzte NK
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
    hausgeldGesamt: number;
    hausgeldNichtUmlagefaehig: number;
    hasHGBreakdown: boolean;
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

/** Renovation cost per m² for effective price calculation */
const RENO_COST_PER_SQM: Record<string, number> = {
  dach: 150, fassade: 120, fenster: 80,
  heizung: 100, elektrik: 60, bad: 90,
};

const RENO_COST_RANGE: Record<string, string> = {
  dach: "15.000–40.000 €", fassade: "20.000–50.000 €", fenster: "8.000–20.000 €",
  bad: "10.000–25.000 €", elektrik: "8.000–18.000 €", heizung: "12.000–35.000 €",
};

/* ─── Zimmer-Score für Vermietbarkeit ─── */
const ROOM_SCORE: Record<number, number> = {
  1: 70, 2: 95, 3: 100, 4: 80, 5: 60,
};
function getRoomScore(rooms?: number): number {
  if (!rooms || rooms < 1) return 85; // Default when not provided
  if (rooms >= 6) return 55;
  return ROOM_SCORE[rooms] ?? 85;
}

/* ─── Hilfsfunktionen ─── */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Calculate estimated renovation costs (total) */
function calcRenovationCosts(renovations: string[], area: number): number {
  return renovations.reduce((sum, r) => sum + (RENO_COST_PER_SQM[r] || 0) * area, 0);
}

function deriveKPIs(p: PropertyInput) {
  const annualRent = p.rent * 12;
  const renovationCosts = calcRenovationCosts(p.renovations, p.area);
  const effectivePrice = p.price + renovationCosts;
  const grossYield = annualRent / p.price;
  const effectiveGrossYield = annualRent / effectivePrice;
  // Use nicht-umlagefähig portion for cashflow (default: 40% of total hausgeld)
  const ownerHausgeld = p.hausgeldNichtUmlagefaehig ?? (p.hausgeld * 0.40);
  const netCashflow = p.rent - ownerHausgeld;
  const netYield = (netCashflow * 12) / p.price;
  const factor = p.price / annualRent;
  const effectiveFactor = effectivePrice / annualRent;
  const sqmPrice = p.price / p.area;
  const hausgeldRatio = p.rent > 0 ? ownerHausgeld / p.rent : 0;
  const age = new Date().getFullYear() - p.year;
  return {
    annualRent, grossYield, effectiveGrossYield, netCashflow, netYield,
    factor, effectiveFactor, sqmPrice, hausgeldRatio, age,
    renovationCosts, effectivePrice, ownerHausgeld,
  };
}

type KPIs = ReturnType<typeof deriveKPIs>;

/* ═══════════════════════════════════════════════════════════
   1. Investitions-Score (30%) — now uses effective price
   ═══════════════════════════════════════════════════════════ */

function calcInvestment(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];

  // Use effective yield (including renovation costs)
  const useYield = k.effectiveGrossYield;
  const yieldPct = (useYield * 100).toFixed(1);

  if (useYield >= 0.07) { s += 40; reasons.push(`Effektive Bruttorendite ${yieldPct} % (inkl. Sanierungskosten) — exzellentes Ertragsprofil.`); }
  else if (useYield >= 0.06) { s += 34; reasons.push(`Effektive Bruttorendite ${yieldPct} % — deutlich über Marktdurchschnitt.`); }
  else if (useYield >= 0.05) { s += 28; reasons.push(`Effektive Bruttorendite ${yieldPct} % — übertrifft den Bundesdurchschnitt und ermöglicht positiven Leverage.`); }
  else if (useYield >= 0.04) { s += 20; reasons.push(`Effektive Bruttorendite ${yieldPct} % ist marktüblich, lässt jedoch wenig Spielraum bei steigenden Zinsen.`); }
  else if (useYield >= 0.03) { s += 10; reasons.push(`Effektive Bruttorendite ${yieldPct} % liegt unter der Rentabilitätsschwelle für fremdfinanzierte Akquisitionen.`); }
  else if (useYield >= 0.02) { s += 4; reasons.push(`Effektive Bruttorendite ${yieldPct} % — kritisch niedrig für ein Kapitalanlage-Investment.`); }
  else { s += 1; reasons.push(`Effektive Bruttorendite ${yieldPct} % — Investment wirtschaftlich kaum darstellbar.`); }

  // Show original vs effective yield if renovation costs apply
  if (k.renovationCosts > 0) {
    reasons.push(`Sanierungskosten ca. ${Math.round(k.renovationCosts).toLocaleString("de-DE")} € auf Kaufpreis gerechnet (effektiver Kaufpreis ${Math.round(k.effectivePrice).toLocaleString("de-DE")} €).`);
  }

  // Factor using effective price
  const useFactor = k.effectiveFactor;
  const f = useFactor.toFixed(1);
  if (useFactor <= 15) { s += 30; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — außergewöhnlich attraktiv.`); }
  else if (useFactor <= 20) { s += 24; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — deutlich unter dem Metropol-Korridor von 22–28x.`); }
  else if (useFactor <= 25) { s += 16; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — marktüblich für B-/C-Standorte.`); }
  else if (useFactor <= 30) { s += 8; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — Amortisation über 25 Jahre.`); }
  else if (useFactor <= 35) { s += 3; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — Investment primär auf Wertsteigerung angewiesen.`); }
  else { s += 1; reasons.push(`Effektiver Kaufpreisfaktor ${f}x — wirtschaftlich kaum tragbar.`); }

  const sqm = Math.round(k.sqmPrice).toLocaleString("de-DE");
  if (k.sqmPrice <= 1500) { s += 30; reasons.push(`Einstiegspreis ${sqm} €/m² weit unter dem Marktmedian — organisches Upside durch Preiskonvergenz.`); }
  else if (k.sqmPrice <= 2500) { s += 24; reasons.push(`${sqm} €/m² bietet ein attraktives Preisniveau mit Wertsteigerungspotenzial.`); }
  else if (k.sqmPrice <= 3500) { s += 18; reasons.push(`${sqm} €/m² entspricht dem Marktdurchschnitt für solide Standorte.`); }
  else if (k.sqmPrice <= 5000) { s += 10; reasons.push(`${sqm} €/m² liegt im gehobenen Segment — limitiertes Preis-Upside.`); }
  else { s += 3; reasons.push(`${sqm} €/m² im Premium-Segment — weiteres Upside nur bei absoluter Spitzenmikrolage.`); }

  if (useYield >= 0.05) actions.push("Rendite trägt positiven Leverage — modellieren Sie 80 % LTV bei 4 % Annuität zur Cashflow-Validierung.");
  else if (useYield >= 0.04) actions.push("Grenzwertige Rendite — zielen Sie auf 70–75 % LTV oder verhandeln Sie 5–10 % Preisnachlass.");
  else actions.push("Rendite unter 4 % macht fremdfinanzierte Akquisition riskant — höheren Eigenkapitaleinsatz einkalkulieren.");

  if (useFactor >= 25) actions.push("Verhandeln Sie 10–15 % unter Angebotspreis, um den Faktor in den Zielkorridor von 20–22x zu senken.");

  // ─── Objektart-Anpassung ───
  let ptAdj = 0;
  if (p.propertyType === "mfh" && useYield >= 0.06 && (p.unitCount ?? 0) >= 3) {
    ptAdj = 10;
    reasons.push(`MFH mit ${p.unitCount} Einheiten und ${(useYield * 100).toFixed(1)} % Rendite — Skalierungsbonus.`);
  }
  if (p.propertyType === "efh" && useYield >= 0.03) {
    // EFH haben typisch niedrigere Renditen, 3-5% ist schon gut
    ptAdj = 5;
    reasons.push("EFH — Renditeerwartung angepasst (3–5 % ist für EFH überdurchschnittlich).");
  }

  return { value: clamp(s + ptAdj), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   2. Vermietbarkeits-Score (15%) — OVERHAULED
   Lage ist der wichtigste Faktor (50%), nicht 40%.
   ═══════════════════════════════════════════════════════════ */

function calcRentability(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const reasons: string[] = [];
  const actions: string[] = [];

  // ─── Component A: Lageklasse (50% Gewichtung — wichtigster Faktor) ───
  let locPts: number;
  if (p.walkScore != null && p.transitScore != null) {
    // With real location data: blend walkScore/transitScore with location grade
    const realScore = p.walkScore * 0.6 + p.transitScore * 0.4;
    // Map to location grade scale but preserve grade floor
    const gradeFloor: Record<string, number> = { A: 90, B: 75, C: 45, D: 20 };
    locPts = Math.max(gradeFloor[p.locationGrade] || 45, Math.round(realScore));
    reasons.push(`${LOCATION_LABEL[p.locationGrade] || "Unbekannte Lage"} (Klasse ${p.locationGrade}) — Walk-Score ${p.walkScore}, ÖPNV-Score ${p.transitScore}. ${
      p.locationGrade === "A" ? "Top-Lage mit hervorragender Infrastruktur und minimaler Leerstandsquote." :
      p.locationGrade === "B" ? "Beliebte Wohnlage mit stabiler Nachfrage und geringem Leerstandsrisiko." :
      p.locationGrade === "C" ? "Durchschnittliche Lage mit moderatem Vermietungspotenzial." :
      "Entwicklungslage mit eingeschränkter Nachfrage."
    }`);
  } else {
    // Without real data: use fixed grade scores
    const gradeScores: Record<string, number> = { A: 100, B: 85, C: 55, D: 25 };
    locPts = gradeScores[p.locationGrade] || 55;
    reasons.push(`${LOCATION_LABEL[p.locationGrade] || "Unbekannte Lage"} (Klasse ${p.locationGrade}) — ${
      p.locationGrade === "A" ? "Top-Lage mit hervorragender Infrastruktur und minimaler Leerstandsquote." :
      p.locationGrade === "B" ? "Beliebte Wohnlage mit stabiler Nachfrage und geringem Leerstandsrisiko." :
      p.locationGrade === "C" ? "Durchschnittliche Lage, Mietspiegel als Orientierung für §558 BGB Mieterhöhungen." :
      "Entwicklungslage — erhöhtes Leerstandsrisiko, eingeschränkte Mietpreisbremse nach §556d BGB."
    }`);
  }

  // ─── Component B: Wohnungsgröße (20% Gewichtung) ───
  let areaPts: number;
  if (p.area >= 50 && p.area <= 80) { areaPts = 100; reasons.push(`${p.area} m² Wohnfläche im Sweet Spot — breiteste Zielgruppe (Singles, Paare, junge Familien).`); }
  else if (p.area >= 30 && p.area < 50) { areaPts = 90; reasons.push(`Kompakte ${p.area} m² — in urbanen Lagen stark nachgefragt bei Singles und Paaren.`); }
  else if (p.area > 80 && p.area <= 120) { areaPts = 75; reasons.push(`${p.area} m² — Familiensegment, solide Nachfrage bei etwas kleinerem Markt.`); }
  else if (p.area < 30) { areaPts = 70; reasons.push(`${p.area} m² Mikrowohnung — Nischenmarkt, hohe m²-Miete aber eingeschränkter Mieterkreis.`); }
  else { areaPts = 50; reasons.push(`${p.area} m² — großzügige Fläche, eingeschränkter Mietmarkt im Luxussegment.`); }

  // ─── Component C: Baujahr (15% Gewichtung) ───
  let agePts: number;
  if (k.age <= 10) { agePts = 100; reasons.push(`Neubau (${p.year}) — moderne Ausstattung, hohe Mieterakzeptanz und geringe Instandhaltung.`); }
  else if (k.age <= 30) { agePts = 85; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — zeitgemäße Bausubstanz, attraktiv für Mieter.`); }
  else if (k.age <= 50) { agePts = 70; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — solide Substanz, ggf. Modernisierungsbedarf bei Neuvermietung.`); }
  else if (k.age <= 80) { agePts = 55; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — ältere Substanz, aber Altbau-Charme kann bei Mietern positiv wirken.`); }
  else { agePts = 40; reasons.push(`Baujahr ${p.year} (${k.age} Jahre) — historische Substanz, Modernisierungsstandard prüfen.`); }

  // ─── Component D: Energieklasse (15% Gewichtung) ───
  let energyPts: number;
  const ec = p.energyClass;
  if (ec === "A+" || ec === "A" || ec === "B") { energyPts = 100; reasons.push(`Energieklasse ${ec} — moderne Energieeffizienz, attraktiv für umweltbewusste Mieter.`); }
  else if (ec === "C" || ec === "D") { energyPts = 70; reasons.push(`Energieklasse ${ec} — akzeptabel für die meisten Mieter, mittelfristig Modernisierung sinnvoll.`); }
  else if (ec === "E") { energyPts = 45; reasons.push(`Energieklasse ${ec} — höhere Nebenkosten können Mieter abschrecken.`); }
  else { energyPts = 25; reasons.push(`Energieklasse ${ec} — hohe Nebenkosten, eingeschränkte Vermietbarkeit an energiebewusste Mieter.`); }

  // ─── Weighted sum: 50/20/15/15 ───
  let s = Math.round(locPts * 0.50 + areaPts * 0.20 + agePts * 0.15 + energyPts * 0.15);

  // ─── Objektart-Anpassung ───
  const pt = p.propertyType;
  const at = p.apartmentType;
  if (pt === "etw") {
    if (at === "erdgeschoss") { s -= 5; reasons.push("ETW Erdgeschoss — weniger beliebt (Lärm, Sicherheit, Privatsphäre)."); }
    else if (at === "dachgeschoss") { s += 3; reasons.push("ETW Dachgeschoss — beliebt, sofern kein Aufzug-Problem."); }
    else if (at === "penthouse") { s += 8; reasons.push("Penthouse — Premium-Segment mit hoher Nachfrage."); }
    else if (at === "souterrain") { s -= 15; reasons.push("Souterrain/Untergeschoss — schwer vermietbar, eingeschränkter Mieterkreis."); }
  } else if (pt === "efh") {
    s += 5; reasons.push("Einfamilienhaus — hohe Familien-Nachfrage, stabile Mietverhältnisse.");
  }

  // ─── Zimmer-Anpassung ───
  if (p.rooms) {
    const roomPts = getRoomScore(p.rooms);
    const roomAdj = Math.round((roomPts - 85) * 0.10); // ±adjustment based on deviation from average
    s += roomAdj;
    if (p.rooms === 1) reasons.push("1 Zimmer — Nischensegment, begrenzte Zielgruppe.");
    else if (p.rooms === 2) reasons.push("2 Zimmer — höchste Nachfrage in Städten.");
    else if (p.rooms === 3) reasons.push("3 Zimmer — breiteste Zielgruppe.");
    else if (p.rooms === 4) reasons.push("4 Zimmer — Familiensegment, etwas kleinerer Markt.");
    else if (p.rooms >= 5) reasons.push(`${p.rooms} Zimmer — Luxus/Spezial-Segment.`);
  }

  // ─── Actions ───
  if (p.locationGrade === "A" || p.locationGrade === "B") {
    actions.push("Mietpreisbremse prüfen (§556d BGB) — Höchstmiete 10 % über Mietspiegel bei Neuvermietung.");
  }
  if (p.area >= 30 && p.area <= 80) {
    actions.push("Zielgruppe Singles/Paare — hohe Nachfrage, kurze Wiedervermietungszeiten.");
  }
  if (k.age >= 40) {
    actions.push("Modernisierungskosten nach §559 BGB zu 8 % p.a. auf Mieter umlegbar (gedeckelt §559 Abs. 3a BGB).");
  }
  if (energyPts <= 45) {
    actions.push("Energetische Sanierung kann Vermietbarkeit und Mietpreispotenzial deutlich steigern.");
  }

  return { value: clamp(s), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   3. Risiko-Score (15%) — COMPLETELY OVERHAULED
   0 = catastrophic risk, 100 = no risk
   ═══════════════════════════════════════════════════════════ */

function calcRisk(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  const reasons: string[] = [];
  const actions: string[] = [];
  const renoCount = p.renovations.length;

  // ─── Component A: Renovation need (40%) ───
  let renoPts: number;
  if (renoCount === 0) { renoPts = 100; reasons.push("Kein Sanierungsbedarf — das Objekt ist stabilisiert und ab Tag 1 cashflow-fähig."); }
  else if (renoCount === 1) { renoPts = 85; }
  else if (renoCount === 2) { renoPts = 70; }
  else if (renoCount === 3) { renoPts = 55; }
  else if (renoCount === 4) { renoPts = 35; }
  else if (renoCount === 5) { renoPts = 20; }
  else { renoPts = 5; }

  if (renoCount > 0) {
    const items = p.renovations.map(r => RENO_LABEL[r] || r).join(", ");
    const costs = p.renovations.map(r => RENO_COST_RANGE[r]).filter(Boolean).join("; ");
    const totalCost = Math.round(k.renovationCosts).toLocaleString("de-DE");
    reasons.push(`${renoCount}/6 Gewerken sanierungsbedürftig (${items}). Geschätzte Kosten: ${totalCost} € (${costs}).`);
    if (renoCount >= 5) reasons.push("Quasi-Totalsanierung — extremes Ausführungs- und Kostenrisiko.");
    actions.push("Verbindliche Handwerkerangebote vor Kaufvertrag einholen. Kostenpuffer 15–20 % einkalkulieren.");
  }

  // ─── Component B: Building age (25%) ───
  let agePts: number;
  if (k.age < 5) { agePts = 100; reasons.push(`Neubau (${k.age} J.) — minimales Substanzrisiko.`); }
  else if (k.age <= 15) { agePts = 90; reasons.push(`${k.age} Jahre — junge Bausubstanz mit geringem Risikoprofil.`); }
  else if (k.age <= 30) { agePts = 75; reasons.push(`${k.age} Jahre — solide Bausubstanz, planmäßige Instandhaltung prüfen.`); }
  else if (k.age <= 50) { agePts = 55; reasons.push(`${k.age} Jahre — mittelalte Substanz, versteckte Mängel möglich.`); }
  else if (k.age <= 80) { agePts = 35; reasons.push(`${k.age} Jahre — vor modernen Baustandards, latente Mängel wahrscheinlich.`); actions.push("Bautechnisches Gutachten empfohlen — Fokus Abdichtung, Elektrik, tragende Wände."); }
  else if (k.age <= 100) { agePts = 20; reasons.push(`${k.age} Jahre — erhöhtes Risiko für verdeckte Mängel.`); actions.push("Unabhängiges Baugutachten beauftragen. Schadstoffprüfung (Asbest, PCB) empfohlen."); }
  else { agePts = 10; reasons.push(`${k.age} Jahre — Altbau-Substanz, umfassende Prüfung zwingend erforderlich.`); actions.push("Vollgutachten inkl. Schadstoffanalyse vor Kaufvertrag zwingend empfohlen."); }

  // ─── Component C: Hausgeld ratio (20%) — uses nicht-umlagefähig portion ───
  let hgPts: number;
  const hgPct = k.hausgeldRatio * 100;
  const hgLabel = p.hasHGBreakdown
    ? `Bereinigte HG-Quote ${hgPct.toFixed(0)} % (${Math.round(k.ownerHausgeld)} € nicht-umlagefähig von ${Math.round(p.hausgeld)} € gesamt)`
    : `Geschätzte HG-Quote ${hgPct.toFixed(0)} % (ca. ${Math.round(k.ownerHausgeld)} € nicht-umlagefähig)`;
  if (hgPct < 15) { hgPts = 100; reasons.push(`${hgLabel} — sehr gesunder Cashflow-Puffer.`); }
  else if (hgPct <= 25) { hgPts = 80; reasons.push(`${hgLabel} — im normalen Bereich.`); }
  else if (hgPct <= 35) { hgPts = 50; reasons.push(`${hgLabel} — erhöht, WEG-Kosten prüfen.`); }
  else if (hgPct <= 50) { hgPts = 25; reasons.push(`${hgLabel} — kritisch hoch, deutet auf hohe WEG-Kosten oder aufgestaute Rücklagen hin.`); actions.push("WEG-Wirtschaftsplan und Hausgeldabrechnung der letzten 3 Jahre anfordern (§28 WEG)."); }
  else { hgPts = 5; reasons.push(`${hgLabel} — Hausgeld-Belastung ist ein Cashflow-Killer.`); actions.push("WEG-Wirtschaftsplan prüfen. Sonderumlagen und Instandhaltungsrückstellung analysieren."); }
  if (!p.hasHGBreakdown) {
    actions.push("Hausgeld aufschlüsseln für genauere Analyse — umlagefähige Kosten (Heizung, Wasser, Müll) werden vom Mieter getragen.");
  }

  // ─── Component D: Energy class risk (15%) ───
  let energyPts: number;
  const ec = p.energyClass;
  if (ec === "A+" || ec === "A") { energyPts = 100; }
  else if (ec === "B") { energyPts = 85; }
  else if (ec === "C") { energyPts = 70; }
  else if (ec === "D") { energyPts = 50; }
  else if (ec === "E") { energyPts = 30; reasons.push(`Energieklasse ${ec} — GEG-Sanierungspflicht möglich. Zusätzliche Kosten von ca. 100–200 €/m² einplanen.`); }
  else if (ec === "F") { energyPts = 15; reasons.push(`Energieklasse ${ec} — GEG-Sanierungspflicht wahrscheinlich. Kosten von ca. 150–300 €/m² einplanen.`); }
  else { energyPts = 5; reasons.push(`Energieklasse ${ec} — GEG-Sanierungspflicht droht. Kosten von ca. 200–400 €/m² einplanen.`); }

  // Weighted sum
  const s = Math.round(renoPts * 0.40 + agePts * 0.25 + hgPts * 0.20 + energyPts * 0.15);

  // Location risk adjustment
  if (p.walkScore != null) {
    const riskAdj: Record<string, number> = { A: 5, B: 2, C: 0, D: -8 };
    const adj = riskAdj[p.locationGrade] ?? 0;
    if (adj > 0) reasons.push(`Lage-Analyse (${p.locationGrade}-Standort) — Risikominderung durch starke Infrastruktur.`);
    else if (adj < 0) reasons.push(`Lage-Analyse (${p.locationGrade}-Standort) — erhöhtes Standortrisiko durch schwache Infrastruktur.`);
    return { value: clamp(s + adj), reasons, actions };
  }

  if (p.renovations.includes("dach")) actions.push("Dacherneuerung höchstes Capex-Risiko (15.000–40.000 € Anteil) — WEG-Beschluss und Sonderumlage prüfen.");
  if (p.renovations.includes("heizung") && (ENERGY_RANK[p.energyClass] || 50) < 50) actions.push("Heizungstausch bei schlechter Energieklasse kann gemäß GEG §§71–72 gebäudeweite Sanierung auslösen.");

  if (k.netCashflow < 0) reasons.push(`Negativer Netto-Cashflow von ${Math.round(k.netCashflow)} €/Monat vor Finanzierung.`);

  // ─── Objektart-Risiko ───
  let ptAdj = 0;
  if (p.propertyType === "efh" || p.propertyType === "dhh") {
    ptAdj = -5;
    reasons.push("EFH/DHH — kein Eigentümergemeinschafts-Puffer, alle Kosten selbst tragen.");
  } else if (p.propertyType === "mfh") {
    ptAdj = 5;
    reasons.push("MFH — Risikodiversifikation über mehrere Mieter.");
  }
  if (p.apartmentType === "souterrain") {
    ptAdj -= 8;
    reasons.push("Souterrain — Feuchtigkeitsrisiko, erschwertes Vermieten.");
  }

  return { value: clamp(s + ptAdj), reasons, actions };
}

/* ═══════════════════════════════════════════════════════════
   4. Finanzierungs-Score (15%) — OVERHAULED with DSCR
   ═══════════════════════════════════════════════════════════ */

function calcFinancing(p: PropertyInput, k: KPIs): { value: number; reasons: string[]; actions: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const actions: string[] = [];
  const locRank = LOCATION_RANK[p.locationGrade] || 45;
  const energyRank = ENERGY_RANK[p.energyClass] || 50;

  // ─── LTV assessment (30 pts) ───
  // If renovation needed, effective LTV is worse
  const ltvRatio = k.effectivePrice / p.price; // >1 means renovations inflate costs
  if (k.renovationCosts > 0 && ltvRatio > 1.3) {
    s += 5;
    reasons.push(`LTV inkl. Sanierung >130 % des Kaufpreises — Banken werden zusätzliches EK verlangen.`);
  } else if (k.renovationCosts > 0 && ltvRatio > 1.15) {
    s += 12;
    reasons.push(`LTV inkl. Sanierung ${(ltvRatio * 100).toFixed(0)} % — Nachfinanzierungsbedarf wahrscheinlich.`);
  } else {
    s += Math.round((locRank / 100) * 30);
    reasons.push(`Lageklasse ${p.locationGrade} — ${locRank >= 72 ? "günstige Bankkonditionen und höhere Beleihungsausläufe." : locRank >= 45 ? "Standard-Beleihungswerte." : "Banken kalkulieren Risikoabschläge."}`);
  }

  // ─── DSCR — Debt Service Coverage Ratio (35 pts) ───
  // Assume 80% LTV, 4% interest, 2% repayment = 6% annuity on loan
  const assumedLoan = k.effectivePrice * 0.8;
  const annualDebtService = assumedLoan * 0.06;
  const netAnnualRent = k.netCashflow * 12;
  const dscr = netAnnualRent > 0 ? netAnnualRent / annualDebtService : 0;

  if (dscr >= 1.5) { s += 35; reasons.push(`DSCR ${dscr.toFixed(2)} — Nettomiete deckt Kapitaldienst komfortabel.`); }
  else if (dscr >= 1.2) { s += 25; reasons.push(`DSCR ${dscr.toFixed(2)} — Kapitaldienstdeckung ausreichend.`); }
  else if (dscr >= 1.0) { s += 15; reasons.push(`DSCR ${dscr.toFixed(2)} — Kapitaldienstdeckung knapp, Stresstest empfohlen.`); }
  else { s += 5; reasons.push(`DSCR ${dscr.toFixed(2)} — Miete deckt nicht den Kapitaldienst. Negativer Cashflow nach Finanzierung.`); }

  // ─── Energy / renovation risk for banks (15 pts) ───
  const renoMalus = Math.min(p.renovations.length * 3, 15);
  s += Math.max(0, Math.round((energyRank / 100) * 15) - renoMalus);
  if (p.renovations.length === 0) reasons.push("Kein Sanierungsbedarf — einfacheres Underwriting, keine Nachfinanzierung.");
  else reasons.push(`${p.renovations.length} Sanierungen — Banken können zusätzliches Eigenkapital (30 %+) verlangen.`);

  if (energyRank >= 76) { reasons.push(`Energieklasse ${p.energyClass} — KfW-Förderung möglich.`); actions.push("KfW-Programm 261/262 prüfen — bis zu 150.000 € zinsgünstiges Darlehen."); }
  else if (energyRank < 35) { reasons.push(`Energieklasse ${p.energyClass} — GEG-Konformitätsrisiko, möglicher Beleihungswert-Abschlag.`); actions.push("Energieausweis anfordern. GEG-Erfüllungsfristen prüfen."); }

  // ─── Hausgeld ratio penalty (20 pts) ───
  if (k.hausgeldRatio <= 0.25) { s += 20; }
  else if (k.hausgeldRatio <= 0.35) { s += 12; }
  else { s += 3; reasons.push("Hausgeld-Quote >35 % — belastet Cashflow-Bewertung der Bank."); }

  actions.push("Lassen Sie Ihre Finanzierung kostenlos von unseren Experten prüfen — unverbindlich, innerhalb von 24h.");
  if (dscr >= 1.0) actions.push("Stresstest bei 5,5 % Zinssatz durchführen.");

  // ─── Objektart-Anpassung ───
  let ptAdj = 0;
  if (p.propertyType === "mfh" && p.price > 500000) {
    ptAdj = -5;
    reasons.push("MFH > 500k — Banken verlangen typisch mehr Eigenkapital.");
  } else if (p.propertyType === "efh") {
    ptAdj = 5;
    reasons.push("EFH — Banken finanzieren einfacher (Eigennutzung möglich).");
  }

  return { value: clamp(s + ptAdj), reasons, actions };
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

  // Zukunfts-Bonus/Malus basierend auf echter Lage-Analyse
  if (p.walkScore != null) {
    const gradeBonus: Record<string, number> = { A: 15, B: 8, C: 0, D: -10 };
    const bonus = gradeBonus[p.locationGrade] ?? 0;
    s += bonus;
    if (bonus > 0) reasons.push(`Lage-Analyse ergibt ${p.locationGrade}-Standort — Zukunftsbonus +${bonus} Punkte.`);
    else if (bonus < 0) reasons.push(`Lage-Analyse ergibt ${p.locationGrade}-Standort — Zukunftsmalus ${bonus} Punkte.`);
  }

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
   6. Energie-Score (10%) — GEG 2024 penalties
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

  // GEG 2024 hard caps for bad energy classes
  const ec = p.energyClass;
  if (ec === "E") { s = Math.min(s, 40); actions.push(`GEG-Sanierungspflicht möglich. Zusätzliche Kosten von ca. 100–200 €/m² einplanen.`); }
  else if (ec === "F") { s = Math.min(s, 25); actions.push(`GEG-Sanierungspflicht wahrscheinlich. Zusätzliche Kosten von ca. 150–300 €/m² einplanen.`); }
  else if (ec === "G") { s = Math.min(s, 15); actions.push(`GEG-Sanierungspflicht droht. Zusätzliche Kosten von ca. 200–400 €/m² einplanen.`); }
  else if (ec === "H") { s = Math.min(s, 10); actions.push(`GEG-Sanierungspflicht unvermeidlich. Kosten von 250–500 €/m² einplanen.`); }

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
  if (k.effectiveGrossYield >= 0.06) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)} % (inkl. Sanierungskosten) deutlich über Marktdurchschnitt.`);
  else if (k.effectiveGrossYield >= 0.05) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)} % übertrifft den Bundesdurchschnitt.`);
  if (k.hausgeldRatio <= 0.25) l.push(`${p.hasHGBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote nur ${(k.hausgeldRatio * 100).toFixed(0)} % — innerhalb der 30 %-Schwelle.`);
  if (p.renovations.length === 0) l.push("Kein Sanierungsbedarf — stabilisiertes Objekt, ab Tag 1 cashflow-fähig.");
  if ((ENERGY_RANK[p.energyClass] || 50) >= 76) l.push(`Energieklasse ${p.energyClass} — zukunftssicher gegenüber GEG-Verschärfungen.`);
  if ((LOCATION_RANK[p.locationGrade] || 45) >= 72) l.push(`${LOCATION_LABEL[p.locationGrade]} — geringe Leerstandsquote, günstige Bankkonditionen.`);
  if (k.effectiveFactor <= 20) l.push(`Effektiver Kaufpreisfaktor ${k.effectiveFactor.toFixed(1)}x unter dem Metropol-Korridor.`);
  if (k.netCashflow >= 400) l.push(`${Math.round(k.netCashflow)} € monatlicher Nettocashflow — tragfähige Kapitaldienstdeckung.`);
  if (k.age <= 15) l.push(`Jüngere Bausubstanz (${k.age} Jahre) — moderne Standards, geringer Instandhaltungsaufwand.`);
  return l.length > 0 ? l : ["Objekt bewegt sich in allen Dimensionen nahe am Marktdurchschnitt."];
}

function generateRisks(p: PropertyInput, k: KPIs): string[] {
  const l: string[] = [];
  if (k.effectiveGrossYield < 0.03) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)} % unter Break-even-Schwelle für fremdfinanzierte Akquisitionen.`);
  else if (k.effectiveGrossYield < 0.04) l.push(`Effektive Bruttorendite ${(k.effectiveGrossYield * 100).toFixed(1)} % — minimaler Spielraum bei Zinsanstieg.`);
  if (k.hausgeldRatio >= 0.5) l.push(`${p.hasHGBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote ${(k.hausgeldRatio * 100).toFixed(0)} % — hohe nicht-umlagefähige WEG-Kosten.`);
  if (p.renovations.length >= 4) l.push(`${p.renovations.length} Gewerke sanierungsbedürftig — geschätzte Sanierungskosten ${Math.round(k.renovationCosts).toLocaleString("de-DE")} €.`);
  else if (p.renovations.length >= 2) l.push(`${p.renovations.length} Sanierungen mit Ausführungsrisiken und Kapitalbedarf.`);
  if ((ENERGY_RANK[p.energyClass] || 50) < 35) l.push(`Energieklasse ${p.energyClass} — regulatorischer Druck durch GEG 2024, Sanierungspflicht möglich.`);
  if (p.locationGrade === "D") l.push("Lageklasse D — erhöhtes Leerstandsrisiko, eingeschränkte Exit-Liquidität.");
  if (k.age >= 60) l.push(`Gebäudealter ${k.age} Jahre — Gutachten empfohlen, latente Mängel wahrscheinlich.`);
  if (k.netCashflow < 0) l.push(`Negativer Netto-Cashflow ${Math.round(k.netCashflow)} €/Monat.`);
  if (k.effectiveFactor >= 30) l.push(`Effektiver Kaufpreisfaktor ${k.effectiveFactor.toFixed(1)}x — primär Wertsteigerungswette.`);
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
    { key: "investment", label: "Investitions-Score", value: inv.value, weight: 30, oneLiner: `Eff. Rendite ${(k.effectiveGrossYield * 100).toFixed(1)} %, Faktor ${k.effectiveFactor.toFixed(1)}x, ${Math.round(k.sqmPrice).toLocaleString("de-DE")} €/m²`, reasons: inv.reasons, actions: inv.actions },
    { key: "rentability", label: "Vermietbarkeits-Score", value: rent.value, weight: 15, oneLiner: `Lageklasse ${p.locationGrade}, ${p.area} m², Baujahr ${p.year}`, reasons: rent.reasons, actions: rent.actions },
    { key: "risk", label: "Risiko-Score", value: risk.value, weight: 15, oneLiner: `${p.renovations.length} Sanierungen, ${(k.hausgeldRatio * 100).toFixed(0)} % ${p.hasHGBreakdown ? "bereinigte" : "gesch."} HG-Quote, ${k.age} J. alt`, reasons: risk.reasons, actions: risk.actions },
    { key: "financing", label: "Finanzierungs-Score", value: fin.value, weight: 15, oneLiner: `LTV-Potenzial: Lage ${p.locationGrade}, Rendite ${(k.effectiveGrossYield * 100).toFixed(1)} %`, reasons: fin.reasons, actions: fin.actions },
    { key: "projection", label: "Zukunfts-Score", value: proj.value, weight: 15, oneLiner: "Wachstumspotenzial, Energiekonformität, Mietentwicklung", reasons: proj.reasons, actions: proj.actions },
    { key: "energy", label: "Energie-Score", value: energy.value, weight: 10, oneLiner: `Klasse ${p.energyClass}, Gebäudehülle ${!p.renovations.includes("fenster") && !p.renovations.includes("fassade") ? "intakt" : "sanierungsbedürftig"}`, reasons: energy.reasons, actions: energy.actions },
  ];

  let totalScore = Math.round(subscores.reduce((sum, s) => sum + s.value * (s.weight / 100), 0));

  // Heavy renovation malus on total score
  if (p.renovations.length > 4) {
    totalScore -= 15;
  }

  return {
    totalScore: clamp(totalScore),
    confidence: calcConfidence(p, k),
    subscores,
    kpis: { netYield: k.netYield, grossYield: k.grossYield, factor: k.factor, sqmPrice: k.sqmPrice, hausgeldRatio: k.hausgeldRatio, netCashflow: k.netCashflow, hausgeldGesamt: p.hausgeld, hausgeldNichtUmlagefaehig: k.ownerHausgeld, hasHGBreakdown: !!p.hasHGBreakdown },
    strengths: generateStrengths(p, k),
    risks: generateRisks(p, k),
  };
}
