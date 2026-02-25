import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Browser client (sets cookies automatically via @supabase/ssr) ──

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  client = createBrowserClient(url, key) as unknown as SupabaseClient;
  return client;
}

// ── Singleton: admin / service-role client (server-side only) ──

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars missing");
  adminClient = createClient(url, key);
  return adminClient;
}
