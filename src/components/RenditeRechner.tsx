"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { C } from "@/lib/theme";

/* ──────────────────────────────────────────────────────────────
   Interaktiver Immobilien-Renditerechner (Client-Island).
   Rechnet live: Brutto-/Nettomietrendite, Kaufpreisfaktor,
   Eigenkapitalrendite und monatlichen Cashflow — rein im Browser,
   keine Daten verlassen das Gerät. Alle Formeln sind transparent
   im umgebenden Seitentext erklärt (siehe /rendite-rechner).
   ────────────────────────────────────────────────────────────── */

const de = (n: number, d = 0) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });

function verdict(grossYield: number): { text: string; color: string } {
  if (!isFinite(grossYield) || grossYield <= 0) return { text: "—", color: C.dim };
  if (grossYield < 3) return { text: "niedrig — Fokus Lage & Wertstabilität", color: C.orange };
  if (grossYield < 4) return { text: "moderat — typisch für gefragte Lagen", color: C.amber };
  if (grossYield < 5.5) return { text: "solide — ausgewogenes Verhältnis", color: C.blue };
  return { text: "hoch — Substanz & Vermietbarkeit genau prüfen", color: C.green };
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

export function RenditeRechner() {
  const [preis, setPreis] = useState(250000);
  const [miete, setMiete] = useState(750); // Kaltmiete / Monat
  const [nkPct, setNkPct] = useState(10); // Kaufnebenkosten in %
  const [kostenJahr, setKostenJahr] = useState(1800); // nicht umlagefähige Kosten / Jahr
  const [eigenkapital, setEigenkapital] = useState(60000);
  const [zins, setZins] = useState(3.8); // Sollzins % p.a.
  const [tilgung, setTilgung] = useState(2.0); // Tilgung % p.a.

  const r = useMemo(() => {
    const jahresmiete = miete * 12;
    const kaufnebenkosten = preis * (nkPct / 100);
    const gesamtinvest = preis + kaufnebenkosten;

    const brutto = preis > 0 ? (jahresmiete / preis) * 100 : 0;
    const faktor = jahresmiete > 0 ? preis / jahresmiete : 0;
    const noi = jahresmiete - kostenJahr; // Netto-Mietertrag vor Finanzierung
    const netto = gesamtinvest > 0 ? (noi / gesamtinvest) * 100 : 0;

    const darlehen = Math.max(0, gesamtinvest - eigenkapital);
    const zinsKosten = darlehen * (zins / 100);
    const tilgungBetrag = darlehen * (tilgung / 100);
    const annuitaet = zinsKosten + tilgungBetrag;

    const cashflowJahr = noi - annuitaet; // vor Steuer, nach Tilgung
    const cashflowMonat = cashflowJahr / 12;
    const ekRendite = eigenkapital > 0 ? ((noi - zinsKosten) / eigenkapital) * 100 : 0;

    return { jahresmiete, kaufnebenkosten, gesamtinvest, brutto, faktor, noi, netto, darlehen, zinsKosten, annuitaet, cashflowMonat, cashflowJahr, ekRendite };
  }, [preis, miete, nkPct, kostenJahr, eigenkapital, zins, tilgung]);

  const v = verdict(r.brutto);
  const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" };
  const big: React.CSSProperties = { fontSize: 24, fontWeight: 800, lineHeight: 1.1 };
  const lbl: React.CSSProperties = { fontSize: 12, color: C.sub, marginTop: 3 };

  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "1fr", alignItems: "start" }} className="rr-grid">
        {/* Eingaben */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Deine Zahlen</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Kaufpreis" suffix="€" value={preis} step={1000} onChange={setPreis} />
            <Field label="Kaltmiete pro Monat" suffix="€" value={miete} step={10} onChange={setMiete} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Kaufnebenkosten" suffix="%" value={nkPct} step={0.5} onChange={setNkPct} hint="Grunderwerbsteuer, Notar, Grundbuch (~9–12 %)" />
              <Field label="Bewirtschaftung / Jahr" suffix="€" value={kostenJahr} step={100} onChange={setKostenJahr} hint="nicht umlagefähig: Verwaltung, Rücklage, Mietausfall" />
            </div>
            <div style={{ height: 1, background: C.border, margin: "2px 0" }} />
            <div style={{ fontSize: 12.5, color: C.dim, fontWeight: 600 }}>Optional — für Cashflow &amp; Eigenkapitalrendite</div>
            <Field label="Eigenkapital" suffix="€" value={eigenkapital} step={1000} onChange={setEigenkapital} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Sollzins p. a." suffix="%" value={zins} step={0.1} onChange={setZins} />
              <Field label="Tilgung p. a." suffix="%" value={tilgung} step={0.5} onChange={setTilgung} />
            </div>
          </div>
        </div>

        {/* Ergebnisse */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px" }}>Dein Ergebnis</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...card, gridColumn: "1 / -1", borderColor: v.color + "66", background: `linear-gradient(135deg, ${C.surface}, ${C.surface3})` }}>
              <div style={{ ...big, color: v.color }}>{de(r.brutto, 2)} %</div>
              <div style={lbl}>Bruttomietrendite</div>
              <div style={{ fontSize: 12, color: v.color, marginTop: 6, fontWeight: 600 }}>{v.text}</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20, color: C.accent }}>{de(r.netto, 2)} %</div>
              <div style={lbl}>Nettomietrendite</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20 }}>{de(r.faktor, 1)}</div>
              <div style={lbl}>Kaufpreisfaktor</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20, color: r.ekRendite >= 0 ? C.green : C.red }}>{de(r.ekRendite, 1)} %</div>
              <div style={lbl}>Eigenkapitalrendite*</div>
            </div>
            <div style={card}>
              <div style={{ ...big, fontSize: 20, color: r.cashflowMonat >= 0 ? C.green : C.red }}>{r.cashflowMonat >= 0 ? "+" : ""}{de(r.cashflowMonat, 0)} €</div>
              <div style={lbl}>Cashflow / Monat*</div>
            </div>
          </div>

          <div style={{ marginTop: 12, ...card, background: C.bg2 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {[
                  ["Jahreskaltmiete", `${de(r.jahresmiete)} €`],
                  ["Kaufnebenkosten", `${de(r.kaufnebenkosten)} €`],
                  ["Gesamtinvestition", `${de(r.gesamtinvest)} €`],
                  ["Darlehen", `${de(r.darlehen)} €`],
                  ["Zinskosten / Jahr", `${de(r.zinsKosten)} €`],
                  ["Netto-Mietertrag / Jahr", `${de(r.noi)} €`],
                ].map((row, i) => (
                  <tr key={row[0]} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                    <td style={{ padding: "7px 2px", color: C.sub }}>{row[0]}</td>
                    <td style={{ padding: "7px 2px", textAlign: "right", fontWeight: 600 }}>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 11, color: C.dim, lineHeight: 1.5, margin: "10px 2px 0" }}>
            *Cashflow &amp; Eigenkapitalrendite vor Steuern. Die Eigenkapitalrendite rechnet Netto-Mietertrag minus Zinsen auf dein
            eingesetztes Eigenkapital; die Tilgung ist kein Aufwand, sondern baut Vermögen auf und mindert daher den Cashflow, nicht die EK-Rendite.
          </p>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "10px 16px", borderRadius: 10, textDecoration: "none" }}>
              Vollständige KI-Bewertung →
            </Link>
            <Link href="/kapitalanlage" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 13.5, padding: "10px 16px", borderRadius: 10, textDecoration: "none" }}>
              Marktwerte nach Stadt
            </Link>
          </div>
        </div>
      </div>

      <style>{`@media (min-width: 760px){ .rr-grid{ grid-template-columns: 1fr 1fr !important; gap: 26px !important; } }`}</style>
    </div>
  );
}
