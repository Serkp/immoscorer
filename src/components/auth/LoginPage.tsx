"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          options: { data: { full_name: name } },
        });
        if (err) throw err;
        if (data.user) {
          await supabase
            .from("profiles")
            .update({ newsletter_opt_in: newsletter })
            .eq("id", data.user.id);
        }
      } else {
        const { error: err } = await getSupabase().auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.bg }}
    >
      <div className="w-full max-w-[400px] space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <AIOrb size={56} active />
          <h1 className="text-xl font-bold tracking-tight" style={{ color: C.text }}>
            ImmoScorer
          </h1>
        </div>

        {/* Tab Toggle */}
        <div
          className="flex rounded-xl p-1"
          style={{ background: C.surface }}
        >
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
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

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: C.redDim,
              color: C.red,
              border: `1px solid rgba(248,113,113,0.2)`,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: C.sub }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: C.surface2,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  // @ts-expect-error CSS custom property
                  "--tw-ring-color": C.accent,
                }}
              />
            </div>
          )}

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
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{
                background: C.surface2,
                border: `1px solid ${C.border}`,
                color: C.text,
                // @ts-expect-error CSS custom property
                "--tw-ring-color": C.accent,
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: C.sub }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mindestens 6 Zeichen"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{
                background: C.surface2,
                border: `1px solid ${C.border}`,
                color: C.text,
                // @ts-expect-error CSS custom property
                "--tw-ring-color": C.accent,
              }}
            />
          </div>

          {mode === "login" && (
            <div className="flex justify-end">
              <a
                href="/reset-password"
                className="text-[11px] transition-opacity hover:opacity-80"
                style={{ color: C.dim }}
              >
                Passwort vergessen?
              </a>
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
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            {loading
              ? "..."
              : mode === "login"
                ? "Anmelden"
                : "Konto erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}
