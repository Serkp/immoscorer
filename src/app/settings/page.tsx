"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { C } from "@/lib/theme";

interface NotifPrefs {
  zinsbindung_reminder: string;
  newsletter: boolean;
  new_features: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { zinsbindung_reminder: "18", newsletter: true, new_features: true };

export default function SettingsNotificationsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await getSupabase().from("profiles").select("notification_preferences").eq("id", user.id).single();
        if (data?.notification_preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...data.notification_preferences });
        }
      } catch { /* silent - column may not exist */ }
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await getSupabase().from("profiles").upsert({ id: user.id, notification_preferences: prefs, updated_at: new Date().toISOString() }, { onConflict: "id" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silent */ }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold" style={{ color: C.text }}>Benachrichtigungen</h2>
        <p className="text-xs mt-1" style={{ color: C.dim }}>Legen Sie fest, worüber Sie informiert werden möchten.</p>
      </div>

      <Card className="p-5 space-y-5">
        {/* Zinsbindungs-Erinnerung */}
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: C.text }}>Zinsbindungs-Erinnerung</p>
          <p className="text-[11px]" style={{ color: C.dim }}>Wann möchten Sie an ablaufende Zinsbindungen erinnert werden?</p>
          <div className="flex flex-wrap gap-2">
            {["24", "18", "12", "6"].map((m) => (
              <button key={m} onClick={() => setPrefs((p) => ({ ...p, zinsbindung_reminder: m }))}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: prefs.zinsbindung_reminder === m ? C.accentMid : C.surface,
                  border: `1px solid ${prefs.zinsbindung_reminder === m ? C.accent : C.border}`,
                  color: prefs.zinsbindung_reminder === m ? C.accent : C.sub,
                }}>
                {m} Monate
              </button>
            ))}
          </div>
        </div>

        <div className="h-px" style={{ background: C.border }} />

        {/* Newsletter */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.text }}>Newsletter</p>
            <p className="text-[11px]" style={{ color: C.dim }}>Markttrends und Investment-Tipps</p>
          </div>
          <Toggle checked={prefs.newsletter} onChange={(v) => setPrefs((p) => ({ ...p, newsletter: v }))} />
        </div>

        <div className="h-px" style={{ background: C.border }} />

        {/* New Features */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: C.text }}>Neue Features</p>
            <p className="text-[11px]" style={{ color: C.dim }}>Benachrichtigung über neue Funktionen</p>
          </div>
          <Toggle checked={prefs.new_features} onChange={(v) => setPrefs((p) => ({ ...p, new_features: v }))} />
        </div>
      </Card>

      <button onClick={handleSave} disabled={saving}
        className="rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
        {saving ? "Wird gespeichert..." : saved ? "Gespeichert!" : "Änderungen speichern"}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-all"
      style={{ background: checked ? C.accent : C.surface3 }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ background: "#fff", left: checked ? 22 : 2 }} />
    </button>
  );
}
