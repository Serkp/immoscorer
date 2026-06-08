import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/* ───────────────────────────────────────────────────────────
   Keep-Alive — verhindert das Pausieren des Supabase-Free-Projekts.
   Supabase pausiert Projekte nach ~7 Tagen ohne DB-Aktivität. Dieser
   Endpunkt wird per Vercel-Cron (siehe vercel.json) täglich aufgerufen
   und macht eine minimale DB-Abfrage (count, head-only) — das zählt als
   Aktivität und setzt den Inaktivitäts-Timer zurück.

   Absicherung: Ist CRON_SECRET in den Vercel-Env gesetzt, sendet Vercel
   den Header "Authorization: Bearer <CRON_SECRET>" automatisch mit; wir
   prüfen ihn. Ohne gesetztes Secret läuft es offen (nur ein Lese-Ping).
   ─────────────────────────────────────────────────────────── */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseAdmin();
    // head:true überträgt keine Zeilen, nur ein DB-Round-Trip
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, pinged: "profiles" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
