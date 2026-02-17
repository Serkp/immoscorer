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
  "A+": "excellent", A: "very good", B: "good", C: "acceptable",
  D: "below average", E: "poor", F: "very poor", G: "critically poor", H: "worst-in-class",
};

const LOCATION_RANK: Record<LocationGrade, number> = { A: 100, B: 72, C: 45, D: 20 };
const LOCATION_LABEL: Record<LocationGrade, string> = {
  A: "prime", B: "good", C: "average", D: "developing",
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
   Raw deal quality: yield, rent multiplier, price/m²
   ═══════════════════════════════════════════════════ */

function calcInvestmentScore(_p: ScoringInput, m: Metrics): number {
  let s = 0;

  // Gross yield (0-40 pts)
  if (m.grossYield >= 0.08) s += 40;
  else if (m.grossYield >= 0.06) s += 32;
  else if (m.grossYield >= 0.05) s += 24;
  else if (m.grossYield >= 0.04) s += 16;
  else if (m.grossYield >= 0.03) s += 8;
  else s += 2;

  // Rent multiplier (0-30 pts)
  if (m.rentMultiplier <= 15) s += 30;
  else if (m.rentMultiplier <= 20) s += 24;
  else if (m.rentMultiplier <= 25) s += 16;
  else if (m.rentMultiplier <= 30) s += 8;
  else s += 2;

  // Price per m² (0-30 pts)
  if (m.pricePerSqm <= 1500) s += 30;
  else if (m.pricePerSqm <= 2500) s += 24;
  else if (m.pricePerSqm <= 3500) s += 18;
  else if (m.pricePerSqm <= 5000) s += 10;
  else s += 3;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   2. Rentability Score (15%)
   Net cash-flow viability after hausgeld
   ═══════════════════════════════════════════════════ */

function calcRentabilityScore(_p: ScoringInput, m: Metrics): number {
  let s = 0;

  // Net yield (0-40 pts)
  if (m.netYield >= 0.05) s += 40;
  else if (m.netYield >= 0.04) s += 32;
  else if (m.netYield >= 0.03) s += 24;
  else if (m.netYield >= 0.02) s += 14;
  else if (m.netYield >= 0.01) s += 6;
  else s += 0;

  // Hausgeld ratio (0-30 pts)
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
  else s += 0;

  return clamp(s);
}

/* ═══════════════════════════════════════════════════
   3. Risk Score (15%)
   Higher = lower risk (100 = safest)
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
   Confidence level
   ═══════════════════════════════════════════════════ */

function calcConfidence(p: ScoringInput, m: Metrics, riskScore: number): ConfidenceLevel {
  let deductions = 0;

  // High renovation count means uncertain cost scope
  if (m.renoCount >= 4) deductions += 2;
  else if (m.renoCount >= 2) deductions += 1;

  // Older buildings carry hidden unknowns
  if (m.age >= 60) deductions += 2;
  else if (m.age >= 40) deductions += 1;

  // Poor location has less comparable data
  if (p.locationGrade === "D") deductions += 1;

  // Low risk score compounds uncertainty
  if (riskScore < 40) deductions += 1;

  // Negative cash-flow signals fragile economics
  if (m.netRent < 0) deductions += 1;

  if (deductions <= 1) return "high";
  if (deductions <= 3) return "medium";
  return "low";
}

/* ═══════════════════════════════════════════════════
   Explanation (professional, investor-focused)
   ═══════════════════════════════════════════════════ */

function generateExplanation(p: ScoringInput, m: Metrics, total: number, confidence: ConfidenceLevel): string {
  const yieldPct = (m.grossYield * 100).toFixed(2);
  const netPct = (m.netYield * 100).toFixed(2);
  const ppsm = Math.round(m.pricePerSqm).toLocaleString();
  const factor = m.rentMultiplier.toFixed(1);

  let verdict: string;
  if (total >= 80) verdict = "represents a strong acquisition candidate with attractive risk-adjusted returns";
  else if (total >= 65) verdict = "presents a solid opportunity with sound fundamentals, suitable for a buy-and-hold strategy";
  else if (total >= 50) verdict = "offers moderate potential but requires careful due diligence before commitment";
  else if (total >= 35) verdict = "carries material weaknesses that must be addressed through price negotiation or a clear value-add thesis";
  else verdict = "does not meet minimum investment criteria under standard underwriting assumptions";

  const parts: string[] = [];

  parts.push(
    `Investment Summary: This property achieves a weighted score of ${total}/100 (confidence: ${confidence}) and ${verdict}.`
  );

  parts.push(
    `The asset is priced at \u20AC${p.purchasePrice.toLocaleString()} (\u20AC${ppsm}/m\u00B2 across ${p.areaSqm} m\u00B2), generating \u20AC${p.monthlyRent.toLocaleString()} monthly Kaltmiete against \u20AC${p.housegeld} Hausgeld. This yields a gross return of ${yieldPct}% and a net return of ${netPct}% with a purchase price factor of ${factor}x annual rent.`
  );

  if (m.netRent > 0) {
    parts.push(
      `After Hausgeld deduction, the property produces \u20AC${Math.round(m.netRent).toLocaleString()} net monthly cash-flow before debt service, providing a buffer for financing costs and vacancy reserves.`
    );
  } else {
    parts.push(
      `After Hausgeld, the property runs at a net deficit of \u20AC${Math.abs(Math.round(m.netRent)).toLocaleString()}/month before financing\u2014this negative carry must be offset by appreciation or rent growth to justify the investment.`
    );
  }

  if (m.renoCount > 0) {
    const items = m.renoKeys.join(", ");
    parts.push(
      `Renovation exposure: ${m.renoCount} of 6 assessed building systems require attention (${items}), introducing capex risk and potential construction timeline delays.`
    );
  } else {
    parts.push(
      "The property requires no immediate capital expenditure across the six assessed building systems, supporting stable near-term cash-flow projections."
    );
  }

  parts.push(
    `Built in ${p.baujahr} (${m.age} years), the asset holds energy class ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}) and is situated in a ${LOCATION_LABEL[p.locationGrade]} micro-location (Grade ${p.locationGrade}), which ${p.locationGrade <= "B" ? "underpins strong tenant demand and resale liquidity" : "may limit exit optionality and require longer hold periods"}.`
  );

  return parts.join(" ");
}

/* ═══════════════════════════════════════════════════
   Strengths
   ═══════════════════════════════════════════════════ */

function generateStrengths(p: ScoringInput, m: Metrics): string[] {
  const list: string[] = [];

  if (m.grossYield >= 0.06)
    list.push(`Gross yield of ${(m.grossYield * 100).toFixed(1)}% substantially exceeds the German market average of ~4%, providing a strong income cushion against rate increases.`);
  else if (m.grossYield >= 0.05)
    list.push(`Gross yield of ${(m.grossYield * 100).toFixed(1)}% outperforms the national average, supporting positive leverage at current financing rates.`);

  if (m.hausgeldRatio <= 0.25)
    list.push(`Hausgeld consumes only ${(m.hausgeldRatio * 100).toFixed(0)}% of gross rent, well within the \u226430% threshold favoured by institutional underwriting.`);

  if (m.renoCount === 0)
    list.push("No renovations flagged across all six building systems\u2014the property is stabilized and cash-flow ready from day one.");

  if (ENERGY_RANK[p.energyClass] >= 76)
    list.push(`Energy class ${p.energyClass} positions the asset ahead of pending GEG regulatory tightening, avoiding forced retrofit capex.`);

  if (p.locationGrade <= "B")
    list.push(`${LOCATION_LABEL[p.locationGrade].charAt(0).toUpperCase() + LOCATION_LABEL[p.locationGrade].slice(1)} location (Grade ${p.locationGrade}) ensures low vacancy risk, predictable tenant demand, and stronger bank LTV terms.`);

  if (m.rentMultiplier <= 20)
    list.push(`Purchase price factor of ${m.rentMultiplier.toFixed(1)}x is attractive relative to the 20\u201325x corridor typical in German metro markets.`);

  if (m.pricePerSqm <= 2500)
    list.push(`Entry price of \u20AC${Math.round(m.pricePerSqm).toLocaleString()}/m\u00B2 sits below market median, providing embedded upside through organic price convergence.`);

  if (m.netRent >= 400)
    list.push(`Net monthly surplus of \u20AC${Math.round(m.netRent)} after Hausgeld provides meaningful debt service coverage.`);

  if (m.age <= 15)
    list.push(`Recent construction (${m.age} years) implies modern building standards and lower medium-term maintenance burden.`);

  return list.length > 0 ? list : ["No standout strengths identified\u2014the property scores close to market average across all dimensions."];
}

/* ═══════════════════════════════════════════════════
   Risks
   ═══════════════════════════════════════════════════ */

function generateRisks(p: ScoringInput, m: Metrics): string[] {
  const list: string[] = [];

  if (m.grossYield < 0.03)
    list.push(`Gross yield of ${(m.grossYield * 100).toFixed(1)}% falls well below the break-even threshold for leveraged acquisitions at current interest rates (3.5\u20134.5%).`);
  else if (m.grossYield < 0.04)
    list.push(`A ${(m.grossYield * 100).toFixed(1)}% gross yield leaves thin margin against rising rates\u2014a 50bps rate increase could eliminate cash-flow.`);

  if (m.hausgeldRatio >= 0.5)
    list.push(`Hausgeld absorbs ${(m.hausgeldRatio * 100).toFixed(0)}% of gross rent, signalling either high management overhead or deferred Instandhaltungsr\u00FCcklage contributions.`);
  else if (m.hausgeldRatio >= 0.35)
    list.push(`Hausgeld at ${(m.hausgeldRatio * 100).toFixed(0)}% of rent exceeds the prudent 30% ceiling\u2014verify the breakdown between administration and reserves.`);

  if (m.renoCount >= 4)
    list.push(`${m.renoCount} of 6 building systems need renovation\u2014aggregate capex exposure could reach \u20AC50k\u2013150k+, materially affecting total cost of acquisition.`);
  else if (m.renoCount >= 2)
    list.push(`${m.renoCount} pending renovations (${m.renoKeys.join(", ")}) introduce execution risk and capital requirements that must be underwritten into the bid price.`);

  if (p.renovations.roof)
    list.push("Roof replacement represents one of the highest single-item capex risks (\u20AC15k\u201340k typical unit share) and often triggers Sonderumlage assessments.");

  if (p.renovations.heating && ENERGY_RANK[p.energyClass] < 50)
    list.push("A required heating replacement on a sub-D energy class asset may trigger mandatory full-building energy retrofit under GEG \u00A771\u201372.");

  if (ENERGY_RANK[p.energyClass] < 35)
    list.push(`Energy class ${p.energyClass} (${ENERGY_LABEL[p.energyClass]}) faces accelerating regulatory headwinds\u2014EU Directive 2024/1275 and German GEG amendments may mandate retrofit within the next decade.`);

  if (p.locationGrade === "D")
    list.push("Grade D micro-location carries elevated vacancy and re-letting risk, weaker bank valuations, and limited exit liquidity.");

  if (m.age >= 60)
    list.push(`At ${m.age} years, the building predates modern construction standards\u2014commission a structural survey to identify latent defects not visible in the renovation checklist.`);

  if (m.netRent < 0)
    list.push(`Negative net carry of \u20AC${Math.abs(Math.round(m.netRent))}/month before financing creates an immediate cash-drain that compounds under leverage.`);

  if (m.rentMultiplier >= 30)
    list.push(`A ${m.rentMultiplier.toFixed(1)}x factor implies a 30+ year payback\u2014the investment thesis must rely heavily on capital appreciation rather than income.`);

  if (m.pricePerSqm >= 6000)
    list.push(`At \u20AC${Math.round(m.pricePerSqm).toLocaleString()}/m\u00B2, the entry price is premium\u2014further upside is capped unless the asset occupies a top-tier micro-location.`);

  return list.length > 0 ? list : ["No material risks identified based on the provided data\u2014proceed with standard due diligence."];
}

/* ═══════════════════════════════════════════════════
   Categorized recommendations
   ═══════════════════════════════════════════════════ */

function generateRecommendations(p: ScoringInput, m: Metrics, total: number, bank: number): CategorizedRecommendations {
  const financing: string[] = [];
  const technical: string[] = [];
  const legal: string[] = [];
  const strategy: string[] = [];

  /* ─── Financing ─── */

  if (m.grossYield >= 0.05 && m.netRent > 0)
    financing.push("Yield supports positive leverage\u2014model financing at 80% LTV to confirm cash-flow after debt service at 4% annuity.");
  else if (m.grossYield >= 0.04)
    financing.push("Marginal yield\u2014target a lower LTV (70\u201375%) or negotiate the purchase price down by 5\u201310% to create financing headroom.");
  else
    financing.push("Yield below 4% makes leveraged acquisition risky at current rates\u2014consider a higher equity contribution or pass unless significant rent growth is achievable.");

  if (bank >= 70)
    financing.push("Strong bankability profile\u2014expect competitive financing terms. Request quotes from at least 3 lenders including Interhyp and direct bank channels.");
  else if (bank < 50)
    financing.push("Below-average bankability\u2014banks may require higher equity (30%+), shorter terms, or additional collateral. Prepare supporting documentation upfront.");

  if (m.hausgeldRatio >= 0.35)
    financing.push("Elevated Hausgeld will reduce the debt service coverage ratio\u2014include the full Hausgeld in your bank presentation to avoid surprises in underwriting.");

  if (m.grossYield >= 0.04)
    financing.push("Stress-test the investment at 5.5% interest rate to validate resilience against potential rate corridor widening.");

  /* ─── Technical ─── */

  if (m.renoCount >= 2) {
    technical.push("Obtain binding contractor estimates for all flagged renovations before signing the Kaufvertrag.");
    technical.push("Factor a 15\u201320% contingency buffer above quoted renovation costs to account for scope creep in older buildings.");
  }

  if (p.renovations.roof || p.renovations.facade)
    technical.push("Roof and facade work require WEG approval\u2014verify the Eigent\u00FCmerversammlung schedule and existing Beschl\u00FCsse before budgeting.");

  if (ENERGY_RANK[p.energyClass] < 50) {
    technical.push("Request the current Energieausweis and check compliance deadlines under GEG 2024\u2014non-compliant buildings face mandatory retrofit orders.");
    if (!p.renovations.facade)
      technical.push("Proactive facade insulation (WDVS) could shift the energy class by 1\u20132 grades, unlocking both regulatory compliance and rent uplift potential.");
  }

  if (p.renovations.heating)
    technical.push("Heating modernization must now comply with the 65% renewable energy requirement under GEG \u00A771\u2014W\u00E4rmepumpe or district heating connection should be evaluated.");

  if (m.age >= 40 && m.renoCount === 0)
    technical.push("Despite no flagged issues, commission an independent Baugutachten for a property of this age\u2014hidden defects in plumbing, load-bearing walls, or waterproofing are common.");

  /* ─── Legal ─── */

  if (m.renoCount >= 1)
    legal.push("Review the last 3 years of WEG Protokolle to identify planned Sonderumlagen, pending litigation, and the current Instandhaltungsr\u00FCcklage balance.");

  if (m.grossYield < 0.04 && p.locationGrade <= "B")
    legal.push("Assess \u00A7559 BGB modernization rent increase potential\u2014up to 8% of capex can be passed to the tenant annually, capped at \u20AC2\u20133/m\u00B2 depending on prior rent level.");

  if (p.locationGrade <= "B")
    legal.push("Verify Mietpreisbremse applicability\u2014in regulated markets, the maximum rent at re-letting is capped at 10% above the local Mietspiegel.");

  legal.push("Confirm Grundbuch encumbrances (Abt. II & III): check for Wegerechte, Nießbrauch, Vorkaufsrechte, or outstanding Grundschulden from the seller.");

  if (ENERGY_RANK[p.energyClass] < 35)
    legal.push("Low energy class triggers disclosure obligations under \u00A780 GEG\u2014ensure the seller has provided a valid Energieausweis and factor compliance costs into your offer.");

  /* ─── Strategy ─── */

  if (total >= 75) {
    strategy.push("Strong fundamentals support a core buy-and-hold strategy\u2014target a 10+ year hold with organic rent growth and principal amortization as primary return drivers.");
    strategy.push("Proceed to financing pre-approval and notary appointment. Standard due diligence checklist applies.");
  } else if (total >= 55) {
    strategy.push("Moderate score\u2014benchmark against 2\u20133 comparable listings before committing to ensure relative value.");
    if (m.renoCount >= 2)
      strategy.push("Value-add play: negotiate a renovation discount into the purchase price, execute targeted upgrades, and re-position for higher rent within 12\u201318 months.");
    else
      strategy.push("Optimize by exploring rent adjustment to Mietspiegel level and Hausgeld reduction through WEG cost management initiatives.");
  } else {
    strategy.push("Below-threshold score\u2014only proceed if you have a concrete value-add thesis (deep renovation, change of use, or assembly play) with quantified return projections.");
    if (m.rentMultiplier >= 25)
      strategy.push("Negotiate 10\u201315% below asking price to bring the factor into the 20\u201322x range required for viable leveraged returns.");
  }

  if (p.locationGrade >= "C" && m.grossYield >= 0.06)
    strategy.push("High yield in a developing location suggests a cash-flow-first strategy\u2014accumulate income while monitoring infrastructure catalysts that could drive appreciation.");

  if (p.locationGrade <= "B" && m.grossYield < 0.04)
    strategy.push("Low yield in a premium location is an appreciation bet\u2014validate with 10-year price trend data and assess refinance potential at year 5.");

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
      investmentScore:   { label: "Investment",   value: inv,    weight: WEIGHTS.investment },
      rentabilityScore:  { label: "Rentability",   value: rent,   weight: WEIGHTS.rentability },
      riskScore:         { label: "Risk",          value: risk,   weight: WEIGHTS.risk },
      energyScore:       { label: "Energy",        value: energy, weight: WEIGHTS.energy },
      bankabilityScore:  { label: "Bankability",   value: bank,   weight: WEIGHTS.bankability },
      projectionScore:   { label: "Projection",    value: proj,   weight: WEIGHTS.projection },
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
