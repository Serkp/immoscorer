export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey);
  const results: Record<string, unknown> = {};

  // 1. Check tables exist
  for (const table of ["analyses", "portfolio_properties", "profiles"]) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    results[`table_${table}`] = error
      ? { error: error.message, code: error.code }
      : { exists: true, sampleCount: data?.length ?? 0 };
  }

  // 2. Check analyses columns
  const { data: analysesRow, error: analysesErr } = await supabase
    .from("analyses")
    .select("id, user_id, inputs, result, status, save_type, created_at")
    .limit(1);
  results.analyses_columns = analysesErr
    ? { error: analysesErr.message, code: analysesErr.code }
    : { ok: true, sample: analysesRow };

  // 3. Check portfolio_properties columns
  const { data: portfolioRow, error: portfolioErr } = await supabase
    .from("portfolio_properties")
    .select("id, user_id, address, city, purchase_price, current_rent, created_at")
    .limit(1);
  results.portfolio_columns = portfolioErr
    ? { error: portfolioErr.message, code: portfolioErr.code }
    : { ok: true, sample: portfolioRow };

  // 4. Test insert into analyses (then delete)
  const testRow = {
    user_id: "00000000-0000-0000-0000-000000000000",
    inputs: { test: true },
    result: { test: true },
    status: "temporary",
    save_type: "debug",
  };
  const { data: inserted, error: insertErr } = await supabase
    .from("analyses")
    .insert(testRow)
    .select()
    .single();
  if (insertErr) {
    results.test_insert_analyses = { error: insertErr.message, code: insertErr.code, details: insertErr.details, hint: insertErr.hint };
  } else {
    results.test_insert_analyses = { ok: true, id: inserted.id };
    // Clean up
    await supabase.from("analyses").delete().eq("id", inserted.id);
  }

  // 5. Test insert into portfolio_properties (then delete)
  const testPortfolio = {
    user_id: "00000000-0000-0000-0000-000000000000",
    address: "Debug Test",
    city: "Test",
    purchase_price: 100000,
    current_rent: 500,
  };
  const { data: inserted2, error: insertErr2 } = await supabase
    .from("portfolio_properties")
    .insert(testPortfolio)
    .select()
    .single();
  if (insertErr2) {
    results.test_insert_portfolio = { error: insertErr2.message, code: insertErr2.code, details: insertErr2.details, hint: insertErr2.hint };
  } else {
    results.test_insert_portfolio = { ok: true, id: inserted2.id };
    await supabase.from("portfolio_properties").delete().eq("id", inserted2.id);
  }

  // 6. List auth users
  const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
  results.auth_users = authErr
    ? { error: authErr.message }
    : {
        count: authUsers?.users?.length ?? 0,
        users: authUsers?.users?.map((u) => ({
          id: u.id,
          email: u.email,
          created: u.created_at,
        })),
      };

  // 7. Count analyses per user
  const { data: allAnalyses, error: allErr } = await supabase
    .from("analyses")
    .select("id, user_id, status, save_type, created_at");
  if (!allErr && allAnalyses) {
    const byUser: Record<string, number> = {};
    for (const a of allAnalyses) {
      byUser[a.user_id] = (byUser[a.user_id] || 0) + 1;
    }
    results.analyses_by_user = byUser;
    results.analyses_total = allAnalyses.length;
    results.analyses_details = allAnalyses.map((a) => ({
      id: a.id,
      user_id: a.user_id,
      status: a.status,
      save_type: a.save_type,
      created_at: a.created_at,
    }));
  }

  // 8. Count portfolio properties per user
  const { data: allPortfolio, error: allPortErr } = await supabase
    .from("portfolio_properties")
    .select("id, user_id, address, city, created_at");
  if (!allPortErr && allPortfolio) {
    const byUser: Record<string, number> = {};
    for (const p of allPortfolio) {
      byUser[p.user_id] = (byUser[p.user_id] || 0) + 1;
    }
    results.portfolio_by_user = byUser;
    results.portfolio_total = allPortfolio.length;
  }

  return NextResponse.json(results, { status: 200 });
}
