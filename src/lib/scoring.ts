import { EnergyClass, LocationGrade, Renovations } from "./types";

/* ─── Public types ─── */

export interface Subscore {
  label: string;
  value: number; // 0-100
  weight: number; // fraction, all weights sum to 1
}

export interface ScoringResult {
  totalScore: number; // 0-100 weighted average
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
  recommendations: string[];
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

/* ─── Weights ─── */

const WEIGHTS = {
  investment: 0.25,
  rentability: 0.20,
  risk: 0.20,
  energy: 0.10,
  bankability: 0.15,
  projection: 0.10,
} as const;

/* ─── Lookup tables ─── */

const ENERGY_RANK: Record<EnergyClass, number> = {
  "A+": 100, A: 88, B: 76, C: 62, D: 48, E: 35, F: 22, G: 12, H: 5,
};

const ENERGY_LABEL: Record<EnergyClass, string> = {
  "A+": "excellent", A: "very good", B: "good", C: "acceptable",
  D: "below average", E: "poor", F: "very poor", G: "critically poor", H: "worst-in-class",
};

const LOCATION_RANK: Record<LocationGrade, number> = { A: 100, B: 72, C: 45, D: 20 };
const LOCATION_LABEL: Record<LocationGrade, string> = {
  A: "prime", B: "good", C: "average", D: "developing",
};

/* ─── Helper: clamp to 0-100 ─── */

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/* ─── Derived metrics ─── */

function deriveMetrics(p: ScoringInput) {
  const annualRent = p.monthlyRent * 12;
  const grossYield = annualRent / p.purchasePrice;           // e.g. 0.056 → 5.6%
  const netRent = p.monthlyRent - p.housegeld;
  const netYield = (netRent * 12) / p.purchasePrice;
  const rentMultiplier = p.purchasePrice / annualRent;       // e.g. 22x
  const pricePerSqm = p.purchasePrice / p.areaSqm;
  const hausgeldRatio = p.housegeld / p.monthlyRent;         // % of rent consumed
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
   1. Investment Score
   Measures raw deal quality: yield, price/m², factor
   ═══════════════════════════════════════════════════ */

function calcInvestmentScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = 0;

  // Gross yield (0-40 pts) — 7%+ is excellent in Germany
  if (m.grossYield >= 0.08) s += 40;
  else if (m.grossYield >= 0.06) s += 32;
  else if (m.grossYield >= 0.05) s += 24;
  else if (m.grossYield >= 0.04) s += 16;
  else if (m.grossYield >= 0.03) s += 8;
  else s += 2;

  // Rent multiplier (0-30 pts) — lower is better, 20x is solid
  if (m.rentMultiplier <= 15) s += 30;
  else if (m.rentMultiplier <= 20) s += 24;
  else if (m.rentMultiplier <= 25) s += 16;
  else if (m.rentMultiplier <= 30) s += 8;
  else s += 2;

  // Price per m² (0-30 pts) — relative to German average ~3,000
  if (m.pricePerSqm <= 1500) s += 30;
  else if (m.pricePerSqm <= 2500) s += 24;
  else if (m.pricePerSqm <= 3500) s += 18;
  else if (m.pricePerSqm <= 5000) s += 10;
  else s += 3;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   2. Rentability Score
   Net cash-flow viability after hausgeld
   ═══════════════════════════════════════════════════ */

function calcRentabilityScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = 0;

  // Net yield (0-40 pts)
  if (m.netYield >= 0.05) s += 40;
  else if (m.netYield >= 0.04) s += 32;
  else if (m.netYield >= 0.03) s += 24;
  else if (m.netYield >= 0.02) s += 14;
  else if (m.netYield >= 0.01) s += 6;
  else s += 0;

  // Hausgeld ratio (0-30 pts) — lower is better
  if (m.hausgeldRatio <= 0.15) s += 30;
  else if (m.hausgeldRatio <= 0.25) s += 24;
  else if (m.hausgeldRatio <= 0.35) s += 16;
  else if (m.hausgeldRatio <= 0.50) s += 8;
  else s += 0;

  // Net monthly cash-flow absolute (0-30 pts)
  if (m.netRent >= 600) s += 30;
  else if (m.netRent >= 400) s += 24;
  else if (m.netRent >= 200) s += 16;
  else if (m.netRent >= 0) s += 8;
  else s += 0; // negative cash-flow

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   3. Risk Score
   Higher = lower risk (i.e. 100 = safest)
   Factors: renovations, age, location stability
   ═══════════════════════════════════════════════════ */

function calcRiskScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = 100; // start safe, deduct for risk factors

  // Renovations needed (–12 each, max –72)
  s -= m.renoCount * 12;

  // Building age penalty
  if (m.age >= 80) s -= 20;
  else if (m.age >= 60) s -= 14;
  else if (m.age >= 40) s -= 8;
  else if (m.age >= 20) s -= 3;

  // Location risk
  if (p.locationGrade === "D") s -= 15;
  else if (p.locationGrade === "C") s -= 7;

  // Hausgeld stress — very high ratio signals financial risk
  if (m.hausgeldRatio >= 0.6) s -= 10;
  else if (m.hausgeldRatio >= 0.45) s -= 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   4. Energy Score
   Based on energy class + age + heating renovation
   ═══════════════════════════════════════════════════ */

function calcEnergyScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = ENERGY_RANK[p.energyClass]; // 5-100 base from class

  // Bonus for newer buildings (better insulation likely)
  if (m.age <= 10) s += 10;
  else if (m.age <= 25) s += 5;

  // Penalty if heating needs replacement on a bad energy class
  if (p.renovations.heating && ENERGY_RANK[p.energyClass] < 50) s -= 10;

  // Bonus if facade/windows already done (implicit in not needing reno)
  if (!p.renovations.facade && !p.renovations.windows) s += 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   5. Bankability Score
   How likely a bank will finance favourably:
   yield, LTV proxy, location, condition
   ═══════════════════════════════════════════════════ */

function calcBankabilityScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = 0;

  // Location (0-30 pts) — banks love A/B locations
  s += (LOCATION_RANK[p.locationGrade] / 100) * 30;

  // Yield coverage (0-25 pts) — banks want rent to cover mortgage
  if (m.grossYield >= 0.05) s += 25;
  else if (m.grossYield >= 0.04) s += 18;
  else if (m.grossYield >= 0.03) s += 10;
  else s += 3;

  // Building condition — fewer renos = lower risk for bank (0-25 pts)
  s += Math.max(0, 25 - m.renoCount * 5);

  // Energy class (0-20 pts) — banks increasingly require good energy
  s += (ENERGY_RANK[p.energyClass] / 100) * 20;

  return clamp(Math.round(s));
}

/* ═══════════════════════════════════════════════════
   6. Projection Score
   Future upside potential: location growth, energy
   future-proofing, rent growth headroom
   ═══════════════════════════════════════════════════ */

function calcProjectionScore(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): number {
  let s = 0;

  // Location growth potential (0-35 pts) — A is stable/premium, D has most upside
  const locGrowth: Record<LocationGrade, number> = { A: 20, B: 25, C: 30, D: 35 };
  s += locGrowth[p.locationGrade];

  // Energy future-proofing (0-30 pts)
  if (ENERGY_RANK[p.energyClass] >= 76) s += 30; // A+/A/B already future-proof
  else if (ENERGY_RANK[p.energyClass] >= 48) s += 18;
  else s += 5; // will need expensive retrofit

  // Rent headroom — low current yield in good location = room to raise rent (0-20 pts)
  if (p.locationGrade <= "B" && m.grossYield < 0.04) s += 20;
  else if (p.locationGrade <= "B" && m.grossYield < 0.05) s += 12;
  else s += 6;

  // Age sweet spot — 10-30 yr old buildings often have upside after renovation (0-15 pts)
  if (m.age >= 10 && m.age <= 35) s += 15;
  else if (m.age < 10) s += 8; // new, less upside
  else s += 5;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   Explanation generator
   ═══════════════════════════════════════════════════ */

function generateExplanation(p: ScoringInput, m: ReturnType<typeof deriveMetrics>, total: number): string {
  const yieldPct = (m.grossYield * 100).toFixed(1);
  const netPct = (m.netYield * 100).toFixed(1);
  const ppsm = Math.round(m.pricePerSqm).toLocaleString();

  let quality: string;
  if (total >= 80) quality = "an excellent investment opportunity";
  else if (total >= 65) quality = "a solid investment with good fundamentals";
  else if (total >= 50) quality = "a moderate investment that warrants careful consideration";
  else if (total >= 35) quality = "a below-average deal with notable concerns";
  else quality = "a high-risk investment that requires significant caution";

  const parts: string[] = [
    `This property scores ${total} out of 100, indicating ${quality}.`,
    `At a purchase price of €${p.purchasePrice.toLocaleString()} for ${p.areaSqm} m² (€${ppsm}/m²), it delivers a gross yield of ${yieldPct}% and a net yield of ${netPct}% after deducting €${p.housegeld} monthly Hausgeld.`,
    `The rent multiplier is ${m.rentMultiplier.toFixed(1)}x, meaning the purchase price equals ${m.rentMultiplier.toFixed(1)} years of gross rent.`,
  ];

  if (m.renoCount > 0) {
    const items = m.renoKeys.join(", ");
    parts.push(
      `${m.renoCount} renovation${m.renoCount > 1 ? "s are" : " is"} needed (${items}), which adds risk and upfront cost.`
    );
  } else {
    parts.push("No immediate renovations are needed, which is a positive signal for cash-flow stability.");
  }

  parts.push(
    `The building was constructed in ${p.baujahr} (${m.age} years old) with energy class ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}) in a ${LOCATION_LABEL[p.locationGrade]} location (Grade ${p.locationGrade}).`
  );

  return parts.join(" ");
}

/* ═══════════════════════════════════════════════════
   Strengths / risks / recommendations generators
   ═══════════════════════════════════════════════════ */

function generateStrengths(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): string[] {
  const list: string[] = [];

  if (m.grossYield >= 0.06)
    list.push(`Strong gross yield of ${(m.grossYield * 100).toFixed(1)}%, well above the German average of ~4%.`);
  else if (m.grossYield >= 0.05)
    list.push(`Healthy gross yield of ${(m.grossYield * 100).toFixed(1)}%, above the national average.`);

  if (m.hausgeldRatio <= 0.25)
    list.push(`Low Hausgeld ratio (${(m.hausgeldRatio * 100).toFixed(0)}% of rent) supports positive cash-flow.`);

  if (m.renoCount === 0)
    list.push("No renovations needed — the property is in move-in condition.");

  if (ENERGY_RANK[p.energyClass] >= 76)
    list.push(`Energy class ${p.energyClass} is future-proof and reduces regulatory risk.`);

  if (p.locationGrade <= "B")
    list.push(`${LOCATION_LABEL[p.locationGrade].charAt(0).toUpperCase() + LOCATION_LABEL[p.locationGrade].slice(1)} location (Grade ${p.locationGrade}) ensures stable demand and resale value.`);

  if (m.rentMultiplier <= 20)
    list.push(`Attractive rent multiplier of ${m.rentMultiplier.toFixed(1)}x indicates good value relative to income.`);

  if (m.pricePerSqm <= 2500)
    list.push(`Competitive price per m² (€${Math.round(m.pricePerSqm).toLocaleString()}) leaves room for appreciation.`);

  if (m.netRent >= 400)
    list.push(`Solid net monthly cash-flow of €${Math.round(m.netRent)} after Hausgeld.`);

  if (m.age <= 15)
    list.push(`Relatively new building (${m.age} years) means lower maintenance risk.`);

  return list.length > 0 ? list : ["This property has no standout strengths based on the data provided."];
}

function generateRisks(p: ScoringInput, m: ReturnType<typeof deriveMetrics>): string[] {
  const list: string[] = [];

  if (m.grossYield < 0.03)
    list.push(`Very low gross yield (${(m.grossYield * 100).toFixed(1)}%) — cash-flow will likely be negative after financing.`);
  else if (m.grossYield < 0.04)
    list.push(`Below-average gross yield of ${(m.grossYield * 100).toFixed(1)}% may strain cash-flow with typical financing.`);

  if (m.hausgeldRatio >= 0.5)
    list.push(`High Hausgeld consumes ${(m.hausgeldRatio * 100).toFixed(0)}% of rent, severely impacting net returns.`);
  else if (m.hausgeldRatio >= 0.35)
    list.push(`Hausgeld ratio of ${(m.hausgeldRatio * 100).toFixed(0)}% is above ideal — monitor for increases.`);

  if (m.renoCount >= 4)
    list.push(`${m.renoCount} of 6 systems need renovation — expect significant capital expenditure (€50k–150k+).`);
  else if (m.renoCount >= 2)
    list.push(`${m.renoCount} renovations needed (${m.renoKeys.join(", ")}), adding upfront cost and project risk.`);

  if (p.renovations.roof)
    list.push("Roof renovation is among the most expensive repairs (€15k–40k typical for a single unit share).");

  if (p.renovations.heating && ENERGY_RANK[p.energyClass] < 50)
    list.push("Heating replacement combined with poor energy class could trigger mandatory energy retrofit requirements.");

  if (ENERGY_RANK[p.energyClass] < 35)
    list.push(`Energy class ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}) faces increasing regulatory pressure and potential retrofit mandates under GEG.`);

  if (p.locationGrade === "D")
    list.push("Grade D location carries higher vacancy risk and slower appreciation.");

  if (m.age >= 60)
    list.push(`At ${m.age} years old, the building may have hidden structural issues not captured by the renovation checklist.`);

  if (m.netRent < 0)
    list.push(`Negative net cash-flow (€${Math.round(m.netRent)}/mo) — the property costs money each month before financing.`);

  if (m.rentMultiplier >= 30)
    list.push(`Rent multiplier of ${m.rentMultiplier.toFixed(1)}x is very high — recovery period exceeds 30 years of rent.`);

  if (m.pricePerSqm >= 6000)
    list.push(`Price per m² (€${Math.round(m.pricePerSqm).toLocaleString()}) is premium — limited upside unless in a top-tier micro-location.`);

  return list.length > 0 ? list : ["No significant risks identified based on the data provided."];
}

function generateRecommendations(p: ScoringInput, m: ReturnType<typeof deriveMetrics>, total: number): string[] {
  const list: string[] = [];

  if (m.grossYield < 0.04 && p.locationGrade <= "B")
    list.push("Explore rent increase potential through modernization (Mieterhöhung nach Modernisierung §559 BGB).");

  if (m.renoCount >= 2) {
    list.push("Request the WEG Protokolle (owners' meeting minutes) to check planned Sonderumlagen and renovation reserves.");
    list.push("Get contractor estimates for the needed renovations before making an offer.");
  }

  if (m.hausgeldRatio >= 0.35)
    list.push("Negotiate the Hausgeld breakdown — check if the Instandhaltungsrücklage portion is adequate or inflated.");

  if (ENERGY_RANK[p.energyClass] < 50) {
    list.push("Request the Energieausweis and check if the building is subject to upcoming GEG retrofit deadlines.");
    if (!p.renovations.facade)
      list.push("Consider proactive facade insulation to improve the energy class and reduce future regulatory risk.");
  }

  if (p.locationGrade >= "C")
    list.push("Research local infrastructure plans (transit, universities, employers) that could upgrade the location grade.");

  if (m.rentMultiplier >= 25)
    list.push("Consider offering 10-15% below asking to bring the multiplier into a healthier range.");

  if (m.age >= 40 && m.renoCount === 0)
    list.push("Despite no flagged renovations, commission a building survey for a property this age to uncover hidden defects.");

  if (total >= 70)
    list.push("Strong candidate — proceed with due diligence and financing pre-approval.");
  else if (total >= 50)
    list.push("Moderate deal — compare with 2-3 similar properties before committing.");
  else
    list.push("Weak score — only consider if there is a clear value-add strategy to improve fundamentals.");

  if (m.netRent > 0 && m.grossYield >= 0.04)
    list.push("Model the investment at current bank rates (3.5-4.5%) to verify positive leverage after debt service.");

  return list;
}

/* ═══════════════════════════════════════════════════
   Main entry point
   ═══════════════════════════════════════════════════ */

export function computeScore(params: ScoringInput): ScoringResult {
  const m = deriveMetrics(params);

  const inv = calcInvestmentScore(params, m);
  const rent = calcRentabilityScore(params, m);
  const risk = calcRiskScore(params, m);
  const energy = calcEnergyScore(params, m);
  const bank = calcBankabilityScore(params, m);
  const proj = calcProjectionScore(params, m);

  const totalScore = clamp(Math.round(
    inv * WEIGHTS.investment +
    rent * WEIGHTS.rentability +
    risk * WEIGHTS.risk +
    energy * WEIGHTS.energy +
    bank * WEIGHTS.bankability +
    proj * WEIGHTS.projection
  ));

  return {
    totalScore,
    subscores: {
      investmentScore:   { label: "Investment",   value: inv,    weight: WEIGHTS.investment },
      rentabilityScore:  { label: "Rentability",   value: rent,   weight: WEIGHTS.rentability },
      riskScore:         { label: "Risk",          value: risk,   weight: WEIGHTS.risk },
      energyScore:       { label: "Energy",        value: energy, weight: WEIGHTS.energy },
      bankabilityScore:  { label: "Bankability",   value: bank,   weight: WEIGHTS.bankability },
      projectionScore:   { label: "Projection",    value: proj,   weight: WEIGHTS.projection },
    },
    explanation: generateExplanation(params, m, totalScore),
    strengths: generateStrengths(params, m),
    risks: generateRisks(params, m),
    recommendations: generateRecommendations(params, m, totalScore),
  };
}

export function scoreTrend(): "up" | "down" | "stable" {
  const r = Math.random();
  if (r < 0.33) return "up";
  if (r < 0.66) return "stable";
  return "down";
}
