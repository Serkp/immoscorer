import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

const TABLES_SQL = `
-- ══════════════════════════════════════
-- analyses (flat comparison + saved analyses)
-- ══════════════════════════════════════
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT, city TEXT,
  purchase_price NUMERIC, monthly_rent NUMERIC, area_sqm NUMERIC,
  building_year INTEGER, energy_class TEXT, location_grade TEXT,
  management_fee NUMERIC, renovation_count INTEGER,
  total_score INTEGER, investment_score INTEGER, rentability_score INTEGER,
  risk_score INTEGER, financing_score INTEGER, projection_score INTEGER, energy_score INTEGER,
  gross_yield NUMERIC, net_yield NUMERIC, price_factor NUMERIC, sqm_price NUMERIC,
  property_id UUID, inputs JSONB, result JSONB,
  status TEXT DEFAULT 'saved', save_type TEXT DEFAULT 'comparison',
  is_favorite BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT, city TEXT, purchase_price NUMERIC, current_rent NUMERIC,
  area NUMERIC, build_year INTEGER, energy_class TEXT, house_money NUMERIC,
  location_grade TEXT, renovations JSONB DEFAULT '[]',
  score INTEGER, score_data JSONB, location_data JSONB,
  lat NUMERIC, lng NUMERIC,
  is_favorite BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  street TEXT, city TEXT, price NUMERIC, rent NUMERIC, hausgeld NUMERIC,
  area NUMERIC, year INTEGER, energy_class TEXT, location_grade TEXT,
  renovations JSONB DEFAULT '[]', total_score INTEGER, result JSONB,
  is_favorite BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT, stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive', plan TEXT DEFAULT 'free',
  current_period_end TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
`;

const TABLE_NAMES = ["analyses", "portfolio_properties", "properties", "subscriptions"] as const;

export async function GET() {
  const results: { step: string; ok: boolean; error?: string }[] = [];

  try {
    const admin = getSupabaseAdmin();

    // 1. Check each table exists
    for (const table of TABLE_NAMES) {
      const { error } = await admin.from(table).select("id", { count: "exact", head: true });
      if (error && error.message.includes("does not exist")) {
        results.push({ step: `${table} table`, ok: false, error: "Table does not exist — run migration SQL" });
      } else if (error) {
        results.push({ step: `${table} check`, ok: false, error: error.message });
      } else {
        results.push({ step: `${table} table`, ok: true });
      }
    }

    // 2. If analyses exists, test insert+delete to verify columns match
    const analysesOk = results.find((r) => r.step === "analyses table")?.ok;
    if (analysesOk) {
      const testRow = {
        user_id: "00000000-0000-0000-0000-000000000000",
        address: "__setup_test__",
        city: "Test",
        purchase_price: 0,
        monthly_rent: 0,
        area_sqm: 0,
        building_year: 2000,
        energy_class: "A",
        location_grade: "B",
        management_fee: 0,
        renovation_count: 0,
        total_score: 0,
        investment_score: 0,
        rentability_score: 0,
        risk_score: 0,
        financing_score: 0,
        projection_score: 0,
        energy_score: 0,
        gross_yield: 0,
        net_yield: 0,
        price_factor: 0,
        sqm_price: 0,
        status: "test",
        save_type: "test",
      };
      const { data: inserted, error: insertErr } = await admin
        .from("analyses")
        .insert(testRow)
        .select("id")
        .single();
      if (insertErr) {
        results.push({
          step: "analyses column test",
          ok: false,
          error: `Insert failed: ${insertErr.message} (code: ${insertErr.code}, hint: ${insertErr.hint || "none"})`,
        });
      } else {
        await admin.from("analyses").delete().eq("id", inserted.id);
        results.push({ step: "analyses column test", ok: true });
      }
    }

    // 3. Summary
    const missing = results.filter((r) => !r.ok);
    if (missing.length > 0) {
      results.push({
        step: "action_needed",
        ok: false,
        error: `${missing.length} issue(s). Run SQL from supabase/migrations/001_create_tables.sql in Supabase Dashboard SQL Editor, or POST /api/setup-db to get the SQL.`,
      });
    }

    const allOk = results.every((r) => r.ok);
    return NextResponse.json({ ok: allOk, results });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), results }, { status: 500 });
  }
}

export async function POST() {
  // Return the SQL to be run manually in Supabase Dashboard
  return NextResponse.json({
    message: "Run this SQL in your Supabase Dashboard → SQL Editor to create all tables.",
    sql: TABLES_SQL,
  });
}
