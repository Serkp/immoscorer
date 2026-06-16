import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { C } from "@/lib/theme";
import { pageMeta, breadcrumbJsonLd } from "@/lib/seo";
import { CITIES, type CityData } from "@/data/german-cities";
import { citySlug, cityMetrics } from "@/lib/city-pages";

export const metadata: Metadata = pageMeta({
  title: "Immobilie als Kapitalanlage — Preise & Rendite nach Stadt",
  description:
    "Marktdaten für 137 deutsche Städte: durchschnittliche Kaufpreise, Mieten, Brutto-Rendite und Kaufpreisfaktor — plus kostenlose KI-Bewertung deiner konkreten Anlageimmobilie.",
  path: "/kapitalanlage",
});

const TIERS: { key: CityData["tier"]; title: string; sub: string }[] = [
  { key: "A", title: "Top-Metropolen", sub: "Höchste Preise, hohe Wertstabilität, niedrige Anfangsrenditen" },
  { key: "B", title: "Starke Großstädte", sub: "Solide Nachfrage, ausgewogenes Chance-Risiko-Profil" },
  { key: "C", title: "Solide Mittelstädte", sub: "Günstigere Einstiegspreise, oft höhere Anfangsrenditen" },
  { key: "D", title: "Günstige Märkte", sub: "Niedrige Preise, hohe rechnerische Renditen — Nachfrage genau prüfen" },
];

export default function KapitalanlageHub() {
  const eur = (n: number) => n.toLocaleString("de-DE");
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 8px" }}>
      <JsonLd data={breadcrumbJsonLd([{ name: "Start", path: "/" }, { name: "Kapitalanlage nach Stadt", path: "/kapitalanlage" }])} />

      <nav style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>
        <Link href="/" style={{ color: C.sub, textDecoration: "none" }}>Start</Link> › Kapitalanlage nach Stadt
      </nav>

      <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px" }}>
        Immobilie als Kapitalanlage — Marktdaten nach Stadt
      </h1>
      <p style={{ color: C.sub, fontSize: 16, lineHeight: 1.6, maxWidth: 720, margin: "0 0 24px" }}>
        Durchschnittliche Kaufpreise, Mieten, Brutto-Rendite und Kaufpreisfaktor für {CITIES.length} deutsche Städte —
        als Orientierung, bevor du ein konkretes Objekt prüfst. Für die Einzelfall-Bewertung gibt dir der{" "}
        <Link href="/analysis" style={{ color: C.accent, textDecoration: "none" }}>kostenlose ImmoScorer</Link>{" "}
        in Sekunden einen Score samt Rendite, Risiko und Verhandlungs-Tipps.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
          Objekt jetzt bewerten →
        </Link>
        <Link href="/check" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
          🎤 Per Sprache prüfen
        </Link>
      </div>

      {TIERS.map((t) => {
        const cities = CITIES.filter((c) => c.tier === t.key).sort((a, b) => b.population - a.population);
        if (cities.length === 0) return null;
        return (
          <section key={t.key} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 2px" }}>{t.title}</h2>
            <p style={{ color: C.dim, fontSize: 13, margin: "0 0 14px" }}>{t.sub}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {cities.map((c) => {
                const m = cityMetrics(c);
                return (
                  <Link
                    key={c.city}
                    href={`/kapitalanlage/${citySlug(c.city)}`}
                    style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textDecoration: "none", color: C.text }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{c.city}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.sub }}>
                      <span>{eur(c.avgPricePerSqm)} €/m²</span>
                      <span style={{ color: C.accent, fontWeight: 600 }}>{m.grossYield.toLocaleString("de-DE")} % Rendite</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
        Alle Werte sind kuratierte Markt-Orientierungswerte (Stand 2024/2025) und keine flurstückgenauen Preise.
        Brutto-Anfangsrendite = Jahreskaltmiete ÷ Kaufpreis; Kaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete.
        Keine Anlageberatung.
      </p>
    </main>
  );
}
