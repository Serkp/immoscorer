import { supabase } from "./supabase";

// ── Properties ──

export async function savePropertyDB(userId: string, data: {
  street: string; city: string; price: number; rent: number;
  hausgeld: number; area: number; year: number; energyClass: string;
  locationGrade: string; renovations: string[]; totalScore: number;
  result: Record<string, unknown>;
}) {
  const { data: property, error } = await supabase
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
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(id: string, current: boolean) {
  const { error } = await supabase
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
  result: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("analyses")
    .insert({ user_id: userId, property_id: propertyId, inputs, result })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAnalyses(userId: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// ── Subscription ──

export async function getSubscriptionStatus(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();
  if (error) return null;
  return data;
}

export async function countAnalyses(userId: string) {
  const { count, error } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) return 0;
  return count || 0;
}
