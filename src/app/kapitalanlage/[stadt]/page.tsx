import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { C } from "@/lib/theme";
import { pageMeta, breadcrumbJsonLd } from "@/lib/seo";
import { getMarketRange } from "@/data/german-cities";
import {
  getCityBySlug, allCitySlugs, citySlug, cityMetrics, tierProfile,
  yieldVerdict, demandVerdict, sameStatePeers, tierPeers, cityFaq,
} from "@/lib/city-pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return allCitySlugs();
}

const TREND: Record<string, string> = { growing: "wachsend", stable: "stabil", shrinking: "rückläufig" };

export function generateMetadata({ params }: { params: { stadt: string } }): Metadata {
  const c = getCityBySlug(params.stadt);
  if (!c) return {};
  const m = cityMetrics(c);
  return pageMeta({
    title: `Immobilie als Kapitalanlage in ${c.city}`,
    description: `Kaufpreise, Mieten, Rendite & Kaufpreisfaktor für ${c.city}: Ø ${c.avgPricePerSqm.toLocaleString("de-DE")} €/m², Brutto-Rendite ca. ${m.grossYield.toLocaleString("de-DE")} %. Plus kostenlose KI-Bewertung deiner Anlageimmobilie.`,
    path: `/kapitalanlage/${citySlug(c.city)}`,
    type: "article",
  });
}

function eur(n: number) { return n.toLocaleString("de-DE"); }
function pop(n: number) { return n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Mio.` : n.toLocaleString("de-DE"); }

export default function CityPage({ params }: { params: { stadt: string } }) {
  const c = getCityBySlug(params.stadt);
  if (!c) notFound();

  const m = cityMetrics(c);
  const r = getMarketRange(c);
  const faq = cityFaq(c, m);
  const tp = tierProfile(c);
  const statePeers = sameStatePeers(c, 8);
  const peers = tierPeers(c, 6);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Start", path: "/" },
    { name: "Kapitalanlage nach Stadt", path: "/kapitalanlage" },
    { name: c.city, path: `/kapitalanlage/${citySlug(c.city)}` },
  ]);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const cards: { label: string; value: string; accent?: boolean }[] = [
    { label: "Ø Kaufpreis", value: `${eur(c.avgPricePerSqm)} €/m²` },
    { label: "Ø Kaltmiete", value: `${c.avgRentPerSqm.toLocaleString("de-DE")} €/m²` },
    { label: "Brutto-Rendite", value: `${m.grossYield.toLocaleString("de-DE")} %`, accent: true },
    { label: "Kaufpreisfaktor", value: `${m.factor.toLocaleString("de-DE")}` },
    { label: "Einwohner", value: pop(c.population) },
    { label: "Leerstand", value: `${c.vacancyRate.toLocaleString("de-DE")} %` },
  ];

  const sec: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 };
  const h2: React.CSSProperties = { fontSize: 19, fontWeight: 700, margin: "0 0 8px" };
  const para: React.CSSProperties = { color: C.sub, fontSize: 15, lineHeight: 1.65, margin: 0 };

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "26px 20px 8px" }}>
      <JsonLd data={[breadcrumb, faqLd]} />

      <nav style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>
        <Link href="/" style={{ color: C.sub, textDecoration: "none" }}>Start</Link> ›{" "}
        <Link href="/kapitalanlage" style={{ color: C.sub, textDecoration: "none" }}>Kapitalanlage</Link> › {c.city}
      </nav>

      <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, margin: "0 0 6px" }}>
        Immobilie als Kapitalanlage in {c.city}
      </h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 10px" }}>{c.state}</span>
        <span style={{ fontSize: 12, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 10px" }}>Tier {c.tier} · {tp.label}</span>
        <span style={{ fontSize: 12, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 10px" }}>Nachfrage {TREND[c.populationTrend]}</span>
      </div>

      {/* Kennzahlen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
        {cards.map((k) => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: k.accent ? C.accent : C.text }}>{k.value}</div>
            <div style={{ color: C.sub, fontSize: 11.5, marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Markteinordnung */}
      <div style={sec}>
        <h2 style={h2}>Markteinordnung</h2>
        <p style={para}>
          {c.city} ({c.state}) zählt mit einem durchschnittlichen Kaufpreis von rund <strong style={{ color: C.text }}>{eur(c.avgPricePerSqm)} €/m²</strong> zu den Märkten der Kategorie <strong style={{ color: C.text }}>Tier {c.tier}</strong> — {tp.blurb}. Bei rund {pop(c.population)} Einwohnern ist die Bevölkerung aktuell <strong style={{ color: C.text }}>{TREND[c.populationTrend]}</strong>. Je nach Lage und Zustand bewegen sich die Angebotspreise typischerweise zwischen {eur(r.priceMin)} und {eur(r.priceMax)} €/m².
        </p>
      </div>

      {/* Rendite & Faktor */}
      <div style={sec}>
        <h2 style={h2}>Rendite &amp; Kaufpreisfaktor</h2>
        <p style={para}>
          Aus der Durchschnittsmiete von ca. {c.avgRentPerSqm.toLocaleString("de-DE")} €/m² ergibt sich eine <strong style={{ color: C.text }}>Brutto-Anfangsrendite von rund {m.grossYield.toLocaleString("de-DE")} %</strong> — das entspricht einem Kaufpreisfaktor von etwa {m.factor.toLocaleString("de-DE")}. Diese Rendite ist {yieldVerdict(m.grossYield)}. Entscheidend bleibt der Einzelfall: Lage, Zustand, Hausgeld und Finanzierung verschieben das Ergebnis deutlich.
        </p>
      </div>

      {/* Nachfrage & Risiko */}
      <div style={sec}>
        <h2 style={h2}>Nachfrage &amp; Risiko</h2>
        <p style={para}>{demandVerdict(c)}</p>
      </div>

      {/* Beispielrechnung */}
      <div style={sec}>
        <h2 style={h2}>Beispiel: {m.exArea} m²-Wohnung in {c.city}</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {[
                ["Kaufpreis (Ø)", `${eur(m.exPrice)} €`],
                ["Kaltmiete / Monat", `${eur(m.exRent)} €`],
                ["Jahreskaltmiete", `${eur(m.exYearly)} €`],
                ["Brutto-Rendite", `${m.grossYield.toLocaleString("de-DE")} %`],
                ["Kaufpreisfaktor", `${m.factor.toLocaleString("de-DE")}`],
              ].map((row, i) => (
                <tr key={row[0]} style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 4px", color: C.sub }}>{row[0]}</td>
                  <td style={{ padding: "9px 4px", textAlign: "right", fontWeight: 600 }}>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...para, fontSize: 12.5, marginTop: 10, color: C.dim }}>
          Vereinfachte Brutto-Rechnung ohne Kaufnebenkosten, Hausgeld und Finanzierung. Für die echte Netto-Rendite dein konkretes Objekt im ImmoScorer durchrechnen.
        </p>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,#101a2e,#0D0F16)", border: `1px solid ${C.accent}`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h2 style={{ ...h2, marginBottom: 6 }}>Konkretes Objekt in {c.city} bewerten</h2>
        <p style={{ ...para, marginBottom: 14 }}>
          Du hast eine konkrete Wohnung im Blick? Der kostenlose ImmoScorer gibt dir in Sekunden einen Score samt Rendite, Risiko und Verhandlungs-Tipps — ganz ohne Account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            Objekt bewerten →
          </Link>
          <Link href="/check" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            🎤 Sprach-Check
          </Link>
          <Link href="/besichtigung" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            🏠 Besichtigungs-Begleiter
          </Link>
        </div>
        <a href="https://www.bauzinsmarkt.de/baufinanzierung-nach-stadt/?utm_source=immoscorer&utm_medium=kapitalanlage" style={{ display: "inline-block", marginTop: 12, color: C.accent, fontSize: 14, textDecoration: "none" }}>
          Finanzierung für {c.city} kostenlos prüfen →
        </a>
      </div>

      {/* FAQ */}
      <div style={sec}>
        <h2 style={h2}>Häufige Fragen zu {c.city}</h2>
        {faq.map((f) => (
          <div key={f.q} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{f.q}</div>
            <p style={{ ...para, fontSize: 14 }}>{f.a}</p>
          </div>
        ))}
      </div>

      {/* Interne Verlinkung */}
      {statePeers.length > 0 && (
        <div style={sec}>
          <h2 style={{ ...h2, fontSize: 16 }}>Weitere Städte in {c.state}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statePeers.map((p) => (
              <Link key={p.city} href={`/kapitalanlage/${citySlug(p.city)}`} style={{ fontSize: 13.5, color: C.accent, border: `1px solid ${C.border}`, borderRadius: 999, padding: "5px 12px", textDecoration: "none" }}>
                {p.city}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={sec}>
        <h2 style={{ ...h2, fontSize: 16 }}>Ähnliche Märkte (Tier {c.tier})</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {peers.map((p) => (
            <Link key={p.city} href={`/kapitalanlage/${citySlug(p.city)}`} style={{ fontSize: 13.5, color: C.accent, border: `1px solid ${C.border}`, borderRadius: 999, padding: "5px 12px", textDecoration: "none" }}>
              {p.city}
            </Link>
          ))}
          <Link href="/kapitalanlage" style={{ fontSize: 13.5, color: C.sub, border: `1px solid ${C.border}`, borderRadius: 999, padding: "5px 12px", textDecoration: "none" }}>
            Alle Städte →
          </Link>
        </div>
      </div>

      <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, margin: "8px 0 0" }}>
        Werte sind kuratierte Markt-Orientierungswerte (Stand 2024/2025), keine flurstückgenauen Preise und keine Anlageberatung.
      </p>
    </main>
  );
}
