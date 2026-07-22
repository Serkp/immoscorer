import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { KaufpreisfaktorRechner } from "@/components/KaufpreisfaktorRechner";
import { C } from "@/lib/theme";
import { pageMeta, breadcrumbJsonLd, absoluteUrl, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Kaufpreisfaktor berechnen — Rechner & Einordnung",
  description:
    "Kaufpreisfaktor (Vervielfältiger) einer Immobilie in Sekunden berechnen: Kaufpreis ÷ Jahresnettokaltmiete. Mit Umrechnung in die Mietrendite, Tabelle, Einordnung wann ein Faktor gut oder zu teuer ist — kostenlos, ohne Anmeldung.",
  path: "/kaufpreisfaktor-rechner",
});

const FAQ: { q: string; a: string }[] = [
  {
    q: "Wie berechnet man den Kaufpreisfaktor?",
    a: "Kaufpreisfaktor = Kaufpreis ÷ Jahresnettokaltmiete. Beispiel: Kostet eine Wohnung 300.000 € und bringt 1.000 € Nettokaltmiete im Monat (12.000 € im Jahr), beträgt der Faktor 300.000 ÷ 12.000 = 25. Der Kaufpreis entspricht also 25 Jahresmieten. Wichtig: Es zählt die Nettokaltmiete ohne Betriebs- und Heizkosten.",
  },
  {
    q: "Was ist ein guter Kaufpreisfaktor?",
    a: "Eine feste Grenze gibt es nicht — der übliche Faktor hängt stark von Lage und Nachfrage ab. Grobe Orientierung: In gefragten Großstädten sind heute Faktoren von 25–35 üblich, in günstigeren Mittel- und Kleinstädten eher 15–22. Ein niedriger Faktor bedeutet mehr laufende Rendite, ein hoher Faktor steht meist für hohe Wertstabilität und Nachfrage — dafür wenig Cashflow.",
  },
  {
    q: "Was bedeutet ein Kaufpreisfaktor von 25?",
    a: "Ein Faktor von 25 heißt: Der Kaufpreis entspricht 25 Jahresnettokaltmieten. Rein rechnerisch wäre der Kaufpreis nach 25 Jahren durch die Mieten wieder eingespielt (ohne Kosten, Steuern und Wertänderung). Ein Faktor von 25 entspricht genau 4 % Bruttomietrendite, denn Bruttorendite = 100 ÷ Faktor.",
  },
  {
    q: "Wie hängen Kaufpreisfaktor und Mietrendite zusammen?",
    a: "Der Kaufpreisfaktor ist der Kehrwert der Bruttomietrendite. Es gilt: Bruttomietrendite in % = 100 ÷ Kaufpreisfaktor, und umgekehrt Kaufpreisfaktor = 100 ÷ Bruttomietrendite. Faktor 20 = 5 %, Faktor 25 = 4 %, Faktor 30 ≈ 3,3 %. Beide Kennzahlen sagen dasselbe aus, nur aus zwei Blickwinkeln.",
  },
  {
    q: "Welche Miete zählt für den Kaufpreisfaktor — netto oder brutto?",
    a: "Die Nettokaltmiete (Kaltmiete ohne Betriebs- und Heizkosten). Betriebskosten werden auf die Mieter umgelegt und sind kein Ertrag des Vermieters, deshalb dürfen sie nicht in die Jahresmiete einfließen. Wer versehentlich die Warmmiete ansetzt, erhält einen zu niedrigen, geschönten Faktor.",
  },
  {
    q: "Ist ein niedriger Kaufpreisfaktor immer besser?",
    a: "Nicht automatisch. Ein niedriger Faktor bringt zwar mehr laufende Rendite, steht aber oft für schwächere Lagen, höheres Leerstands- oder Mietausfallrisiko oder Sanierungsbedarf. Ein hoher Faktor in einer wachsenden Stadt kann durch Wertsteigerung und stabile Vermietung gerechtfertigt sein. Der Faktor ist ein Startfilter — die Einzelfallprüfung ersetzt er nicht.",
  },
  {
    q: "Berücksichtigt der Kaufpreisfaktor die Kaufnebenkosten?",
    a: "Nein. Der Kaufpreisfaktor rechnet nur mit dem reinen Kaufpreis. Grunderwerbsteuer, Notar, Grundbuch und Makler (zusammen rund 9–12 %) sowie Hausgeld und Finanzierung bleiben außen vor. Für die ehrliche Nettobetrachtung nach allen Kosten nutze den Renditerechner.",
  },
];

// Faktor ↔ Bruttorendite: reine Mathematik (Rendite = 100 / Faktor), keine Marktdaten.
const TABLE: { faktor: number; einordnung: string }[] = [
  { faktor: 15, einordnung: "günstig, oft schwächere Lage" },
  { faktor: 18, einordnung: "günstig" },
  { faktor: 20, einordnung: "solide" },
  { faktor: 22, einordnung: "solide" },
  { faktor: 25, einordnung: "ambitioniert / gefragte Lage" },
  { faktor: 28, einordnung: "gefragte Großstadtlage" },
  { faktor: 30, einordnung: "teuer, Top-Lage" },
  { faktor: 35, einordnung: "sehr teuer" },
];

const sec: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 };
const h2: React.CSSProperties = { fontSize: 20, fontWeight: 700, margin: "0 0 10px" };
const para: React.CSSProperties = { color: C.sub, fontSize: 15, lineHeight: 1.7, margin: "0 0 10px" };
const formula: React.CSSProperties = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14.5, color: C.text, fontWeight: 600, margin: "4px 0 12px", lineHeight: 1.6 };

export default function KaufpreisfaktorRechnerPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Start", path: "/" },
    { name: "Kaufpreisfaktor-Rechner", path: "/kaufpreisfaktor-rechner" },
  ]);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ImmoScorer Kaufpreisfaktor-Rechner",
    url: absoluteUrl("/kaufpreisfaktor-rechner"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: "de-DE",
    description:
      "Kostenloser Kaufpreisfaktor-Rechner: berechnet den Vervielfältiger (Kaufpreis ÷ Jahresnettokaltmiete), die entsprechende Bruttomietrendite und den fairen Kaufpreis bei einem Zielfaktor.",
    featureList: [
      "Kaufpreisfaktor / Vervielfältiger berechnen",
      "Umrechnung Faktor in Bruttomietrendite",
      "Fairer Kaufpreis bei Zielfaktor",
      "Qualitative Einordnung des Faktors",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE.url}/#organization` },
  };

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "26px 20px 8px" }}>
      <JsonLd data={[breadcrumb, faqLd, appLd]} />

      <nav style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>
        <Link href="/" style={{ color: C.sub, textDecoration: "none" }}>Start</Link> › Kaufpreisfaktor-Rechner
      </nav>

      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: "0 0 10px" }}>
        Kaufpreisfaktor berechnen
      </h1>
      <p style={{ color: C.sub, fontSize: 16.5, lineHeight: 1.6, maxWidth: 720, margin: "0 0 20px" }}>
        Der <strong style={{ color: C.text }}>Kaufpreisfaktor</strong> (auch Vervielfältiger oder
        Mietpreismultiplikator) zeigt, wie viele Jahresnettokaltmieten der Kaufpreis einer Immobilie entspricht —
        die schnellste Kennzahl, um zu erkennen, ob ein Objekt günstig oder teuer ist. Berechne ihn hier in Sekunden,
        rechne ihn in die Mietrendite um und finde heraus, was ein fairer Kaufpreis wäre. Kostenlos, ohne Anmeldung.
      </p>

      {/* Rechner */}
      <div style={{ marginBottom: 24 }}>
        <KaufpreisfaktorRechner />
      </div>

      {/* Was ist der Kaufpreisfaktor */}
      <div style={sec}>
        <h2 style={h2}>Was ist der Kaufpreisfaktor?</h2>
        <p style={para}>
          Der Kaufpreisfaktor beantwortet eine einfache Frage: <em>Wie viele Jahre reine Miete kostet diese
          Immobilie?</em> Er setzt den Kaufpreis ins Verhältnis zur Jahresnettokaltmiete und macht damit Objekte
          unterschiedlicher Größe und Stadt in einer einzigen Zahl vergleichbar. In Deutschland ist er die
          gebräuchlichste Kennzahl für den ersten Preis-Check einer Kapitalanlage — Makler und Verkäufer nennen ihn oft
          direkt im Exposé. Synonyme sind <strong style={{ color: C.text }}>Vervielfältiger</strong> und
          {" "}<strong style={{ color: C.text }}>Mietpreismultiplikator</strong>.
        </p>
      </div>

      {/* Formel & Beispiel */}
      <div style={sec}>
        <h2 style={h2}>Kaufpreisfaktor-Formel &amp; Beispiel</h2>
        <div style={formula}>Kaufpreisfaktor = Kaufpreis ÷ Jahresnettokaltmiete</div>
        <p style={para}>
          <strong style={{ color: C.text }}>Beispiel:</strong> Eine Wohnung kostet 300.000 € und bringt 1.000 €
          Nettokaltmiete im Monat, also 12.000 € im Jahr. Der Kaufpreisfaktor beträgt 300.000 ÷ 12.000 =
          {" "}<strong style={{ color: C.text }}>25</strong>. Der Kaufpreis entspricht damit 25 Jahresmieten. Achte
          darauf, immer die <strong style={{ color: C.text }}>Nettokaltmiete</strong> (ohne Betriebs- und Heizkosten)
          zu verwenden — die Warmmiete würde den Faktor künstlich senken.
        </p>
      </div>

      {/* Zusammenhang Mietrendite */}
      <div style={sec}>
        <h2 style={h2}>Kaufpreisfaktor und Mietrendite: der Zusammenhang</h2>
        <p style={para}>
          Kaufpreisfaktor und Bruttomietrendite sind zwei Seiten derselben Medaille — der Faktor ist der Kehrwert der
          Rendite. Deshalb lässt sich das eine sofort ins andere umrechnen:
        </p>
        <div style={formula}>Bruttomietrendite in % = 100 ÷ Kaufpreisfaktor&nbsp;&nbsp;·&nbsp;&nbsp;Kaufpreisfaktor = 100 ÷ Bruttomietrendite</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: "left", padding: "8px 4px", color: C.sub, fontWeight: 600 }}>Kaufpreisfaktor</th>
                <th style={{ textAlign: "right", padding: "8px 4px", color: C.sub, fontWeight: 600 }}>Bruttomietrendite</th>
                <th style={{ textAlign: "right", padding: "8px 4px", color: C.sub, fontWeight: 600 }}>Einordnung</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => (
                <tr key={row.faktor} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px 4px", fontWeight: 600 }}>{row.faktor.toLocaleString("de-DE")}</td>
                  <td style={{ padding: "8px 4px", textAlign: "right", color: C.accent, fontWeight: 600 }}>
                    {(100 / row.faktor).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right", color: C.dim, fontSize: 13 }}>{row.einordnung}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...para, fontSize: 13, marginTop: 10, color: C.dim }}>
          Die Renditewerte sind reine Umrechnung (100 ÷ Faktor). Die Einordnung ist eine qualitative Orientierung,
          keine feste Regel — den passenden Faktor bestimmt immer der lokale Markt.
        </p>
      </div>

      {/* Wann gut, wann zu teuer */}
      <div style={sec}>
        <h2 style={h2}>Wann ist ein Kaufpreisfaktor gut, wann zu teuer?</h2>
        <p style={para}>
          Ob ein Faktor günstig oder teuer ist, lässt sich nicht pauschal sagen — er hängt vor allem von Lage und
          Nachfrage ab. In stark gefragten Großstädten mit wachsender Bevölkerung sind heute Faktoren von etwa
          {" "}<strong style={{ color: C.text }}>25 bis 35</strong> üblich; Käufer akzeptieren dort eine niedrigere
          laufende Rendite im Tausch gegen Wertstabilität. In günstigeren Mittel- und Kleinstädten liegen die Faktoren
          eher bei <strong style={{ color: C.text }}>15 bis 22</strong> — mit höherem laufendem Ertrag, dafür sind
          Vermietbarkeit und Wertentwicklung genauer zu prüfen.
        </p>
        <p style={para}>
          Entscheidend ist der Vergleich mit dem <strong style={{ color: C.text }}>ortsüblichen</strong> Faktor: Ein
          Faktor von 28 ist in München günstig, in einer schrumpfenden Region aber teuer. Die durchschnittlichen
          Kaufpreisfaktoren für 137 deutsche Städte findest du im{" "}
          <Link href="/kapitalanlage" style={{ color: C.accent, textDecoration: "none" }}>Bereich Kapitalanlage nach Stadt</Link>.
          Eine ausführliche Einordnung, ab wann eine Anlageimmobilie rechnerisch zu teuer wird, liest du im Ratgeber{" "}
          <Link href="/wissen/kennzahlen/kaufpreisfaktor-anlageimmobilie-zu-teuer" style={{ color: C.accent, textDecoration: "none" }}>Kaufpreisfaktor: Wann ist eine Immobilie zu teuer?</Link>
        </p>
      </div>

      {/* Grenzen / Abgrenzung zum Renditerechner */}
      <div style={sec}>
        <h2 style={h2}>Grenzen des Kaufpreisfaktors</h2>
        <p style={para}>
          Der Kaufpreisfaktor ist ein schneller Filter, aber keine vollständige Wirtschaftlichkeitsrechnung. Er
          ignoriert bewusst mehrere Faktoren:
        </p>
        <ul style={{ ...para, paddingLeft: 20, margin: "0 0 10px" }}>
          <li>die <strong style={{ color: C.text }}>Kaufnebenkosten</strong> (Grunderwerbsteuer, Notar, Grundbuch, Makler — rund 9–12 %),</li>
          <li>die nicht umlagefähigen <strong style={{ color: C.text }}>Bewirtschaftungskosten</strong> (Verwaltung, Instandhaltungsrücklage, Mietausfallwagnis),</li>
          <li><strong style={{ color: C.text }}>Zustand und Sanierungsstau</strong> sowie das künftige Mietsteigerungspotenzial,</li>
          <li>die <strong style={{ color: C.text }}>Finanzierung</strong> (Zins, Tilgung) und damit den tatsächlichen Cashflow.</li>
        </ul>
        <p style={para}>
          Für die ehrliche Betrachtung nach allen Kosten — Nettomietrendite, Eigenkapitalrendite und monatlicher
          Cashflow — nutze im nächsten Schritt den{" "}
          <Link href="/rendite-rechner" style={{ color: C.accent, textDecoration: "none" }}>Renditerechner</Link>.
          Er baut auf denselben Zahlen auf und ergänzt Kosten und Finanzierung.
        </p>
      </div>

      {/* FAQ */}
      <div style={sec}>
        <h2 style={h2}>Häufige Fragen zum Kaufpreisfaktor</h2>
        {FAQ.map((f) => (
          <div key={f.q} style={{ marginTop: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15.5, margin: "0 0 4px" }}>{f.q}</h3>
            <p style={{ ...para, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,#101a2e,#0D0F16)", border: `1px solid ${C.accent}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <h2 style={{ ...h2, marginBottom: 6 }}>Faktor stimmt — und sonst?</h2>
        <p style={{ ...para, marginBottom: 14 }}>
          Der Kaufpreisfaktor sagt dir, ob der Preis stimmt. Der kostenlose ImmoScorer bewertet ein konkretes Objekt
          zusätzlich nach Lage, Zustand, Energie und Finanzierbarkeit — mit KI-Score und Verhandlungs-Tipps, ohne Account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            Objekt kostenlos bewerten →
          </Link>
          <Link href="/rendite-rechner" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            Renditerechner
          </Link>
        </div>
      </div>

      <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, margin: "8px 0 0" }}>
        Der Kaufpreisfaktor ist eine vereinfachte Kennzahl ohne Kaufnebenkosten, laufende Kosten, Steuern und
        Finanzierung. Er ersetzt keine individuelle Steuer-, Finanz- oder Anlageberatung. Beispielwerte und
        Bandbreiten dienen nur der Veranschaulichung.
      </p>
    </main>
  );
}
