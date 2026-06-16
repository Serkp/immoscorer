"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (t: string) => void; "error-callback"?: () => void; theme?: string },
      ) => void;
    };
  }
}

// Bot-Schutz nur aktiv, wenn dieser Public-Key gesetzt ist (sonst kein Widget, kein Token).
const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";

type Result = {
  score: number; decision: string; color: string; keyPoint: string; verdict: string;
  negotiationScript: string; kpis: { netYield: number; grossYield: number; factor: number; sqmPrice: number; cashflow: number };
  city: string; price: number; transcript: string;
};

const C = { bg: "#08090E", card: "#0D0F16", border: "#1d2230", ink: "#ECF1FF", sub: "#8A93A6", accent: "#00D4FF", accent2: "#6B58FF" };

export default function CheckPage() {
  const [state, setState] = useState<"idle" | "rec" | "busy" | "done" | "more" | "err">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [msg, setMsg] = useState("");
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState(""); // bisher Gesagtes — wird bei Rückfragen mitgeschickt
  const [tsToken, setTsToken] = useState("");
  const [copied, setCopied] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const tsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITEKEY) return;
    const ID = "cf-turnstile-script";
    const render = () => {
      if (window.turnstile && tsRef.current && !tsRef.current.hasChildNodes()) {
        window.turnstile.render(tsRef.current, {
          sitekey: SITEKEY,
          callback: setTsToken,
          "error-callback": () => setTsToken(""),
          theme: "dark",
        });
      }
    };
    if (document.getElementById(ID)) { render(); return; }
    const s = document.createElement("script");
    s.id = ID;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true; s.defer = true; s.onload = render;
    document.head.appendChild(s);
  }, []);

  async function startRec() {
    setMsg(""); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); send(new Blob(chunks.current, { type: "audio/webm" })); };
      mediaRef.current = mr; mr.start(); setState("rec");
    } catch {
      setShowText(true); setMsg("Kein Mikrofon-Zugriff — tippe es einfach ein.");
    }
  }
  function stopRec() { mediaRef.current?.stop(); setState("busy"); }

  async function send(blob: Blob | null, txt?: string) {
    setState("busy");
    const fd = new FormData();
    if (blob) fd.append("audio", blob, "rec.webm");
    if (txt) fd.append("text", txt);
    if (ctx) fd.append("context", ctx);
    if (tsToken) fd.append("turnstile", tsToken);
    try {
      const r = await fetch("/api/voice-check", { method: "POST", body: fd });
      const d = await r.json();
      if (r.status === 429) { setMsg("Zu viele Anfragen — kurz warten."); setState("err"); return; }
      if (d.needMore) { setCtx(d.transcript || ctx); setText(""); setMsg("Sag mir noch: " + (d.missing || []).join(", ")); setState("more"); return; }
      if (d.error) { setMsg(d.error); setState("err"); return; }
      setCtx(""); setResult(d); setState("done");
    } catch { setMsg("Verbindungsfehler."); setState("err"); }
  }

  function speak(t: string) {
    try { const u = new SpeechSynthesisUtterance(t); u.lang = "de-DE"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {}
  }

  const wrap: React.CSSProperties = { minHeight: "100dvh", background: `radial-gradient(900px 500px at 50% -10%, #16213a 0%, ${C.bg} 60%)`, color: C.ink, fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px" };
  const btn: React.CSSProperties = { border: 0, borderRadius: 14, padding: "14px 22px", fontWeight: 700, fontSize: 16, cursor: "pointer", color: "#fff", background: `linear-gradient(90deg,${C.accent2},${C.accent})` };

  return (
    <main style={wrap}>
      <div style={{ width: "100%", maxWidth: 460, textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: ".02em", marginBottom: 4 }}>
          Immo<span style={{ color: C.accent }}>Scorer</span>
        </div>
        <p style={{ color: C.sub, fontSize: 14, marginTop: 0 }}>Die kühle Zweitmeinung — bevor du zu viel zahlst.</p>

        {(state === "idle" || state === "rec" || state === "more" || state === "err") && (
          <div style={{ marginTop: 32 }}>
            <h1 style={{ fontSize: 26, lineHeight: 1.25, margin: "0 0 8px" }}>
              {state === "rec" ? "Ich höre zu …" : state === "more" ? "Fast geschafft …" : "Sag mir die Immobilie."}
            </h1>
            {state !== "more" && (
              <p style={{ color: C.sub, fontSize: 14, margin: "0 0 28px" }}>
                Kaufpreis, Kaltmiete, Größe, Stadt — einfach frei sprechen.
              </p>
            )}
            <button
              onClick={state === "rec" ? stopRec : startRec}
              aria-label="Aufnehmen"
              style={{ width: 116, height: 116, borderRadius: "50%", border: state === "rec" ? `3px solid ${C.accent}` : "0",
                background: state === "rec" ? "#14233b" : `linear-gradient(135deg,${C.accent2},${C.accent})`,
                color: "#fff", fontSize: 42, cursor: "pointer", boxShadow: state === "rec" ? `0 0 0 8px rgba(0,212,255,.12)` : `0 8px 40px rgba(107,88,255,.4)`, transition: "all .15s" }}>
              {state === "rec" ? "■" : "🎤"}
            </button>
            <div style={{ marginTop: 16, color: C.sub, fontSize: 13 }}>
              {state === "rec" ? "Tippen zum Stoppen" : "Tippen & sprechen"}
            </div>
            {msg && <p style={{ color: "#F59E0B", marginTop: 18, fontSize: 14 }}>{msg}</p>}
            <button onClick={() => setShowText((s) => !s)} style={{ background: "none", border: 0, color: C.sub, marginTop: 18, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
              lieber tippen
            </button>
            {showText && (
              <div style={{ marginTop: 12 }}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="z. B. Eigentumswohnung Köln, 320.000 €, 75 m², 980 € Kaltmiete, Baujahr 1992"
                  style={{ width: "100%", padding: 12, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.ink, font: "inherit" }} />
                <button style={{ ...btn, marginTop: 10, width: "100%" }} disabled={!text.trim()} onClick={() => send(null, text)}>Bewerten</button>
              </div>
            )}
          </div>
        )}

        {state === "busy" && (
          <div style={{ marginTop: 80 }}>
            <div style={{ fontSize: 18, color: C.accent }}>Analysiere …</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 8 }}>Transkription · Kennzahlen · Urteil</div>
          </div>
        )}

        {state === "done" && result && (
          <div style={{ marginTop: 24, textAlign: "left" }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, textAlign: "center" }}>
              <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1 }}>{result.score.toLocaleString("de-DE")}<span style={{ fontSize: 22, color: C.sub }}>/10</span></div>
              <div style={{ display: "inline-block", marginTop: 10, padding: "6px 16px", borderRadius: 999, fontWeight: 800, fontSize: 15, color: "#031", background: result.color }}>{result.decision}</div>
              {result.keyPoint && <div style={{ marginTop: 12, color: C.ink, fontWeight: 600 }}>{result.keyPoint}</div>}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[["Nettorendite", result.kpis.netYield.toLocaleString("de-DE") + " %"], ["Faktor", result.kpis.factor.toLocaleString("de-DE")], ["€/m²", Math.round(result.kpis.sqmPrice).toLocaleString("de-DE")]].map(([k, v]) => (
                <div key={k} style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontWeight: 700 }}>{v}</div><div style={{ color: C.sub, fontSize: 11 }}>{k}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
              <p style={{ margin: 0, lineHeight: 1.55 }}>{result.verdict}</p>
              <button onClick={() => speak(result.verdict + ". " + result.negotiationScript)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.accent, borderRadius: 10, padding: "6px 12px", marginTop: 12, cursor: "pointer", fontSize: 13 }}>🔊 Vorlesen</button>
            </div>

            {result.negotiationScript && (
              <div style={{ background: "linear-gradient(135deg,#101a2e,#0D0F16)", border: `1px solid ${C.accent2}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
                <div style={{ color: C.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Dein Verhandlungs-Satz</div>
                <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{`„${result.negotiationScript}“`}</p>
              </div>
            )}

            <a href="https://www.bauzinsmarkt.de/baufinanzierung-nach-stadt/?utm_source=immoscorer&utm_medium=voicecheck" style={{ display: "block", textAlign: "center", ...btn, marginTop: 16, textDecoration: "none" }}>
              Finanzierung dazu? → Kostenlos prüfen
            </a>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => { try { navigator.clipboard.writeText(`ImmoScorer · ${result.city}\nScore ${result.score}/10 — ${result.decision}\n${result.verdict}\nVerhandlung: ${result.negotiationScript}\nhttps://www.immoscorer.de/check`); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {} }}
                style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.ink, borderRadius: 12, padding: "11px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {copied ? "Kopiert ✓" : "📋 Ergebnis kopieren"}
              </button>
              <a href="/besichtigung" style={{ flex: 1, textAlign: "center", background: C.card, border: `1px solid ${C.border}`, color: C.accent, borderRadius: 12, padding: "11px 12px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                🏠 Besichtigung
              </a>
            </div>
            <button onClick={() => { setResult(null); setCtx(""); setText(""); setState("idle"); }} style={{ background: "none", border: 0, color: C.sub, marginTop: 16, width: "100%", fontSize: 14, textDecoration: "underline", cursor: "pointer" }}>
              Nächste Immobilie
            </button>
          </div>
        )}

        {SITEKEY && <div ref={tsRef} style={{ marginTop: 20, display: "flex", justifyContent: "center" }} />}

        <p style={{ color: "#4a5266", fontSize: 11, marginTop: 36 }}>Orientierungswert, keine Anlageberatung. ImmoScorer.</p>
      </div>
    </main>
  );
}
