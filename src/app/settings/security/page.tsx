"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { C } from "@/lib/theme";

export default function SecurityPage() {
  const { user } = useAuth();

  // Password
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // 2FA
  const [mfaFactors, setMfaFactors] = useState<Array<{ id: string; factor_type: string; status: string }>>([]);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [mfaQr, setMfaQr] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [mfaActive, setMfaActive] = useState(false);

  // Unenroll
  const [unenrollCode, setUnenrollCode] = useState("");
  const [unenrolling, setUnenrolling] = useState(false);
  const [showUnenroll, setShowUnenroll] = useState(false);

  useEffect(() => {
    loadMfaFactors();
  }, []);

  async function loadMfaFactors() {
    try {
      const { data } = await getSupabase().auth.mfa.listFactors();
      if (data?.totp) {
        setMfaFactors(data.totp);
        setMfaActive(data.totp.some((f) => f.status === "verified"));
      }
    } catch { /* silent */ }
  }

  async function handlePasswordChange() {
    if (newPw.length < 8) { setPwMsg({ text: "Mindestens 8 Zeichen.", ok: false }); return; }
    if (newPw !== confirmPw) { setPwMsg({ text: "Passwörter stimmen nicht überein.", ok: false }); return; }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ password: newPw });
      if (error) { setPwMsg({ text: error.message, ok: false }); }
      else { setPwMsg({ text: "Passwort erfolgreich geändert.", ok: true }); setNewPw(""); setConfirmPw(""); }
    } catch { setPwMsg({ text: "Ein Fehler ist aufgetreten.", ok: false }); }
    setPwLoading(false);
  }

  async function handleEmailChange() {
    if (!newEmail || !newEmail.includes("@")) { setEmailMsg({ text: "Bitte gültige E-Mail eingeben.", ok: false }); return; }
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      const { error } = await getSupabase().auth.updateUser({ email: newEmail });
      if (error) { setEmailMsg({ text: error.message, ok: false }); }
      else { setEmailMsg({ text: "Bestätigungs-E-Mail gesendet an die neue Adresse.", ok: true }); setNewEmail(""); }
    } catch { setEmailMsg({ text: "Ein Fehler ist aufgetreten.", ok: false }); }
    setEmailLoading(false);
  }

  async function handleMfaEnroll() {
    setMfaEnrolling(true);
    setMfaMsg(null);
    try {
      const { data, error } = await getSupabase().auth.mfa.enroll({ factorType: "totp" });
      if (error) { setMfaMsg({ text: error.message, ok: false }); setMfaEnrolling(false); return; }
      if (data) {
        setMfaQr(data.totp.qr_code);
        setMfaSecret(data.totp.secret);
        setMfaFactorId(data.id);
      }
    } catch { setMfaMsg({ text: "Fehler beim Einrichten von 2FA.", ok: false }); }
    setMfaEnrolling(false);
  }

  async function handleMfaVerify() {
    if (!mfaFactorId || mfaCode.length !== 6) return;
    setMfaVerifying(true);
    setMfaMsg(null);
    try {
      const { data: challenge, error: challengeErr } = await getSupabase().auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeErr) { setMfaMsg({ text: challengeErr.message, ok: false }); setMfaVerifying(false); return; }
      const { error: verifyErr } = await getSupabase().auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      if (verifyErr) { setMfaMsg({ text: verifyErr.message, ok: false }); }
      else {
        setMfaMsg({ text: "2FA erfolgreich aktiviert!", ok: true });
        setMfaQr(null);
        setMfaSecret(null);
        setMfaFactorId(null);
        setMfaCode("");
        setMfaActive(true);
        loadMfaFactors();
      }
    } catch { setMfaMsg({ text: "Verifizierung fehlgeschlagen.", ok: false }); }
    setMfaVerifying(false);
  }

  async function handleMfaUnenroll() {
    const verifiedFactor = mfaFactors.find((f) => f.status === "verified");
    if (!verifiedFactor) return;
    setUnenrolling(true);
    setMfaMsg(null);
    try {
      // Challenge + verify first
      const { data: challenge, error: chErr } = await getSupabase().auth.mfa.challenge({ factorId: verifiedFactor.id });
      if (chErr) { setMfaMsg({ text: chErr.message, ok: false }); setUnenrolling(false); return; }
      const { error: vErr } = await getSupabase().auth.mfa.verify({ factorId: verifiedFactor.id, challengeId: challenge.id, code: unenrollCode });
      if (vErr) { setMfaMsg({ text: "Ungültiger Code.", ok: false }); setUnenrolling(false); return; }
      const { error } = await getSupabase().auth.mfa.unenroll({ factorId: verifiedFactor.id });
      if (error) { setMfaMsg({ text: error.message, ok: false }); }
      else {
        setMfaMsg({ text: "2FA deaktiviert.", ok: true });
        setMfaActive(false);
        setShowUnenroll(false);
        setUnenrollCode("");
        loadMfaFactors();
      }
    } catch { setMfaMsg({ text: "Fehler beim Deaktivieren.", ok: false }); }
    setUnenrolling(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold" style={{ color: C.text }}>Sicherheit</h2>
        <p className="text-xs mt-1" style={{ color: C.dim }}>Passwort, E-Mail und Zwei-Faktor-Authentifizierung verwalten.</p>
      </div>

      {/* Password Change */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold" style={{ color: C.text }}>Passwort ändern</h3>
        {pwMsg && (
          <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: pwMsg.ok ? C.greenDim : C.redDim, color: pwMsg.ok ? C.green : C.red, border: `1px solid ${pwMsg.ok ? C.greenBorder : "rgba(248,113,113,0.2)"}` }}>
            {pwMsg.text}
          </div>
        )}
        <div className="space-y-3">
          <SecInput label="Neues Passwort" value={newPw} onChange={setNewPw} placeholder="Mindestens 8 Zeichen" />
          <SecInput label="Passwort bestätigen" value={confirmPw} onChange={setConfirmPw} placeholder="Passwort wiederholen" />
        </div>
        <button onClick={handlePasswordChange} disabled={pwLoading || !newPw || !confirmPw}
          className="rounded-xl px-5 py-2 text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
          {pwLoading ? "..." : "Passwort ändern"}
        </button>
      </Card>

      {/* Email Change */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold" style={{ color: C.text }}>E-Mail ändern</h3>
        <p className="text-[11px]" style={{ color: C.dim }}>Aktuelle E-Mail: {user?.email}</p>
        {emailMsg && (
          <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: emailMsg.ok ? C.greenDim : C.redDim, color: emailMsg.ok ? C.green : C.red, border: `1px solid ${emailMsg.ok ? C.greenBorder : "rgba(248,113,113,0.2)"}` }}>
            {emailMsg.text}
          </div>
        )}
        <SecInput label="Neue E-Mail-Adresse" value={newEmail} onChange={setNewEmail} placeholder="neue@email.de" type="email" />
        <p className="text-[10px]" style={{ color: C.dim }}>Sie erhalten eine Bestätigungs-E-Mail an die neue Adresse.</p>
        <button onClick={handleEmailChange} disabled={emailLoading || !newEmail}
          className="rounded-xl px-5 py-2 text-xs font-bold transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
          {emailLoading ? "..." : "E-Mail ändern"}
        </button>
      </Card>

      {/* 2FA */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold" style={{ color: C.text }}>Zwei-Faktor-Authentifizierung (2FA)</h3>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
            style={{ background: mfaActive ? C.greenDim : C.redDim, color: mfaActive ? C.green : C.red, border: `1px solid ${mfaActive ? C.greenBorder : "rgba(248,113,113,0.2)"}` }}>
            {mfaActive ? "Aktiviert" : "Nicht aktiviert"}
          </span>
        </div>

        {mfaMsg && (
          <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: mfaMsg.ok ? C.greenDim : C.redDim, color: mfaMsg.ok ? C.green : C.red, border: `1px solid ${mfaMsg.ok ? C.greenBorder : "rgba(248,113,113,0.2)"}` }}>
            {mfaMsg.text}
          </div>
        )}

        {!mfaActive && !mfaQr && (
          <button onClick={handleMfaEnroll} disabled={mfaEnrolling}
            className="rounded-xl px-5 py-2 text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
            {mfaEnrolling ? "Wird eingerichtet..." : "2FA aktivieren"}
          </button>
        )}

        {/* QR Code display */}
        {mfaQr && (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: C.sub }}>Scannen Sie den QR-Code mit einer Authenticator-App (Google Authenticator, Authy, 1Password).</p>
            <div className="flex justify-center p-4 rounded-xl" style={{ background: "#fff" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mfaQr} alt="2FA QR Code" className="w-48 h-48" />
            </div>
            {mfaSecret && (
              <div className="space-y-1">
                <p className="text-[11px] font-medium" style={{ color: C.dim }}>Oder Secret Key manuell eingeben:</p>
                <code className="block rounded-lg px-3 py-2 text-xs font-mono break-all" style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>
                  {mfaSecret}
                </code>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: C.sub }}>Code aus Ihrer App eingeben</label>
              <input type="text" value={mfaCode} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setMfaCode(v); }}
                placeholder="000000" maxLength={6} autoFocus
                className="w-full rounded-xl px-4 py-3 text-lg font-mono text-center tracking-[0.5em] outline-none"
                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
            </div>
            <button onClick={handleMfaVerify} disabled={mfaVerifying || mfaCode.length !== 6}
              className="w-full rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
              {mfaVerifying ? "Wird verifiziert..." : "Verifizieren & aktivieren"}
            </button>
          </div>
        )}

        {/* Unenroll */}
        {mfaActive && !showUnenroll && (
          <button onClick={() => setShowUnenroll(true)}
            className="rounded-xl px-5 py-2 text-xs font-semibold transition-all"
            style={{ border: `1px solid ${C.border}`, color: C.sub }}>
            2FA deaktivieren
          </button>
        )}

        {showUnenroll && (
          <div className="space-y-3 rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <p className="text-xs" style={{ color: C.sub }}>Geben Sie den Code aus Ihrer Authenticator-App ein, um 2FA zu deaktivieren.</p>
            <input type="text" value={unenrollCode} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 6); setUnenrollCode(v); }}
              placeholder="000000" maxLength={6}
              className="w-full rounded-xl px-4 py-2.5 text-center font-mono tracking-[0.5em] text-sm outline-none"
              style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
            <div className="flex gap-2">
              <button onClick={() => { setShowUnenroll(false); setUnenrollCode(""); }}
                className="flex-1 rounded-xl py-2 text-xs font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
                Abbrechen
              </button>
              <button onClick={handleMfaUnenroll} disabled={unenrolling || unenrollCode.length !== 6}
                className="flex-1 rounded-xl py-2 text-xs font-bold disabled:opacity-40"
                style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                {unenrolling ? "..." : "Deaktivieren"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SecInput({ label, value, onChange, placeholder, type = "password" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: C.sub }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-sm transition-all"
        style={{ borderColor: C.border, color: C.text }} />
    </div>
  );
}
