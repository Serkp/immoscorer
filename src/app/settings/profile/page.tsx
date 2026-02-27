"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { C } from "@/lib/theme";

export default function ProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    // Try loading from profiles table
    (async () => {
      try {
        const { data } = await getSupabase().from("profiles").select("first_name, last_name, phone, company, full_name").eq("id", user.id).single();
        if (data) {
          if (data.first_name) setFirstName(data.first_name);
          else if (data.full_name) {
            const parts = data.full_name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (data.last_name) setLastName(data.last_name);
          if (data.phone) setPhone(data.phone);
          if (data.company) setCompany(data.company);
        }
      } catch {
        // Fallback to user metadata
        const meta = user.user_metadata || {};
        const fullName = meta.full_name || "";
        const parts = fullName.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    })();
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await getSupabase().from("profiles").upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        company,
        email: user.email,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (err) throw err;

      // Also update user metadata
      await getSupabase().auth.updateUser({
        data: { full_name: `${firstName} ${lastName}`.trim() },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("[Profile] save error:", e);
      setError("Fehler beim Speichern. Einige Felder werden möglicherweise nicht unterstützt.");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold" style={{ color: C.text }}>Profil</h2>
        <p className="text-xs mt-1" style={{ color: C.dim }}>Ihre persönlichen Daten verwalten.</p>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
          {error}
        </div>
      )}

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Vorname" value={firstName} onChange={setFirstName} placeholder="Max" />
          <Input label="Nachname" value={lastName} onChange={setLastName} placeholder="Mustermann" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium" style={{ color: C.sub }}>E-Mail-Adresse</label>
          <div className="w-full rounded-xl px-3.5 py-2.5 text-sm" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.dim }}>
            {user?.email || "—"}
          </div>
          <p className="text-[10px]" style={{ color: C.dim }}>E-Mail kann unter Sicherheit geändert werden.</p>
        </div>

        <Input label="Telefon (optional)" value={phone} onChange={setPhone} placeholder="+49 170 1234567" />
        <Input label="Firma / Unternehmen (optional)" value={company} onChange={setCompany} placeholder="Mustermann GmbH" />
      </Card>

      <button onClick={handleSave} disabled={saving}
        className="rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
        {saving ? "Wird gespeichert..." : saved ? "Gespeichert!" : "Änderungen speichern"}
      </button>
    </div>
  );
}
