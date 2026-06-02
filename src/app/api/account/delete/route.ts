import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, TOO_MANY } from "@/lib/rate-limit";

/* DSGVO Art. 17 — vollständige Löschung: entfernt alle Daten des Nutzers UND
   den Auth-Account selbst (über die Admin-API). Erfordert einen gültigen
   Login-Token (kein Vertrauen auf Body-Werte). */
export async function POST(req: NextRequest) {
  if (!rateLimit(`account-delete:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json(TOO_MANY.body, { status: TOO_MANY.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server config missing" }, { status: 500 });
  }

  // Login-Token verifizieren
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const anon = createClient(url, anonKey);
  const {
    data: { user },
    error: authErr,
  } = await anon.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Ungültige Sitzung" }, { status: 401 });
  }

  try {
    const admin = getSupabaseAdmin();

    // Alle nutzerbezogenen Daten entfernen (Tabellen, die es ggf. nicht gibt,
    // ignorieren wir — .delete() wirft nicht, sondern liefert error).
    await admin.from("analyses").delete().eq("user_id", user.id);
    await admin.from("portfolio_properties").delete().eq("user_id", user.id);
    await admin.from("properties").delete().eq("user_id", user.id);
    await admin.from("strategies").delete().eq("user_id", user.id);
    await admin.from("financing_leads").delete().eq("user_id", user.id);
    await admin.from("subscriptions").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // Auth-Account selbst löschen (Admin-API)
    const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
    if (delErr) {
      console.error("[account/delete] deleteUser failed:", delErr.message);
      return NextResponse.json(
        { error: "Account konnte nicht vollständig gelöscht werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/delete] error:", err);
    return NextResponse.json(
      { error: "Löschung fehlgeschlagen. Bitte kontaktieren Sie den Support." },
      { status: 500 },
    );
  }
}
