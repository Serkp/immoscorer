import { getSupabase } from "./supabase";

// ── Properties (legacy — used by analysis save) ──

export async function savePropertyDB(userId: string, data: {
  street: string; city: string; price: number; rent: number;
  hausgeld: number; area: number; year: number; energyClass: string;
  locationGrade: string; renovations: string[]; totalScore: number;
  result: Record<string, unknown>;
}) {
  const { data: property, error } = await getSupabase()
    .from("properties")
    .insert({
      user_id: userId,
      street: data.street,
      city: data.city,
      price: data.price,
      rent: data.rent,
      hausgeld: data.hausgeld,
      area: data.area,
      year: data.year,
      energy_class: data.energyClass,
      location_grade: data.locationGrade,
      renovations: data.renovations,
      total_score: data.totalScore,
      result: data.result,
    })
    .select()
    .single();
  if (error) throw error;
  return property;
}

export async function getProperties(userId: string) {
  const { data, error } = await getSupabase()
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string) {
  const { error } = await getSupabase().from("properties").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, current: boolean) {
  const { error } = await getSupabase()
    .from("properties")
    .update({ is_favorite: !current })
    .eq("id", id);
  if (error) throw error;
}

// ── Analyses ──

export async function saveAnalysisDB(
  userId: string,
  propertyId: string | null,
  inputs: Record<string, unknown>,
  result: Record<string, unknown>,
  opts?: { status?: string; saveType?: string }
) {
  const { data, error } = await getSupabase()
    .from("analyses")
    .insert({
      user_id: userId,
      property_id: propertyId,
      inputs,
      result,
      status: opts?.status || "temporary",
      save_type: opts?.saveType || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Save analysis with flat columns (for comparison) */
export async function saveComparisonFlat(
  userId: string,
  inp: {
    address: string; city: string; purchasePrice: number; monthlyRent: number;
    areaSqm: number; buildingYear: number; energyClass: string; locationGrade: string;
    managementFee: number; renovationCount: number;
  },
  scores: {
    totalScore: number; investmentScore: number; rentabilityScore: number;
    riskScore: number; financingScore: number; projectionScore: number; energyScore: number;
    grossYield: number; netYield: number; priceFactor: number; sqmPrice: number;
  },
) {
  const { data, error } = await getSupabase()
    .from("analyses")
    .insert({
      user_id: userId,
      address: inp.address,
      city: inp.city,
      purchase_price: inp.purchasePrice,
      monthly_rent: inp.monthlyRent,
      area_sqm: inp.areaSqm,
      building_year: inp.buildingYear,
      energy_class: inp.energyClass,
      location_grade: inp.locationGrade,
      management_fee: inp.managementFee,
      renovation_count: inp.renovationCount,
      total_score: scores.totalScore,
      investment_score: scores.investmentScore,
      rentability_score: scores.rentabilityScore,
      risk_score: scores.riskScore,
      financing_score: scores.financingScore,
      projection_score: scores.projectionScore,
      energy_score: scores.energyScore,
      gross_yield: scores.grossYield,
      net_yield: scores.netYield,
      price_factor: scores.priceFactor,
      sqm_price: scores.sqmPrice,
      status: "saved",
      save_type: "comparison",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAnalyses(userId: string, filters?: { status?: string; saveType?: string }) {
  let query = getSupabase()
    .from("analyses")
    .select("*")
    .eq("user_id", userId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.saveType) query = query.eq("save_type", filters.saveType);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateAnalysis(id: string, updates: Record<string, unknown>) {
  const { error } = await getSupabase()
    .from("analyses")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAnalysis(id: string) {
  const { error } = await getSupabase().from("analyses").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleAnalysisFavorite(id: string, current: boolean) {
  const { error } = await getSupabase()
    .from("analyses")
    .update({ is_favorite: !current })
    .eq("id", id);
  if (error) throw error;
}

// ── Portfolio Properties ──

export async function savePortfolioProperty(userId: string, data: {
  address: string; city: string; purchasePrice: number; currentRent: number;
  area?: number; buildYear?: number; energyClass?: string; houseMoney?: number;
  locationGrade?: string; renovations?: string[];
  score?: number; scoreData?: Record<string, unknown>;
  locationData?: Record<string, unknown>;
  lat?: number; lng?: number;
}) {
  const { data: prop, error } = await getSupabase()
    .from("portfolio_properties")
    .insert({
      user_id: userId,
      address: data.address,
      city: data.city,
      purchase_price: data.purchasePrice,
      current_rent: data.currentRent,
      area: data.area || null,
      build_year: data.buildYear || null,
      energy_class: data.energyClass || null,
      house_money: data.houseMoney || null,
      location_grade: data.locationGrade || null,
      renovations: data.renovations || [],
      score: data.score || null,
      score_data: data.scoreData || null,
      location_data: data.locationData || null,
      lat: data.lat || null,
      lng: data.lng || null,
    })
    .select()
    .single();
  if (error) throw error;
  return prop;
}

export async function getPortfolioProperties(userId: string) {
  const { data, error } = await getSupabase()
    .from("portfolio_properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deletePortfolioProperty(id: string) {
  const { error } = await getSupabase().from("portfolio_properties").delete().eq("id", id);
  if (error) throw error;
}

export async function togglePortfolioFavorite(id: string, current: boolean) {
  const { error } = await getSupabase()
    .from("portfolio_properties")
    .update({ is_favorite: !current })
    .eq("id", id);
  if (error) throw error;
}

// ── Subscription ──

export async function getSubscriptionStatus(userId: string) {
  const { data, error } = await getSupabase()
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function countAnalyses(userId: string) {
  const { count, error } = await getSupabase()
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) return 0;
  return count || 0;
}
