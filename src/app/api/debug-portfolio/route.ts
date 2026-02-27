import { getSupabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const results: { step: string; ok: boolean; detail?: string }[] = [];

  try {
    const admin = getSupabaseAdmin();

    // 1. Check if table exists
    const { error: checkErr } = await admin
      .from("portfolio_properties")
      .select("id", { count: "exact", head: true });

    if (checkErr && checkErr.message.includes("does not exist")) {
      results.push({
        step: "table_exists",
        ok: false,
        detail: "Tabelle portfolio_properties existiert NICHT. Bitte SQL ausführen.",
      });

      return NextResponse.json({
        ok: false,
        results,
        create_sql: CREATE_TABLE_SQL,
        message: "Tabelle fehlt. Bitte dieses SQL im Supabase Dashboard → SQL Editor ausführen.",
      });
    }

    if (checkErr) {
      results.push({ step: "table_exists", ok: false, detail: checkErr.message });
      return NextResponse.json({ ok: false, results });
    }

    results.push({ step: "table_exists", ok: true, detail: "portfolio_properties existiert" });

    // 2. Check which columns exist by attempting a select
    const expectedColumns = [
      "id", "user_id", "address", "city", "purchase_price", "current_rent",
      "area", "build_year", "energy_class", "house_money", "location_grade",
      "renovations", "score", "score_data", "location_data", "lat", "lng",
      "is_favorite", "property_type", "apartment_type", "rooms",
      "purchase_date", "loan_amount", "interest_rate", "fixed_rate_until",
      "monthly_payment", "repayment_rate", "special_repayment_allowed",
      "special_repayment_amount", "is_rented", "monthly_rent", "rental_since",
      "unit_count", "total_rent", "units_rented", "estimated_market_value",
      "inputs", "created_at", "updated_at",
    ];

    const existing: string[] = [];
    const missing: string[] = [];

    for (const col of expectedColumns) {
      const { error: colErr } = await admin
        .from("portfolio_properties")
        .select(col)
        .limit(0);
      if (colErr) {
        missing.push(col);
      } else {
        existing.push(col);
      }
    }

    results.push({
      step: "columns_check",
      ok: missing.length === 0,
      detail: missing.length === 0
        ? `Alle ${existing.length} Spalten vorhanden`
        : `${missing.length} Spalten fehlen: ${missing.join(", ")}`,
    });

    // 3. Test minimal insert
    const { data: minInserted, error: minErr } = await admin
      .from("portfolio_properties")
      .insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        address: "__debug_test__",
        city: "Test",
        purchase_price: 0,
        current_rent: 0,
      })
      .select("id")
      .single();

    if (minErr) {
      results.push({
        step: "minimal_insert_test",
        ok: false,
        detail: `${minErr.message} (code: ${minErr.code}, hint: ${minErr.hint || "none"})`,
      });
    } else {
      await admin.from("portfolio_properties").delete().eq("id", minInserted.id);
      results.push({ step: "minimal_insert_test", ok: true, detail: "Minimaler Insert funktioniert" });
    }

    // 4. Test full insert
    const fullTestRow: Record<string, unknown> = {
      user_id: "00000000-0000-0000-0000-000000000000",
      address: "__debug_full_test__",
      city: "FullTest",
      purchase_price: 100000,
      current_rent: 500,
      area: 80,
      build_year: 2000,
      energy_class: "C",
      house_money: 250,
      location_grade: "B",
      property_type: "etw",
      rooms: 3,
      purchase_date: "01/2020",
      loan_amount: 80000,
      interest_rate: 1.8,
      fixed_rate_until: "01/2030",
      monthly_payment: 580,
      repayment_rate: 2.0,
      special_repayment_allowed: false,
      is_rented: "ja",
      monthly_rent: 500,
      estimated_market_value: 120000,
    };

    const { data: fullInserted, error: fullErr } = await admin
      .from("portfolio_properties")
      .insert(fullTestRow)
      .select("id")
      .single();

    if (fullErr) {
      results.push({
        step: "full_insert_test",
        ok: false,
        detail: `${fullErr.message} (code: ${fullErr.code}, hint: ${fullErr.hint || "none"})`,
      });
    } else {
      await admin.from("portfolio_properties").delete().eq("id", fullInserted.id);
      results.push({ step: "full_insert_test", ok: true, detail: "Voller Insert funktioniert" });
    }

    // 5. Test inputs JSONB fallback
    if (existing.includes("inputs")) {
      const { data: jsonbInserted, error: jsonbErr } = await admin
        .from("portfolio_properties")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          address: "__debug_jsonb_test__",
          city: "JSONBTest",
          purchase_price: 0,
          current_rent: 0,
          inputs: { test: true, allFormData: "would go here" },
        })
        .select("id")
        .single();

      if (jsonbErr) {
        results.push({
          step: "jsonb_fallback_test",
          ok: false,
          detail: `${jsonbErr.message} (code: ${jsonbErr.code})`,
        });
      } else {
        await admin.from("portfolio_properties").delete().eq("id", jsonbInserted.id);
        results.push({ step: "jsonb_fallback_test", ok: true, detail: "JSONB inputs Fallback funktioniert" });
      }
    } else {
      results.push({
        step: "jsonb_fallback_test",
        ok: false,
        detail: "Spalte 'inputs' fehlt — Fallback nicht möglich",
      });
    }

    // 6. Generate fix SQL if needed
    const alterSql = missing.map((col) => {
      const def = COLUMN_DEFS[col];
      return def
        ? `ALTER TABLE portfolio_properties ADD COLUMN IF NOT EXISTS ${col} ${def};`
        : `-- Unknown column: ${col}`;
    });

    const allOk = results.every((r) => r.ok);
    return NextResponse.json({
      ok: allOk,
      results,
      existing_columns: existing,
      missing_columns: missing,
      ...(missing.length > 0 ? { fix_sql: alterSql.join("\n") } : {}),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), results }, { status: 500 });
  }
}

const COLUMN_DEFS: Record<string, string> = {
  id: "UUID DEFAULT gen_random_uuid() PRIMARY KEY",
  user_id: "UUID NOT NULL",
  address: "TEXT",
  city: "TEXT",
  purchase_price: "NUMERIC",
  current_rent: "NUMERIC",
  area: "NUMERIC",
  build_year: "INTEGER",
  energy_class: "TEXT",
  house_money: "NUMERIC",
  location_grade: "TEXT",
  renovations: "JSONB DEFAULT '[]'",
  score: "INTEGER",
  score_data: "JSONB",
  location_data: "JSONB",
  lat: "NUMERIC",
  lng: "NUMERIC",
  is_favorite: "BOOLEAN DEFAULT false",
  property_type: "TEXT",
  apartment_type: "TEXT",
  rooms: "NUMERIC",
  purchase_date: "TEXT",
  loan_amount: "NUMERIC",
  interest_rate: "NUMERIC",
  fixed_rate_until: "TEXT",
  monthly_payment: "NUMERIC",
  repayment_rate: "NUMERIC",
  special_repayment_allowed: "BOOLEAN DEFAULT false",
  special_repayment_amount: "NUMERIC",
  is_rented: "TEXT",
  monthly_rent: "NUMERIC",
  rental_since: "TEXT",
  unit_count: "INTEGER",
  total_rent: "NUMERIC",
  units_rented: "INTEGER",
  estimated_market_value: "NUMERIC",
  inputs: "JSONB",
  created_at: "TIMESTAMPTZ DEFAULT now()",
  updated_at: "TIMESTAMPTZ DEFAULT now()",
};

const CREATE_TABLE_SQL = `
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

ALTER TABLE portfolio_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio_properties"
  ON portfolio_properties FOR ALL
  USING (auth.uid() = user_id);
`;
