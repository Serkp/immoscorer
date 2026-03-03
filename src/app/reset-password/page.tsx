"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

type Phase = "loading" | "email" | "new-password" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");

  // Phase 1 state
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Phase 2 state
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // Supabase processes the URL hash automatically on load,
    // then fires onAuthStateChange with PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setPhase("new-password");
      } else if (event === "SIGNED_IN" && session) {
        // Signed in via token but no PASSWORD_RECOVERY event —
        // check if we came from a recovery link
        const hash = window.location.hash;
        if (hash.includes("type=recovery")) {
          setPhase("new-password");
        }
      }
    });

    // Initial check: did the user arrive via a reset link (hash fragment)?
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=recovery")) {
      // Token present — wait for onAuthStateChange to fire
      // Timeout as fallback in case the event doesn't fire
      setTimeout(() => {
        setPhase((prev) => (prev === "loading" ? "new-password" : prev));
      }, 1500);
    } else {
      // No token — show the email request form
      setPhase("email");
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* ── Phase 1: Request reset link ── */
  async function handleRequestLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setSendError(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setSendError(error.message);
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setSendError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    }
    setSending(false);
  }

  /* ── Phase 2: Set new password ── */
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    if (password.length < 8) {
      setSaveError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setSaveError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setSaveError(error.message);
        setSaving(false);
        return;
      }
      setPhase("success");
      setTimeout(() => {
        router.push("/analysis");
      }, 2000);
    } catch {
      setSaveError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.bg }}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl p-6 space-y-6"
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 60px ${C.accentDim}`,
        }}
      >
        {/* Loading state */}
        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <AIOrb size={40} active />
            <p className="text-sm" style={{ color: C.sub }}>Wird geladen...</p>
          </div>
        )}

        {/* Header */}
        {phase !== "loading" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <AIOrb size={40} active />
          <div>
            <h2 className="text-lg font-bold" style={{ color: C.text }}>
              {phase === "success"
                ? "Passwort gespeichert"
                : phase === "new-password"
                  ? "Neues Passwort festlegen"
                  : "Passwort zurücksetzen"}
            </h2>
            {phase === "email" && !sent && (
              <p className="text-xs mt-1" style={{ color: C.sub }}>
                Wir senden dir einen Link zum Zurücksetzen.
              </p>
            )}
          </div>
        </div>
        )}

        {/* ═══ SUCCESS ═══ */}
        {phase === "success" && (
          <div className="space-y-4">
            <div
              className="rounded-xl px-4 py-4 text-center space-y-1"
              style={{
                background: C.greenDim,
                border: `1px solid ${C.greenBorder}`,
              }}
            >
              <p className="text-sm font-semibold" style={{ color: C.green }}>
                Passwort gespeichert!
              </p>
              <p className="text-xs" style={{ color: C.green }}>
                Sie werden weitergeleitet…
              </p>
            </div>
          </div>
        )}

        {/* ═══ PHASE 1: E-Mail eingeben ═══ */}
        {phase === "email" && (
          <>
            {sent ? (
              <div className="space-y-4">
                <div
                  className="rounded-xl px-4 py-4 text-center space-y-2"
                  style={{
                    background: C.greenDim,
                    border: `1px solid ${C.greenBorder}`,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: C.green }}>
                    E-Mail wurde versendet!
                  </p>
                  <p className="text-xs" style={{ color: C.green }}>
                    Prüfe dein Postfach und klicke auf den Link zum Zurücksetzen.
                  </p>
                </div>
                <p className="text-[11px] text-center" style={{ color: C.dim }}>
                  Keine E-Mail erhalten? Prüfe den Spam-Ordner oder{" "}
                  <button
                    onClick={() => { setSent(false); setSendError(null); }}
                    className="underline"
                    style={{ color: C.accent }}
                  >
                    versuche es erneut
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                {sendError && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: C.redDim,
                      color: C.red,
                      border: "1px solid rgba(248,113,113,0.2)",
                    }}
                  >
                    {sendError}
                  </div>
                )}
                <form onSubmit={handleRequestLink} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: C.sub }}>
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@beispiel.de"
                      autoComplete="email"
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
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !email.trim()}
                    className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                      color: "#fff",
                    }}
                  >
                    {sending ? "Wird gesendet..." : "Link anfordern"}
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {/* ═══ PHASE 2: Neues Passwort setzen ═══ */}
        {phase === "new-password" && (
          <>
            {saveError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: C.redDim,
                  color: C.red,
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                {saveError}
              </div>
            )}
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>
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
                  <p className="text-[11px] mt-1" style={{ color: C.amber }}>
                    Noch {8 - password.length} Zeichen nötig
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>
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
                    style={{ color: password === confirm ? C.green : C.red }}
                  >
                    {password === confirm
                      ? "Passwörter stimmen überein"
                      : "Passwörter stimmen nicht überein"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving || password.length < 8 || password !== confirm}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                  color: "#fff",
                }}
              >
                {saving ? "Wird gespeichert..." : "Passwort speichern"}
              </button>
            </form>
          </>
        )}

        {/* Back to login link */}
        {phase !== "success" && phase !== "loading" && (
          <div className="pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <a
              href="/"
              className="block w-full text-center text-xs py-1 transition-opacity hover:opacity-80"
              style={{ color: C.dim }}
            >
              ← Zur Anmeldung
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
