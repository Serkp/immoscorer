"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AIOrb } from "@/components/ui/AIOrb";
import { getSupabase } from "@/lib/supabase";
import { C } from "@/lib/theme";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "Ungültiger Link. Bitte fordern Sie einen neuen an.",
  otp_expired: "Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.",
  exchange_failed: "Die Verifizierung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
  verification_failed: "Die Token-Verifizierung ist fehlgeschlagen. Bitte fordern Sie einen neuen Link an.",
  server_config_error: "Serverkonfigurationsfehler. Bitte kontaktieren Sie den Support.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const rawMessage = searchParams.get("message") || "";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const displayMessage =
    ERROR_MESSAGES[rawMessage] ||
    (rawMessage
      ? `Ein Fehler ist aufgetreten: ${rawMessage}`
      : "Ein Fehler ist aufgetreten. Der Link ist möglicherweise abgelaufen oder ungültig.");

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) {
        setSendError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setSendError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    }
    setSending(false);
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
            Ein Fehler ist aufgetreten
          </h2>
          <p className="text-sm" style={{ color: C.sub }}>
            {displayMessage}
          </p>
        </div>

        {/* Resend reset link */}
        {sent ? (
          <div
            className="rounded-xl px-4 py-4 text-center space-y-1"
            style={{
              background: C.greenDim,
              border: `1px solid ${C.greenBorder}`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: C.green }}>
              Neuer Link gesendet!
            </p>
            <p className="text-xs" style={{ color: C.green }}>
              Prüfen Sie Ihr E-Mail-Postfach (auch Spam-Ordner).
            </p>
          </div>
        ) : (
          <form onSubmit={handleResend} className="space-y-3">
            <p
              className="text-xs font-medium"
              style={{ color: C.sub }}
            >
              Neuen Link anfordern:
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ihre E-Mail-Adresse"
              required
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
            {sendError && (
              <p className="text-xs" style={{ color: C.red }}>
                {sendError}
              </p>
            )}
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                color: "#fff",
              }}
            >
              {sending ? "Wird gesendet..." : "Neuen Link senden"}
            </button>
          </form>
        )}

        <div className="space-y-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <a
            href="/"
            className="block w-full rounded-xl py-3 text-sm font-semibold text-center transition-all hover:opacity-90"
            style={{
              border: `1px solid ${C.border}`,
              color: C.sub,
            }}
          >
            Zur Anmeldung
          </a>
          <p className="text-[11px] text-center" style={{ color: C.dim }}>
            Falls das Problem weiterhin besteht, kontaktieren Sie unseren
            Support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: C.bg }}
        >
          <AIOrb size={40} active />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
