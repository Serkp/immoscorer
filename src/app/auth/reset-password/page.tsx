"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase processes the token fragment on load via onAuthStateChange
  useEffect(() => {
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check if session already exists (token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.bg }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-6 space-y-6"
        style={{ background: C.bg2, border: `1px solid ${C.border}`, boxShadow: `0 0 60px ${C.accentDim}` }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AIOrb size={40} active />
          <h2 className="text-lg font-bold" style={{ color: C.text }}>
            Neues Passwort festlegen
          </h2>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="rounded-xl px-4 py-4 space-y-1" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
              <p className="text-sm font-semibold" style={{ color: C.green }}>Passwort geändert!</p>
              <p className="text-xs" style={{ color: C.green }}>Sie werden weitergeleitet…</p>
            </div>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <AIOrb size={32} active />
            <p className="text-sm" style={{ color: C.sub }}>Token wird verarbeitet…</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>Neues Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>Passwort bestätigen</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
              >
                {loading ? "..." : "Passwort speichern"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
