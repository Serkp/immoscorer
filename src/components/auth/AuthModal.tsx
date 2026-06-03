"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

type Mode = "login" | "register";
type ForgotStep = "form" | "sent";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resetSuccess?: boolean;
}

/* Übersetzt Supabase-Fehlermeldungen (Englisch) in verständliches Deutsch. */
function authErrorToGerman(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-Mail-Adresse oder Passwort ist falsch.";
  if (m.includes("email not confirmed"))
    return "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse über den Link in unserer Bestätigungs-E-Mail.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.";
  if (m.includes("password should be at least"))
    return "Das Passwort ist zu kurz (mindestens 8 Zeichen).";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  if (m.includes("invalid email") || m.includes("unable to validate email"))
    return "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
  return "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";
}

export function AuthModal({ open, onClose, onSuccess, resetSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(resetSuccess ? "login" : "register");
  const [resetBanner, setResetBanner] = useState(!!resetSuccess);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("form");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  // 2FA challenge at login
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaVerifying, setMfaVerifying] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setShowForgot(false);
      setForgotStep("form");
      setForgotError(null);
      if (resetSuccess) {
        setMode("login");
        setResetBanner(true);
      }
    }
  }, [open, resetSuccess]);

  // Auto-dismiss reset success banner after 10 seconds
  useEffect(() => {
    if (!resetBanner) return;
    const t = setTimeout(() => setResetBanner(false), 10000);
    return () => clearTimeout(t);
  }, [resetBanner]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabase();

      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin + "/auth/callback?type=signup",
          },
        });
        if (err) {
          setError(authErrorToGerman(err.message));
          setLoading(false);
          return;
        }

        // If no session, email confirmation might be required
        if (!data.session) {
          setError("Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.");
          setLoading(false);
          return;
        }

        // Create/update profile with name, email, newsletter preference
        if (data.user) {
          await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: name,
              email,
              newsletter_opt_in: newsletter,
            }, { onConflict: "id" });
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) {
          setError(authErrorToGerman(err.message));
          setLoading(false);
          return;
        }
        // Ensure profile exists (FK constraint for saves)
        if (data?.user) {
          await supabase.from("profiles").upsert(
            { id: data.user.id, email: data.user.email, updated_at: new Date().toISOString() },
            { onConflict: "id" }
          );
        }

        // 2FA: if the account has a verified factor, login must be elevated to aal2
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
          setMfaStep(true);
          setMfaCode("");
          setMfaError(null);
          setLoading(false);
          return; // wait for the TOTP code before granting access
        }
      }

      // Auth success — hard redirect to /dashboard so auth cookie is picked up
      setLoading(false);
      onSuccess?.();
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? authErrorToGerman(err.message)
          : "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.";
      setError(msg);
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setForgotError("Bitte geben Sie Ihre E-Mail-Adresse ein."); return; }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const supabase = getSupabase();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth/callback?type=recovery",
      });
      if (err) { setForgotError(authErrorToGerman(err.message)); setForgotLoading(false); return; }
      setForgotStep("sent");
    } catch {
      setForgotError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
    setForgotLoading(false);
  }

  async function handleMfaLogin(e: React.FormEvent) {
    e.preventDefault();
    if (mfaCode.length !== 6) return;
    setMfaVerifying(true);
    setMfaError(null);
    try {
      const supabase = getSupabase();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.find((f) => f.status === "verified");
      if (!factor) { setMfaError("Kein aktiver 2FA-Faktor gefunden."); setMfaVerifying(false); return; }
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (chErr || !challenge) { setMfaError("Verifizierung fehlgeschlagen. Bitte erneut versuchen."); setMfaVerifying(false); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code: mfaCode });
      if (vErr) { setMfaError("Code ungültig oder abgelaufen. Bitte erneut eingeben."); setMfaVerifying(false); return; }
      setMfaVerifying(false);
      onSuccess?.();
      window.location.href = "/dashboard";
    } catch {
      setMfaError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setMfaVerifying(false);
    }
  }

  async function cancelMfa() {
    setMfaStep(false);
    setMfaCode("");
    setMfaError(null);
    try { await getSupabase().auth.signOut(); } catch { /* ignore */ }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-6 space-y-6 animate-fade-up"
        style={{ background: C.bg2, border: `1px solid ${C.border}`, boxShadow: `0 0 60px ${C.accentDim}` }}
      >
        {mfaStep ? (
          /* ── 2FA-Abfrage beim Login ── */
          <form onSubmit={handleMfaLogin} className="space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <AIOrb size={40} active />
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.text }}>Zwei-Faktor-Bestätigung</h2>
                <p className="text-xs mt-1" style={{ color: C.sub }}>Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.</p>
              </div>
            </div>
            {mfaError && (
              <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                {mfaError}
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={mfaCode}
              onChange={(e) => { setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setMfaError(null); }}
              placeholder="000000"
              maxLength={6}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-lg font-mono text-center tracking-[0.5em] outline-none"
              style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
            />
            <button type="submit" disabled={mfaVerifying || mfaCode.length !== 6}
              className="w-full rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
              {mfaVerifying ? "Wird geprüft..." : "Anmelden"}
            </button>
            <button type="button" onClick={cancelMfa} className="w-full text-center text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
              Abbrechen
            </button>
          </form>
        ) : showForgot ? (
          /* ── Passwort vergessen ── */
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <AIOrb size={40} active />
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.text }}>Passwort zurücksetzen</h2>
                <p className="text-xs mt-1" style={{ color: C.sub }}>
                  {forgotStep === "form"
                    ? "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen."
                    : ""}
                </p>
              </div>
            </div>

            {forgotStep === "sent" ? (
              <div className="space-y-4">
                <div className="rounded-xl px-4 py-4 text-center space-y-2" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
                  <p className="text-sm font-semibold" style={{ color: C.green }}>E-Mail gesendet!</p>
                  <p className="text-xs" style={{ color: C.green }}>Prüfen Sie Ihr Postfach und klicken Sie auf den Link zum Zurücksetzen.</p>
                </div>
                <p className="text-[11px] text-center" style={{ color: C.dim }}>
                  Keine E-Mail erhalten? Prüfen Sie den Spam-Ordner.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotStep("form"); setForgotError(null); }}
                  className="w-full rounded-xl py-3 text-sm font-bold transition-all"
                  style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                >
                  Zurück zur Anmeldung
                </button>
              </div>
            ) : (
              <>
                {forgotError && (
                  <div className="rounded-xl px-4 py-3 text-sm" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                    {forgotError}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: C.sub }}>E-Mail-Adresse</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@beispiel.de"
                      autoComplete="email"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                      style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                  >
                    {forgotLoading ? "..." : "Link senden"}
                  </button>
                </form>
                <button
                  onClick={() => { setShowForgot(false); setForgotError(null); }}
                  className="w-full text-center text-xs py-1"
                  style={{ color: C.dim }}
                >
                  ← Zurück zur Anmeldung
                </button>
              </>
            )}
          </>
        ) : (
          /* ── Login / Register ── */
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <AIOrb size={40} active />
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.text }}>
                  {mode === "register"
                    ? "Kostenlos registrieren"
                    : "Willkommen zurück"}
                </h2>
                <p className="text-xs mt-1" style={{ color: C.sub }}>
                  {mode === "register"
                    ? "um Ihre Analyse zu sehen"
                    : "Melden Sie sich an um Ihre Analyse zu sehen."}
                </p>
              </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex rounded-xl p-1" style={{ background: C.surface }}>
              {(["register", "login"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
                  style={{
                    background: mode === m ? C.surface3 : "transparent",
                    color: mode === m ? C.text : C.sub,
                  }}
                >
                  {m === "login" ? "Anmelden" : "Registrieren"}
                </button>
              ))}
            </div>

            {/* Reset success banner */}
            {resetBanner && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
              >
                Passwort wurde geändert. Bitte melden Sie sich mit Ihrem neuen Passwort an.
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: C.sub }}>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Mustermann"
                    autoComplete="name"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                    style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>E-Mail-Adresse</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@beispiel.de"
                  autoComplete="email"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: C.sub }}>Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                />
              </div>

              {/* Passwort vergessen — nur im Login-Modus */}
              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotStep("form");
                      setForgotError(null);
                    }}
                    className="text-[11px] transition-opacity hover:opacity-80"
                    style={{ color: C.dim }}
                  >
                    Passwort vergessen?
                  </button>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(e) => setNewsletter(e.target.checked)}
                      className="mt-0.5 rounded accent-[#7C6AFF]"
                    />
                    <span className="text-xs leading-relaxed" style={{ color: C.sub }}>
                      Markttrends, Investment-Tipps und neue Features per E-Mail erhalten
                    </span>
                  </label>
                  <p className="text-[10px] ml-6" style={{ color: C.dim }}>
                    Maximal 2× pro Monat. Jederzeit abmeldbar.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
              >
                {loading ? "..." : mode === "login" ? "Anmelden & Analyse sehen" : "Registrieren & Analyse sehen"}
              </button>
            </form>

            {/* Close hint */}
            <button
              onClick={onClose}
              className="w-full text-center text-xs py-1"
              style={{ color: C.dim }}
            >
              Abbrechen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
