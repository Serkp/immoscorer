import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Only safe columns that are guaranteed to exist
const SAFE_ANALYSES_COLUMNS = [
  "user_id", "address", "city", "purchase_price", "monthly_rent", "area_sqm",
  "building_year", "energy_class", "management_fee", "renovation_count",
  "total_score", "investment_score", "rentability_score", "risk_score",
  "financing_score", "future_score", "energy_score",
  "gross_yield", "net_yield", "price_factor", "location_grade",
  "save_type", "is_favorite", "created_at",
] as const;

const TABLES_SQL = `
-- analyses (flat comparison + saved analyses)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT, city TEXT,
  purchase_price NUMERIC, monthly_rent NUMERIC, area_sqm NUMERIC,
  building_year INTEGER, energy_class TEXT, location_grade TEXT,
  management_fee NUMERIC, renovation_count INTEGER,
  total_score INTEGER, investment_score INTEGER, rentability_score INTEGER,
  risk_score INTEGER, financing_score INTEGER, future_score INTEGER, energy_score INTEGER,
  gross_yield NUMERIC, net_yield NUMERIC, price_factor NUMERIC,
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
  is_favorite BOOLEAN DEFAULT false,
  property_type TEXT, apartment_type TEXT, rooms NUMERIC,
  purchase_date TEXT, loan_amount NUMERIC, interest_rate NUMERIC,
  fixed_rate_until TEXT, monthly_payment NUMERIC, repayment_rate NUMERIC,
  special_repayment_allowed BOOLEAN DEFAULT false, special_repayment_amount NUMERIC,
  is_rented TEXT, monthly_rent NUMERIC, rental_since TEXT,
  unit_count INTEGER, total_rent NUMERIC, units_rented INTEGER,
  estimated_market_value NUMERIC,
  inputs JSONB,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
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

// Columns to add if they're missing from existing tables
const ALTER_PORTFOLIO_SQL = [
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS property_type TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS apartment_type TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS rooms NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS purchase_date TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS loan_amount NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS interest_rate NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS fixed_rate_until TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS repayment_rate NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS special_repayment_allowed BOOLEAN DEFAULT false;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS special_repayment_amount NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS is_rented TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS rental_since TEXT;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS unit_count INTEGER;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS total_rent NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS units_rented INTEGER;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS estimated_market_value NUMERIC;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS inputs JSONB;",
  "ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();",
];

const ALTER_COLUMNS_SQL = [
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS future_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS investment_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS rentability_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS risk_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS financing_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS energy_score INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS gross_yield NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS net_yield NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS price_factor NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS location_grade TEXT;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS management_fee NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS renovation_count INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS area_sqm NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS building_year INTEGER;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS purchase_price NUMERIC;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS address TEXT;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS city TEXT;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS energy_class TEXT;",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS save_type TEXT DEFAULT 'comparison';",
  "ALTER TABLE analyses ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;",
];

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

    // 2. If analyses table exists, test insert+delete with ONLY safe columns
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
        future_score: 0,
        energy_score: 0,
        gross_yield: 0,
        net_yield: 0,
        price_factor: 0,
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
    const issues = results.filter((r) => !r.ok);
    if (issues.length > 0) {
      results.push({
        step: "action_needed",
        ok: false,
        error: `${issues.length} issue(s). POST /api/setup-db to attempt auto-fix, or run SQL from supabase/migrations/001_create_tables.sql manually.`,
      });
    }

    const allOk = results.every((r) => r.ok);
    return NextResponse.json({
      ok: allOk,
      results,
      safe_columns: SAFE_ANALYSES_COLUMNS,
      portfolio_alter_sql: ALTER_PORTFOLIO_SQL,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), results }, { status: 500 });
  }
}

export async function POST() {
  const results: { step: string; ok: boolean; error?: string }[] = [];

  try {
    const admin = getSupabaseAdmin();

    // 1. Check if analyses table exists
    const { error: checkErr } = await admin.from("analyses").select("id", { count: "exact", head: true });

    if (checkErr && checkErr.message.includes("does not exist")) {
      // Table doesn't exist — can't create via REST API, return SQL
      results.push({
        step: "analyses table missing",
        ok: false,
        error: "Table does not exist. Create it manually with the SQL below.",
      });
      return NextResponse.json({
        ok: false,
        results,
        message: "Run this SQL in Supabase Dashboard → SQL Editor:",
        sql: TABLES_SQL,
      });
    }

    // 2. Table exists but columns might be missing — try to add them via admin
    //    Supabase REST API doesn't support ALTER TABLE, but we can try the rpc approach
    //    First, test if a full insert works
    const testRow = {
      user_id: "00000000-0000-0000-0000-000000000000",
      address: "__fix_test__",
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
      future_score: 0,
      energy_score: 0,
      gross_yield: 0,
      net_yield: 0,
      price_factor: 0,
      save_type: "test",
    };

    const { data: inserted, error: insertErr } = await admin
      .from("analyses")
      .insert(testRow)
      .select("id")
      .single();

    if (!insertErr && inserted) {
      // All columns exist, clean up test row
      await admin.from("analyses").delete().eq("id", inserted.id);
      results.push({ step: "column check", ok: true, error: undefined });
      return NextResponse.json({
        ok: true,
        results,
        message: "All columns exist. The save should work now.",
      });
    }

    // 3. Insert failed — likely missing columns
    results.push({
      step: "column check",
      ok: false,
      error: `${insertErr?.message} (code: ${insertErr?.code})`,
    });

    // 4. Try to fix by adding missing columns via Supabase SQL API
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (key) {
      // Use Supabase's pg REST endpoint to run ALTER TABLE statements
      const alterSql = ALTER_COLUMNS_SQL.join("\n");
      const sqlRes = await fetch(`${url}/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({}),
      });

      // The generic rpc endpoint won't work for arbitrary SQL
      // Provide the ALTER TABLE SQL for manual execution
      results.push({
        step: "auto-fix attempt",
        ok: false,
        error: "Cannot run ALTER TABLE via REST API. Run the SQL below manually.",
      });

      // Suppress unused variable warning
      void sqlRes;

      return NextResponse.json({
        ok: false,
        results,
        message: "Missing columns detected. Run this SQL in Supabase Dashboard → SQL Editor:",
        sql: alterSql,
        full_create_sql: TABLES_SQL,
      });
    }

    return NextResponse.json({
      ok: false,
      results,
      message: "Missing columns. No SUPABASE_SERVICE_ROLE_KEY found. Run SQL manually:",
      sql: ALTER_COLUMNS_SQL.join("\n"),
      full_create_sql: TABLES_SQL,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), results }, { status: 500 });
  }
}
