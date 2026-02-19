import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Singleton: public anon client ──

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  client = createClient(url, key);
  return client;
}

// ── Singleton: admin / service-role client ──

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars missing");
  adminClient = createClient(url, key);
  return adminClient;
}
