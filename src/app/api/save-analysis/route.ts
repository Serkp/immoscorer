export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  }

  // Verify the user's auth token
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const anonClient = createClient(url, anonKey);
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Use service role client for DB operations (bypasses RLS)
  const supabase = createClient(url, serviceKey);

  // Ensure profile exists (FK constraint)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").upsert(
      { id: user.id, email: user.email || "", updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
    console.log("[save-analysis] profile created for:", user.id);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Build the row — always set user_id from the verified token
  const row = {
    user_id: user.id,
    save_type: "comparison",
    status: "saved",
    ...body,
  };
  // Force user_id from token (prevent spoofing)
  row.user_id = user.id;

  console.log("[save-analysis] inserting:", JSON.stringify(row, null, 2));

  // Try full insert
  const { data, error } = await supabase
    .from("analyses")
    .insert(row)
    .select()
    .single();

  if (!error) {
    return NextResponse.json({ data });
  }

  console.warn("[save-analysis] full insert failed:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  // Fallback: minimal insert with JSONB
  const minimal = {
    user_id: user.id,
    inputs: body,
    result: body.result || body,
    save_type: "comparison",
    status: "saved",
  };

  const { data: data2, error: err2 } = await supabase
    .from("analyses")
    .insert(minimal)
    .select()
    .single();

  if (!err2) {
    return NextResponse.json({ data: data2, fallback: true });
  }

  console.error("[save-analysis] all inserts failed:", {
    message: err2.message,
    code: err2.code,
    details: err2.details,
    hint: err2.hint,
  });

  return NextResponse.json(
    { error: err2.message, code: err2.code, details: err2.details },
    { status: 500 }
  );
}
