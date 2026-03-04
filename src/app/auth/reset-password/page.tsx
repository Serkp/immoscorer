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
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    // Listen for PASSWORD_RECOVERY event (Supabase processes hash fragment)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Also check if a session already exists (callback already set cookies)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // Timeout after 5 seconds — if no session arrived, show recovery option
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
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
      // User ausloggen damit er sich mit neuem Passwort anmelden muss
      await supabase.auth.signOut();
      // Nach 3 Sekunden zur Startseite mit Erfolgsmeldung
      setTimeout(() => {
        window.location.href = "/?reset=success";
      }, 3000);
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
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 60px ${C.accentDim}`,
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AIOrb size={40} active />
          <h2 className="text-lg font-bold" style={{ color: C.text }}>
            Neues Passwort festlegen
          </h2>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div
              className="rounded-xl px-4 py-4 space-y-1"
              style={{
                background: C.greenDim,
                border: `1px solid ${C.greenBorder}`,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: C.green }}>
                Passwort erfolgreich geändert!
              </p>
              <p className="text-xs" style={{ color: C.green }}>
                Sie werden zur Anmeldung weitergeleitet…
              </p>
            </div>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 py-6">
            {!timedOut ? (
              <>
                <AIOrb size={32} active />
                <p className="text-sm" style={{ color: C.sub }}>
                  Session wird geladen…
                </p>
              </>
            ) : (
              <div className="space-y-4 text-center w-full">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: C.amberDim,
                    border: `1px solid ${C.amberBorder}`,
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: C.amber }}
                  >
                    Keine aktive Session gefunden.
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.amber }}>
                    Der Link ist möglicherweise abgelaufen. Bitte fordern Sie
                    einen neuen an.
                  </p>
                </div>
                <a
                  href="/auth/error?message=otp_expired"
                  className="block w-full rounded-xl py-3 text-sm font-bold text-center transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                    color: "#fff",
                  }}
                >
                  Neuen Link anfordern
                </a>
                <a
                  href="/"
                  className="block text-xs transition-opacity hover:opacity-80"
                  style={{ color: C.dim }}
                >
                  Zur Anmeldung →
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: C.redDim,
                  color: C.red,
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: C.sub }}
                >
                  Neues Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: C.surface2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                  }}
                />
                {password.length > 0 && password.length < 8 && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: C.amber }}
                  >
                    Noch {8 - password.length} Zeichen nötig
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: C.sub }}
                >
                  Passwort bestätigen
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Passwort wiederholen"
                  autoComplete="new-password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{
                    background: C.surface2,
                    border: `1px solid ${C.border}`,
                    color: C.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                  }}
                />
                {confirm.length > 0 && (
                  <p
                    className="text-[11px] mt-1"
                    style={{
                      color: password === confirm ? C.green : C.red,
                    }}
                  >
                    {password === confirm
                      ? "Passwörter stimmen überein"
                      : "Passwörter stimmen nicht überein"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 8 || password !== confirm}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                  color: "#fff",
                }}
              >
                {loading ? "Wird gespeichert..." : "Passwort speichern"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
