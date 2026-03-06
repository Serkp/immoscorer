import { getSupabase } from "./supabase";

// ── Profile helper — ensures FK constraint is satisfied before inserts ──

export async function ensureProfileExists(userId: string, email?: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!data) {
    // Try insert first, fall back to upsert
    const row = {
      id: userId,
      email: email || "",
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").insert(row);
    if (error) {
      // Insert failed (maybe duplicate) — try upsert
      const { error: err2 } = await supabase
        .from("profiles")
        .upsert(row, { onConflict: "id" });
      if (err2) {
        console.error("[ensureProfileExists] all attempts failed:", err2.message);
      } else {
        console.log("[ensureProfileExists] profile upserted for:", userId);
      }
    } else {
      console.log("[ensureProfileExists] profile created for:", userId);
    }
  }
}

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
  // Ensure profile exists (FK constraint)
  await ensureProfileExists(userId);

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
    propertyType?: string; apartmentType?: string; rooms?: number;
    estimatedUtilities?: number; unitCount?: number;
  },
  scores: {
    totalScore: number; investmentScore: number; rentabilityScore: number;
    riskScore: number; financingScore: number; futureScore: number; energyScore: number;
    grossYield: number; netYield: number; priceFactor: number;
  },
) {
  // Full row with all flat columns
  const fullRow = {
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
    future_score: scores.futureScore,
    energy_score: scores.energyScore,
    gross_yield: scores.grossYield,
    net_yield: scores.netYield,
    price_factor: scores.priceFactor,
    save_type: "comparison",
    status: "saved",
    // JSONB columns — required NOT NULL
    inputs: inp,
    result: scores,
  };
  // Ensure profile exists (FK constraint)
  await ensureProfileExists(userId);

  console.log("[saveComparisonFlat] inserting into analyses:", JSON.stringify(fullRow, null, 2));
  const { data, error } = await getSupabase()
    .from("analyses")
    .insert(fullRow)
    .select()
    .single();

  if (!error) return data;

  // Full insert failed — try fallback with only essential columns
  console.warn("[saveComparisonFlat] full insert failed:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  // Minimal fallback: only columns guaranteed to exist + JSONB
  const minimalRow = {
    user_id: userId,
    inputs: { ...inp, ...scores, savedAt: new Date().toISOString() },
    result: scores,
    save_type: "comparison",
    status: "saved",
  };

  console.log("[saveComparisonFlat] trying minimal fallback...");
  const { data: data2, error: err2 } = await getSupabase()
    .from("analyses")
    .insert(minimalRow)
    .select()
    .single();

  if (!err2) {
    console.log("[saveComparisonFlat] minimal fallback succeeded");
    return data2;
  }

  console.error("[saveComparisonFlat] all insert attempts failed:", {
    message: err2.message,
    code: err2.code,
    details: err2.details,
    hint: err2.hint,
  });

  const dbError = new Error(`Speichern fehlgeschlagen: ${error.message} (code: ${error.code})`);
  (dbError as unknown as Record<string, unknown>).supabaseError = error;
  throw dbError;
}

export async function getAnalysisById(id: string, userId: string) {
  const { data, error } = await getSupabase()
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
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
  if (error) {
    console.error("[getAnalyses] error:", { message: error.message, code: error.code, details: error.details });
    // Table doesn't exist or column errors — return empty instead of crashing
    if (error.code === "42P01" || error.code === "42703") return [];
    throw error;
  }
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
  propertyType?: string; apartmentType?: string; rooms?: number;
  purchaseDate?: string; loanAmount?: number; interestRate?: number;
  fixedRateUntil?: string; monthlyPayment?: number; repaymentRate?: number;
  specialRepaymentAllowed?: boolean; specialRepaymentAmount?: number;
  isRented?: string; monthlyRent?: number; rentalSince?: string;
  unitCount?: number; totalRent?: number; unitsRented?: number;
  estimatedMarketValue?: number;
}) {
  const allData = {
    address: data.address, city: data.city,
    purchasePrice: data.purchasePrice, currentRent: data.currentRent,
    area: data.area, buildYear: data.buildYear, energyClass: data.energyClass,
    houseMoney: data.houseMoney, locationGrade: data.locationGrade,
    renovations: data.renovations, score: data.score, scoreData: data.scoreData,
    locationData: data.locationData, lat: data.lat, lng: data.lng,
    propertyType: data.propertyType, apartmentType: data.apartmentType, rooms: data.rooms,
    purchaseDate: data.purchaseDate, loanAmount: data.loanAmount, interestRate: data.interestRate,
    fixedRateUntil: data.fixedRateUntil, monthlyPayment: data.monthlyPayment,
    repaymentRate: data.repaymentRate, specialRepaymentAllowed: data.specialRepaymentAllowed,
    specialRepaymentAmount: data.specialRepaymentAmount, isRented: data.isRented,
    monthlyRent: data.monthlyRent, rentalSince: data.rentalSince,
    unitCount: data.unitCount, totalRent: data.totalRent, unitsRented: data.unitsRented,
    estimatedMarketValue: data.estimatedMarketValue,
  };

  // Ensure profile exists (FK constraint)
  await ensureProfileExists(userId);

  // Full row with all columns
  const fullRow: Record<string, unknown> = {
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
    property_type: data.propertyType || null,
    apartment_type: data.apartmentType || null,
    rooms: data.rooms || null,
    purchase_date: data.purchaseDate || null,
    loan_amount: data.loanAmount || null,
    interest_rate: data.interestRate || null,
    fixed_rate_until: data.fixedRateUntil || null,
    monthly_payment: data.monthlyPayment || null,
    repayment_rate: data.repaymentRate || null,
    special_repayment_allowed: data.specialRepaymentAllowed || false,
    special_repayment_amount: data.specialRepaymentAmount || null,
    is_rented: data.isRented || null,
    monthly_rent: data.monthlyRent || null,
    rental_since: data.rentalSince || null,
    unit_count: data.unitCount || null,
    total_rent: data.totalRent || null,
    units_rented: data.unitsRented || null,
    estimated_market_value: data.estimatedMarketValue || null,
  };

  console.log("[savePortfolioProperty] trying full insert...");
  const { data: prop, error } = await getSupabase()
    .from("portfolio_properties")
    .insert(fullRow)
    .select()
    .single();

  if (!error) return prop;

  // Full insert failed — log and try minimal fallback with JSONB inputs column
  console.error("[savePortfolioProperty] full insert failed:", JSON.stringify({
    message: error.message, code: error.code, details: error.details, hint: error.hint,
  }));

  console.log("[savePortfolioProperty] trying minimal fallback with inputs JSONB...");
  const minimalRow: Record<string, unknown> = {
    user_id: userId,
    address: data.address,
    city: data.city,
    purchase_price: data.purchasePrice,
    current_rent: data.currentRent,
    inputs: allData,
  };

  const { data: prop2, error: err2 } = await getSupabase()
    .from("portfolio_properties")
    .insert(minimalRow)
    .select()
    .single();

  if (!err2) {
    console.log("[savePortfolioProperty] minimal fallback succeeded (data stored in inputs JSONB)");
    return prop2;
  }

  // Even minimal failed — try absolute minimum
  console.error("[savePortfolioProperty] minimal fallback failed:", JSON.stringify({
    message: err2.message, code: err2.code, details: err2.details, hint: err2.hint,
  }));

  console.log("[savePortfolioProperty] trying absolute minimum insert...");
  const minRow = {
    user_id: userId,
    address: data.address,
    city: data.city,
    purchase_price: data.purchasePrice,
    current_rent: data.currentRent,
  };

  const { data: prop3, error: err3 } = await getSupabase()
    .from("portfolio_properties")
    .insert(minRow)
    .select()
    .single();

  if (!err3) {
    console.log("[savePortfolioProperty] absolute minimum insert succeeded");
    return prop3;
  }

  console.error("[savePortfolioProperty] all insert attempts failed:", JSON.stringify({
    message: err3.message, code: err3.code, details: err3.details, hint: err3.hint,
  }));

  const dbError = new Error(
    `Portfolio speichern fehlgeschlagen: ${error.message} (code: ${error.code})` +
    (error.hint ? ` | Hinweis: ${error.hint}` : "") +
    (error.details ? ` | Details: ${error.details}` : "")
  );
  (dbError as unknown as Record<string, unknown>).supabaseError = error;
  throw dbError;
}

export async function updatePortfolioProperty(id: string, data: Record<string, unknown>) {
  const { error } = await getSupabase()
    .from("portfolio_properties")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getPortfolioProperties(userId: string) {
  const { data, error } = await getSupabase()
    .from("portfolio_properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getPortfolioProperties] error:", { message: error.message, code: error.code, details: error.details });
    // Table doesn't exist or column errors — return empty instead of crashing
    if (error.code === "42P01" || error.code === "42703") return [];
    throw error;
  }
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
