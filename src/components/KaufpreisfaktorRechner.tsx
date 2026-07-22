"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { C } from "@/lib/theme";

/* ──────────────────────────────────────────────────────────────
   Interaktiver Kaufpreisfaktor-Rechner (Client-Island).
   Kernformel: Kaufpreisfaktor = Kaufpreis ÷ Jahresnettokaltmiete.
   Zeigt zusätzlich die entsprechende Bruttomietrendite (= 100 ÷ Faktor)
   und — als eigenständiger Nutzen gegenüber dem Renditerechner — den
   fairen Kaufpreis bei einem selbst gewählten Zielfaktor.
   Rein im Browser, keine Daten verlassen das Gerät. Alle Formeln sind
   transparent im Seitentext erklärt (siehe /kaufpreisfaktor-rechner).
   ────────────────────────────────────────────────────────────── */

const de = (n: number, d = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

/** Qualitative Einordnung des Faktors — Kehrwert-Logik zur Rendite,
    konsistent mit /rendite-rechner. Keine erfundenen Marktzahlen, nur
    die üblichen qualitativen Bandbreiten. */
function factorVerdict(factor: number): { text: string; color: string } {
  if (!isFinite(factor) || factor <= 0) return { text: "—", color: C.dim };
  if (factor < 20) return { text: "günstig — hoher laufender Ertrag, Lage & Substanz prüfen", color: C.green };
  if (factor < 25) return { text: "solide — ausgewogenes Verhältnis aus Ertrag und Sicherheit", color: C.blue };
  if (factor < 30) return { text: "ambitioniert — typisch für gefragte Großstadtlagen", color: C.amber };
  if (factor < 35) return { text: "teuer — nur mit Wertsteigerung und Top-Lage zu rechtfertigen", color: C.orange };
  return { text: "sehr teuer — Ertrag gering, Annahmen besonders kritisch prüfen", color: C.red };
}

interface FieldProps {
  label: string;
  suffix?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  hint?: string;
}

function Field({ label, suffix, value, onChange, step = 1, hint }: FieldProps) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12.5, color: C.sub, marginBottom: 5, fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ position: "relative", display: "block" }}>
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={0}
          onChange={(e) => onChange(parseFloat(e.target.value.replace(",", ".")) || 0)}
          style={{
            width: "100%",
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: suffix ? "10px 42px 10px 12px" : "10px 12px",
            color: C.text,
            fontSize: 15,
            fontWeight: 600,
            outline: "none",
            appearance: "textfield",
          }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.dim, pointerEvents: "none" }}>
            {suffix}
          </span>
        )}
      </span>
      {hint && <span style={{ display: "block", fontSize: 11, color: C.dim, marginTop: 4, lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}

export function KaufpreisfaktorRechner() {
  const [preis, setPreis] = useState(300000);
  const [miete, setMiete] = useState(1000); // Nettokaltmiete / Monat
  const [zielFaktor, setZielFaktor] = useState(22); // gewünschter Faktor für fairen Preis

  const r = useMemo(() => {
    const jahresmiete = miete * 12;
    const faktor = jahresmiete > 0 ? preis / jahresmiete : 0;
    const bruttoRendite = faktor > 0 ? 100 / faktor : 0;
    const fairerPreis = zielFaktor > 0 ? zielFaktor * jahresmiete : 0;
    const differenz = fairerPreis - preis; // >0: Spielraum nach oben, <0: über Zielfaktor
    return { jahresmiete, faktor, bruttoRendite, fairerPreis, differenz };
  }, [preis, miete, zielFaktor]);

  const v = factorVerdict(r.faktor);
  const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" };
  const big: React.CSSProperties = { fontSize: 24, fontWeight: 800, lineHeight: 1.1 };
  const lbl: React.CSSProperties = { fontSize: 12, color: C.sub, marginTop: 3 };

  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "1fr", alignItems: "start" }} className="kf-grid">
        {/* Eingaben */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Deine Zahlen</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Kaufpreis" suffix="€" value={preis} step={1000} onChange={setPreis} />
            <Field label="Nettokaltmiete pro Monat" suffix="€" value={miete} step={10} onChange={setMiete} hint="Kaltmiete ohne Betriebs- und Heizkosten" />
            <div style={{ height: 1, background: C.border, margin: "2px 0" }} />
            <div style={{ fontSize: 12.5, color: C.dim, fontWeight: 600 }}>Optional — was darf die Immobilie kosten?</div>
            <Field label="Dein Zielfaktor" suffix="×" value={zielFaktor} step={0.5} onChange={setZielFaktor} hint="Der Faktor, den du höchstens zahlen willst" />
          </div>
        </div>

        {/* Ergebnisse */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Dein Ergebnis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...card, gridColumn: "1 / -1", borderColor: v.color + "66", background: `linear-gradient(135deg, ${C.surface}, ${C.surface3})` }}>
              <div style={{ ...big, color: v.color }}>{de(r.faktor, 1)}</div>
              <div style={lbl}>Kaufpreisfaktor (Vervielfältiger)</div>
              <div style={{ fontSize: 12, color: v.color, marginTop: 6, fontWeight: 600 }}>{v.text}</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20, color: C.accent }}>{de(r.bruttoRendite, 2)} %</div>
              <div style={lbl}>entspr. Bruttomietrendite</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20 }}>{de(r.jahresmiete)} €</div>
              <div style={lbl}>Jahresnettokaltmiete</div>
            </div>
            <div style={{ ...card, gridColumn: "1 / -1", background: C.bg2 }}>
              <div style={{ ...big, fontSize: 20, color: C.text }}>{de(r.fairerPreis)} €</div>
              <div style={lbl}>Fairer Kaufpreis bei Faktor {de(zielFaktor, 1)}×</div>
              <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600, color: r.differenz >= 0 ? C.green : C.red }}>
                {r.differenz >= 0
                  ? `${de(r.differenz)} € Spielraum bis zu deinem Zielfaktor`
                  : `${de(-r.differenz)} € über deinem Zielfaktor`}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.5, margin: "10px 2px 0" }}>
            Der Kaufpreisfaktor betrachtet nur Kaufpreis und Miete. Kaufnebenkosten, Hausgeld, Sanierungen und
            Finanzierung bleiben außen vor — für die echte Nettorendite dein Objekt im{" "}
            <Link href="/rendite-rechner" style={{ color: C.accent, textDecoration: "none" }}>Renditerechner</Link> durchrechnen.
          </p>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "10px 16px", borderRadius: 10, textDecoration: "none" }}>
              Vollständige KI-Bewertung →
            </Link>
            <Link href="/kapitalanlage" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 13.5, padding: "10px 16px", borderRadius: 10, textDecoration: "none" }}>
              Faktor nach Stadt
            </Link>
          </div>
        </div>
      </div>

      <style>{`@media (min-width: 760px){ .kf-grid{ grid-template-columns: 1fr 1fr !important; gap: 26px !important; } }`}</style>
    </div>
  );
}
