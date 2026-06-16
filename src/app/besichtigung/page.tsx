"use client";

import { useRef, useState } from "react";

const C = { bg: "#08090E", card: "#0D0F16", border: "#1d2230", ink: "#ECF1FF", sub: "#8A93A6", accent: "#00D4FF", accent2: "#6B58FF", green: "#10B981", amber: "#F59E0B", red: "#EF4444" };

// Experten-Checkliste: die Fragen, die ein erfahrener Investor BEI der Besichtigung wirklich stellt.
const QUESTIONS: { key: string; text: string }[] = [
  { key: "feuchte", text: "Schau in die Ecken, hinter Möbel und ins Bad. Siehst oder riechst du Feuchtigkeit, Stockflecken oder Schimmel?" },
  { key: "fenster", text: "Wie sind die Fenster? Einfach- oder Doppelverglasung, wie alt, schließen sie dicht, beschlagen sie?" },
  { key: "heizung", text: "Welche Heizung ist verbaut, wie alt ist sie, und wann wurde sie zuletzt gewartet?" },
  { key: "elektrik", text: "Wie wirkt die Elektrik? Moderne Sicherungen mit FI-Schalter, oder alte Leitungen und wenige Steckdosen?" },
  { key: "bad", text: "Wie alt sind Bad und Wasserleitungen? Gibt es Anzeichen, dass bald saniert werden muss?" },
  { key: "substanz", text: "Risse in Wänden oder Decken? Schiefe Böden? Wie ist der allgemeine bauliche Zustand?" },
  { key: "laerm", text: "Hör mal kurz rein: Wie laut ist es? Straßenlärm, Hellhörigkeit, Nachbarn?" },
  { key: "licht", text: "Wie ist die Lichtsituation und die Ausrichtung der Räume? Eher hell oder dunkel?" },
  { key: "gemeinschaft", text: "Bei einer Eigentumswohnung: Wie ist der Zustand von Treppenhaus, Fassade, Dach und Keller? Steht eine große Sanierung an?" },
  { key: "hausgeld", text: "Frag nach: Wie hoch ist das Hausgeld, und wie hoch ist die Instandhaltungs-Rücklage der Gemeinschaft?" },
  { key: "protokolle", text: "Frag nach den letzten Protokollen der Eigentümer-Versammlung. Gibt es beschlossene oder drohende Sonderumlagen?" },
  { key: "miete", text: "Ist die Wohnung vermietet? Wenn ja: Wie hoch ist die Miete, wie ist der Mietvertrag, wie das Verhältnis zum Mieter?" },
  { key: "warum", text: "Frag den Verkäufer direkt: Warum wird verkauft, und wie lange steht das Objekt schon zum Verkauf?" },
  { key: "bauch", text: "Dein erster Eindruck: Würdest du hier selbst wohnen wollen? Was stört dich spontan?" },
];

type Report = {
  recommendation: string;
  summary: string;
  redFlags: { title: string; severity: string; note: string }[];
  positives: string[];
  negotiationLevers: { lever: string; rationale: string }[];
  repairBudget: string;
  askNext: string[];
};

type Stage = "intro" | "ask" | "busy" | "report" | "err";

export default function BesichtigungPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textVal, setTextVal] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [msg, setMsg] = useState("");
  const [prop, setProp] = useState({ city: "", price: "", area: "" });

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const answersRef = useRef<{ q: string; a: string }[]>([]);

  function speak(text: string, onEnd?: () => void) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = 1.02;
      u.onend = () => onEnd?.();
      u.onerror = () => onEnd?.();
      window.speechSynthesis.speak(u);
    } catch {
      onEnd?.();
    }
  }

  async function startViewing() {
    setMsg("");
    answersRef.current = [];
    setIndex(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setTextMode(false);
      setStage("ask");
      askQuestion(0);
    } catch {
      // Kein Mikro → Tippen-Modus
      setTextMode(true);
      setStage("ask");
      askQuestion(0, true);
    }
  }

  function askQuestion(i: number, isText = textMode) {
    setTextVal("");
    setRecording(false);
    speak(QUESTIONS[i].text, () => {
      if (!isText) startRec();
    });
  }

  function startRec() {
    const stream = streamRef.current;
    if (!stream) return;
    try {
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      /* still tap-to-record */
    }
  }

  function stopAndGetBlob(): Promise<Blob | null> {
    const mr = mediaRef.current;
    if (!mr || mr.state === "inactive") return Promise.resolve(null);
    return new Promise((resolve) => {
      mr.onstop = () => resolve(new Blob(chunks.current, { type: "audio/webm" }));
      mr.stop();
    });
  }

  async function finishAnswer() {
    try { window.speechSynthesis.cancel(); } catch {}
    setRecording(false);
    setProcessing(true);
    let text = "";
    const blob = await stopAndGetBlob();
    if (blob && blob.size > 0) {
      try {
        const fd = new FormData();
        fd.append("audio", blob, "a.webm");
        const r = await fetch("/api/transcribe", { method: "POST", body: fd });
        const d = await r.json();
        text = (d.text || "").trim();
      } catch { /* leere Antwort */ }
    }
    setProcessing(false);
    pushAndNext(text);
  }

  function finishText() {
    try { window.speechSynthesis.cancel(); } catch {}
    pushAndNext(textVal.trim());
  }

  function skipQuestion() {
    try { window.speechSynthesis.cancel(); } catch {}
    const mr = mediaRef.current;
    try { if (mr && mr.state !== "inactive") { mr.onstop = null; mr.stop(); } } catch {}
    setRecording(false);
    pushAndNext("");
  }

  function pushAndNext(text: string) {
    answersRef.current = [...answersRef.current, { q: QUESTIONS[index].text, a: text }];
    const next = index + 1;
    if (next < QUESTIONS.length) {
      setIndex(next);
      askQuestion(next);
    } else {
      evaluate();
    }
  }

  async function evaluate() {
    setStage("busy");
    try { window.speechSynthesis.cancel(); } catch {}
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const property = {
        city: prop.city || undefined,
        price: prop.price ? Number(prop.price.replace(/\D/g, "")) : undefined,
        area: prop.area ? Number(prop.area.replace(/\D/g, "")) : undefined,
      };
      const r = await fetch("/api/viewing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersRef.current, property }),
      });
      const d = await r.json();
      if (r.status === 429) { setMsg("Zu viele Anfragen — kurz warten."); setStage("err"); return; }
      if (d.error) { setMsg(d.error); setStage("err"); return; }
      setReport(d as Report);
      setStage("report");
    } catch {
      setMsg("Auswertung fehlgeschlagen. Bitte erneut versuchen.");
      setStage("err");
    }
  }

  function restart() {
    answersRef.current = [];
    setReport(null);
    setIndex(0);
    setStage("intro");
  }

  function recColor(rec: string) {
    if (rec === "WEITERVERFOLGEN") return C.green;
    if (rec === "FINGER WEG") return C.red;
    return C.amber;
  }
  function sevColor(s: string) {
    if (s === "hoch") return C.red;
    if (s === "mittel") return C.amber;
    return C.sub;
  }

  const wrap: React.CSSProperties = { minHeight: "100dvh", background: `radial-gradient(900px 500px at 50% -10%, #16213a 0%, ${C.bg} 60%)`, color: C.ink, fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 64px" };
  const btn: React.CSSProperties = { border: 0, borderRadius: 14, padding: "14px 22px", fontWeight: 700, fontSize: 16, cursor: "pointer", color: "#fff", background: `linear-gradient(90deg,${C.accent2},${C.accent})` };
  const inp: React.CSSProperties = { width: "100%", padding: 12, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.ink, font: "inherit" };

  return (
    <main style={wrap}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", fontWeight: 800, fontSize: 20, letterSpacing: ".02em", marginBottom: 4 }}>
          Immo<span style={{ color: C.accent }}>Scorer</span>
        </div>
        <p style={{ color: C.sub, fontSize: 13, marginTop: 0, textAlign: "center" }}>Besichtigungs-Begleiter</p>

        {/* INTRO */}
        {stage === "intro" && (
          <div style={{ marginTop: 24 }}>
            <h1 style={{ fontSize: 26, lineHeight: 1.25, margin: "0 0 10px", textAlign: "center" }}>
              Ich gehe mit dir durch die Wohnung.
            </h1>
            <p style={{ color: C.sub, fontSize: 14, margin: "0 0 22px", textAlign: "center", lineHeight: 1.55 }}>
              Ich stelle dir nacheinander die Fragen, die wirklich zählen. Du sprichst einfach — am Ende bekommst du
              <b style={{ color: C.ink }}> Red Flags, Sanierungs-Hinweise und konkrete Verhandlungs-Hebel.</b>
            </p>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
              <div style={{ color: C.sub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Objekt (optional)</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input style={inp} placeholder="Stadt" value={prop.city} onChange={(e) => setProp((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} inputMode="numeric" placeholder="Kaufpreis €" value={prop.price} onChange={(e) => setProp((p) => ({ ...p, price: e.target.value }))} />
                <input style={inp} inputMode="numeric" placeholder="m²" value={prop.area} onChange={(e) => setProp((p) => ({ ...p, area: e.target.value }))} />
              </div>
            </div>

            <button style={{ ...btn, width: "100%" }} onClick={startViewing}>🎤 Besichtigung starten</button>
            <p style={{ color: C.sub, fontSize: 12, marginTop: 12, textAlign: "center" }}>
              {QUESTIONS.length} kurze Fragen · ca. 5 Minuten · Kopfhörer empfohlen
            </p>
            {msg && <p style={{ color: C.amber, marginTop: 14, fontSize: 14, textAlign: "center" }}>{msg}</p>}
          </div>
        )}

        {/* ASK */}
        {stage === "ask" && (
          <div style={{ marginTop: 20 }}>
            {/* Fortschritt */}
            <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= index ? C.accent : C.border }} />
              ))}
            </div>
            <div style={{ color: C.sub, fontSize: 12, marginBottom: 8 }}>Frage {index + 1} von {QUESTIONS.length}</div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, minHeight: 120 }}>
              <p style={{ margin: 0, fontSize: 19, lineHeight: 1.45 }}>{QUESTIONS[index].text}</p>
            </div>

            <button onClick={() => speak(QUESTIONS[index].text, () => { if (!textMode && !recording) startRec(); })}
              style={{ background: "none", border: 0, color: C.sub, marginTop: 10, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
              ↻ Frage erneut vorlesen
            </button>

            {!textMode ? (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <div style={{ height: 24, color: recording ? C.accent : C.sub, fontSize: 14, fontWeight: 600 }}>
                  {processing ? "verarbeite …" : recording ? "● ich höre zu …" : "tippe „Aufnehmen“"}
                </div>
                {!recording && !processing && (
                  <button onClick={startRec} style={{ ...btn, marginTop: 12, width: "100%", background: "#14233b", color: C.accent, border: `1px solid ${C.accent}` }}>🎤 Aufnehmen</button>
                )}
                {recording && (
                  <button onClick={finishAnswer} disabled={processing} style={{ ...btn, marginTop: 12, width: "100%" }}>
                    Antwort fertig — weiter ▸
                  </button>
                )}
                <button onClick={skipQuestion} disabled={processing} style={{ background: "none", border: 0, color: C.sub, marginTop: 14, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
                  überspringen
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <textarea value={textVal} onChange={(e) => setTextVal(e.target.value)} rows={3} placeholder="Antwort eintippen …" style={{ ...inp, resize: "none" }} />
                <button onClick={finishText} style={{ ...btn, marginTop: 10, width: "100%" }}>Weiter ▸</button>
                <button onClick={skipQuestion} style={{ background: "none", border: 0, color: C.sub, marginTop: 12, fontSize: 13, textDecoration: "underline", cursor: "pointer", display: "block", marginLeft: "auto", marginRight: "auto" }}>
                  überspringen
                </button>
              </div>
            )}
          </div>
        )}

        {/* BUSY */}
        {stage === "busy" && (
          <div style={{ marginTop: 80, textAlign: "center" }}>
            <div style={{ fontSize: 18, color: C.accent }}>Werte deine Besichtigung aus …</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 8 }}>Red Flags · Sanierung · Verhandlungs-Hebel</div>
          </div>
        )}

        {/* ERR */}
        {stage === "err" && (
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <p style={{ color: C.amber, fontSize: 15 }}>{msg}</p>
            <button style={{ ...btn, marginTop: 16 }} onClick={restart}>Neue Besichtigung</button>
          </div>
        )}

        {/* REPORT */}
        {stage === "report" && report && (
          <div style={{ marginTop: 20 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 22, textAlign: "center" }}>
              <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 999, fontWeight: 800, fontSize: 16, color: "#031", background: recColor(report.recommendation) }}>
                {report.recommendation}
              </div>
              {report.summary && <p style={{ marginTop: 14, marginBottom: 0, lineHeight: 1.55 }}>{report.summary}</p>}
              <button onClick={() => speak(`${report.recommendation}. ${report.summary}`)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.accent, borderRadius: 10, padding: "6px 12px", marginTop: 14, cursor: "pointer", fontSize: 13 }}>🔊 Vorlesen</button>
            </div>

            {report.redFlags?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ color: C.sub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Red Flags</div>
                {report.redFlags.map((f, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${sevColor(f.severity)}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{f.title}</span>
                      <span style={{ color: sevColor(f.severity), fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{f.severity}</span>
                    </div>
                    {f.note && <div style={{ color: C.sub, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{f.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {report.negotiationLevers?.length > 0 && (
              <div style={{ marginTop: 14, background: "linear-gradient(135deg,#101a2e,#0D0F16)", border: `1px solid ${C.accent2}`, borderRadius: 14, padding: 16 }}>
                <div style={{ color: C.accent, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Deine Verhandlungs-Hebel</div>
                {report.negotiationLevers.map((l, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700 }}>▸ {l.lever}</div>
                    {l.rationale && <div style={{ color: C.sub, fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{l.rationale}</div>}
                  </div>
                ))}
              </div>
            )}

            {report.positives?.length > 0 && (
              <div style={{ marginTop: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                <div style={{ color: C.green, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Pluspunkte</div>
                {report.positives.map((p, i) => (
                  <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>✓ {p}</div>
                ))}
              </div>
            )}

            {report.repairBudget && (
              <div style={{ marginTop: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                <span style={{ color: C.sub, fontSize: 13 }}>Grobes Sanierungs-Budget: </span>
                <span style={{ fontWeight: 700 }}>{report.repairBudget}</span>
              </div>
            )}

            {report.askNext?.length > 0 && (
              <div style={{ marginTop: 14, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }}>
                <div style={{ color: C.sub, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Noch klären</div>
                {report.askNext.map((q, i) => (
                  <div key={i} style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.5 }}>• {q}</div>
                ))}
              </div>
            )}

            <a href={`https://www.bauzinsmarkt.de/baufinanzierung-nach-stadt/?utm_source=immoscorer&utm_medium=besichtigung`} style={{ display: "block", textAlign: "center", ...btn, marginTop: 18, textDecoration: "none" }}>
              Finanzierung dazu? → Kostenlos prüfen
            </a>
            <button onClick={restart} style={{ background: "none", border: 0, color: C.sub, marginTop: 16, width: "100%", fontSize: 14, textDecoration: "underline", cursor: "pointer" }}>
              Neue Besichtigung
            </button>
          </div>
        )}

        <p style={{ color: "#4a5266", fontSize: 11, marginTop: 36, textAlign: "center" }}>Orientierung, keine Bau- oder Rechtsberatung. ImmoScorer.</p>
      </div>
    </main>
  );
}
