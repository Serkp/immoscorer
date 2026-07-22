import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { RenditeRechner } from "@/components/RenditeRechner";
import { C } from "@/lib/theme";
import { pageMeta, breadcrumbJsonLd, absoluteUrl, SITE } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Renditerechner Immobilien — Mietrendite & Cashflow berechnen",
  description:
    "Kostenloser Immobilien-Renditerechner: Brutto- und Nettomietrendite, Kaufpreisfaktor, Eigenkapitalrendite und Cashflow in Sekunden berechnen — mit Formeln, Beispiel und Erklärung. Ohne Anmeldung.",
  path: "/rendite-rechner",
});

const FAQ: { q: string; a: string }[] = [
  {
    q: "Wie berechne ich die Bruttomietrendite einer Immobilie?",
    a: "Bruttomietrendite = Jahreskaltmiete ÷ Kaufpreis × 100. Beispiel: 9.000 € Jahreskaltmiete bei 250.000 € Kaufpreis ergeben 3,6 %. Die Bruttorendite lässt Kaufnebenkosten und laufende Kosten außen vor und dient nur als schnelle erste Orientierung.",
  },
  {
    q: "Was ist der Unterschied zwischen Brutto- und Nettomietrendite?",
    a: "Die Bruttomietrendite setzt nur die Jahreskaltmiete ins Verhältnis zum Kaufpreis. Die Nettomietrendite zieht zusätzlich die Kaufnebenkosten (auf der Investitionsseite) und die nicht umlagefähigen Bewirtschaftungskosten wie Verwaltung, Instandhaltungsrücklage und Mietausfallwagnis (auf der Ertragsseite) ab. Sie liegt daher spürbar niedriger und ist die ehrlichere Kennzahl.",
  },
  {
    q: "Was ist ein guter Kaufpreisfaktor?",
    a: "Der Kaufpreisfaktor (Vervielfältiger) ist der Kehrwert der Bruttorendite: Kaufpreis ÷ Jahreskaltmiete. Ein Faktor von 20 entspricht 5 % Bruttorendite, ein Faktor von 25 genau 4 %. In gefragten Großstädten sind heute Faktoren von 25–35 üblich, in günstigeren Lagen 15–20. Ein niedriger Faktor bedeutet mehr laufende Rendite, ein hoher Faktor steht meist für hohe Wertstabilität und Nachfrage.",
  },
  {
    q: "Wie hoch sollte die Mietrendite einer Kapitalanlage sein?",
    a: "Eine pauschale Zielrendite gibt es nicht — sie hängt von Lage, Zustand, Finanzierung und deinem Ziel ab. Grobe Orientierung: unter 3 % zahlst du vor allem für Lage und Wertstabilität, 4–5,5 % gelten als solides Verhältnis aus Sicherheit und Ertrag, deutlich über 5,5 % ist rechnerisch stark, verlangt aber eine besonders genaue Prüfung von Substanz und Vermietbarkeit.",
  },
  {
    q: "Wie berechne ich die Eigenkapitalrendite bei einer finanzierten Immobilie?",
    a: "Eigenkapitalrendite = (Netto-Mietertrag − Zinskosten) ÷ eingesetztes Eigenkapital × 100. Weil du nur einen Teil selbst einbringst und den Rest finanzierst, kann die Rendite auf dein Eigenkapital höher sein als die Objektrendite (Hebel- bzw. Leverage-Effekt). Achtung: Liegt der Zins über der Objektrendite, kehrt sich der Hebel um und die Eigenkapitalrendite wird negativ.",
  },
  {
    q: "Wie berechne ich den monatlichen Cashflow?",
    a: "Cashflow = Jahreskaltmiete − nicht umlagefähige Kosten − Kapitaldienst (Zins + Tilgung), geteilt durch 12. Ein negativer Cashflow bedeutet, dass du monatlich Geld zuschießt. Das ist bei niedrigen Bruttorenditen und hoher Fremdfinanzierung häufig — entscheidend ist, ob Tilgung (Vermögensaufbau) und mögliche Wertsteigerung den Zuschuss rechtfertigen.",
  },
  {
    q: "Sind die Ergebnisse des Renditerechners verbindlich?",
    a: "Nein. Der Rechner liefert eine transparente Überschlagsrechnung mit deinen Eingaben. Steuern (AfA, persönlicher Steuersatz), Sondertilgungen, Leerstand oder anstehende Sanierungen sind nicht enthalten. Für eine vollständige Einschätzung nutze die kostenlose KI-Bewertung und ziehe bei Bedarf Steuer- und Finanzierungsberatung hinzu.",
  },
];

const sec: React.CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, marginBottom: 14 };
const h2: React.CSSProperties = { fontSize: 20, fontWeight: 700, margin: "0 0 10px" };
const para: React.CSSProperties = { color: C.sub, fontSize: 15, lineHeight: 1.7, margin: "0 0 10px" };
const formula: React.CSSProperties = { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", fontSize: 14.5, color: C.text, fontWeight: 600, margin: "4px 0 12px", lineHeight: 1.6 };

export default function RenditeRechnerPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Start", path: "/" },
    { name: "Renditerechner", path: "/rendite-rechner" },
  ]);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ImmoScorer Renditerechner",
    url: absoluteUrl("/rendite-rechner"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "de-DE",
    description:
      "Kostenloser Immobilien-Renditerechner: berechnet Brutto- und Nettomietrendite, Kaufpreisfaktor, Eigenkapitalrendite und monatlichen Cashflow.",
    featureList: [
      "Bruttomietrendite berechnen",
      "Nettomietrendite berechnen",
      "Kaufpreisfaktor / Vervielfältiger",
      "Eigenkapitalrendite (Leverage)",
      "Monatlicher Cashflow",
    ],
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    isAccessibleForFree: true,
    publisher: { "@id": `${SITE.url}/#organization` },
  };

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "26px 20px 8px" }}>
      <JsonLd data={[breadcrumb, faqLd, appLd]} />

      <nav style={{ fontSize: 13, color: C.dim, marginBottom: 14 }}>
        <Link href="/" style={{ color: C.sub, textDecoration: "none" }}>Start</Link> › Renditerechner
      </nav>

      <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, margin: "0 0 10px" }}>
        Immobilien-Renditerechner
      </h1>
      <p style={{ color: C.sub, fontSize: 16.5, lineHeight: 1.6, maxWidth: 720, margin: "0 0 20px" }}>
        Berechne in Sekunden die <strong style={{ color: C.text }}>Mietrendite</strong> deiner Kapitalanlage —
        Brutto- und Nettomietrendite, Kaufpreisfaktor, Eigenkapitalrendite und den monatlichen Cashflow.
        Kostenlos, ohne Anmeldung, mit transparenten Formeln zum Nachrechnen.
      </p>

      {/* Rechner */}
      <div style={{ marginBottom: 24 }}>
        <RenditeRechner />
      </div>

      {/* Was ist Mietrendite */}
      <div style={sec}>
        <h2 style={h2}>Was ist die Mietrendite?</h2>
        <p style={para}>
          Die Mietrendite zeigt, wie viel Ertrag eine vermietete Immobilie im Verhältnis zum eingesetzten Kapital abwirft.
          Sie ist die zentrale Kennzahl, um zu beurteilen, ob sich ein Objekt als Kapitalanlage lohnt. Unterschieden wird
          zwischen der <strong style={{ color: C.text }}>Bruttomietrendite</strong> (schnelle Orientierung) und der
          {" "}<strong style={{ color: C.text }}>Nettomietrendite</strong> (ehrliche Zahl nach Kosten). Wer nur auf die
          Bruttorendite schaut, überschätzt seinen Ertrag systematisch.
        </p>
      </div>

      {/* Bruttomietrendite */}
      <div style={sec}>
        <h2 style={h2}>Bruttomietrendite berechnen</h2>
        <p style={para}>
          Die Bruttomietrendite setzt die Jahreskaltmiete ins Verhältnis zum reinen Kaufpreis — ohne Nebenkosten und
          laufende Kosten. Sie eignet sich, um Inserate in Sekunden zu vergleichen, nicht für die endgültige Entscheidung.
        </p>
        <div style={formula}>Bruttomietrendite = Jahreskaltmiete ÷ Kaufpreis × 100</div>
        <p style={para}>
          <strong style={{ color: C.text }}>Beispiel:</strong> Eine Wohnung kostet 250.000 € und bringt 750 € Kaltmiete
          im Monat, also 9.000 € im Jahr. Die Bruttomietrendite beträgt 9.000 ÷ 250.000 × 100 = <strong style={{ color: C.text }}>3,6 %</strong>.
        </p>
      </div>

      {/* Nettomietrendite */}
      <div style={sec}>
        <h2 style={h2}>Nettomietrendite berechnen</h2>
        <p style={para}>
          Die Nettomietrendite ist die aussagekräftigere Kennzahl. Sie berücksichtigt zwei Dinge zusätzlich: die
          {" "}<strong style={{ color: C.text }}>Kaufnebenkosten</strong> (Grunderwerbsteuer je nach Bundesland 3,5–6,5 %,
          Notar und Grundbuch rund 1,5–2 %, ggf. Makler) auf der Investitionsseite und die{" "}
          <strong style={{ color: C.text }}>nicht umlagefähigen Bewirtschaftungskosten</strong> (Verwaltung,
          Instandhaltungsrücklage, Mietausfallwagnis) auf der Ertragsseite.
        </p>
        <div style={formula}>Nettomietrendite = (Jahreskaltmiete − nicht umlagefähige Kosten) ÷ (Kaufpreis + Kaufnebenkosten) × 100</div>
        <p style={para}>
          <strong style={{ color: C.text }}>Beispiel:</strong> Bei 10 % Kaufnebenkosten (25.000 €) steigt die Investition
          auf 275.000 €. Ziehst du 1.800 € nicht umlagefähige Kosten von den 9.000 € Miete ab, bleiben 7.200 €.
          Netto: 7.200 ÷ 275.000 × 100 = <strong style={{ color: C.text }}>2,62 %</strong> — deutlich weniger als die
          3,6 % brutto. Als Faustregel liegt die Nettorendite oft rund 25–35 % unter der Bruttorendite.
        </p>
      </div>

      {/* Kaufpreisfaktor */}
      <div style={sec}>
        <h2 style={h2}>Kaufpreisfaktor &amp; Vervielfältiger</h2>
        <p style={para}>
          Der Kaufpreisfaktor (auch Vervielfältiger oder Mietpreismultiplikator) sagt, wie viele Jahreskaltmieten der
          Kaufpreis entspricht. Er ist der Kehrwert der Bruttorendite und macht Objekte über Städte hinweg vergleichbar.
        </p>
        <div style={formula}>Kaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete&nbsp;&nbsp;(= 100 ÷ Bruttorendite in %)</div>
        <p style={para}>
          Im Beispiel: 250.000 ÷ 9.000 = <strong style={{ color: C.text }}>27,8</strong>. Ein Faktor von 20 entspricht
          5 % Bruttorendite, ein Faktor von 25 genau 4 %. Wie hoch der Faktor in deiner Stadt üblich ist, siehst du auf
          den <Link href="/kapitalanlage" style={{ color: C.accent, textDecoration: "none" }}>Marktdaten-Seiten nach Stadt</Link>.
        </p>
      </div>

      {/* Eigenkapitalrendite & Cashflow */}
      <div style={sec}>
        <h2 style={h2}>Eigenkapitalrendite &amp; Cashflow</h2>
        <p style={para}>
          Bei einer finanzierten Immobilie zählt für dich nicht nur die Objektrendite, sondern die Rendite auf dein
          tatsächlich eingesetztes Eigenkapital. Weil ein Teil über die Bank finanziert wird, kann dieser Wert höher
          ausfallen als die reine Mietrendite — der sogenannte Hebel- oder Leverage-Effekt.
        </p>
        <div style={formula}>Eigenkapitalrendite = (Netto-Mietertrag − Zinskosten) ÷ Eigenkapital × 100</div>
        <p style={para}>
          Der <strong style={{ color: C.text }}>Cashflow</strong> ist das, was am Monatsende übrig bleibt: Miete minus
          laufende Kosten minus Kapitaldienst (Zins + Tilgung). Er kann negativ sein, wenn die Rendite unter dem
          Finanzierungszins liegt — dann schießt du monatlich Geld zu. Das ist nicht automatisch schlecht: Die Tilgung
          baut Vermögen auf. Entscheidend ist, ob Tilgung und mögliche Wertsteigerung den Zuschuss rechtfertigen.
          Der Rechner oben zeigt beide Werte live an, sobald du Eigenkapital, Zins und Tilgung einträgst.
        </p>
      </div>

      {/* Welche Rendite ist gut */}
      <div style={sec}>
        <h2 style={h2}>Welche Rendite ist gut?</h2>
        <p style={para}>
          Eine allgemeingültige Zielrendite gibt es nicht — sie hängt von Lage, Zustand, Finanzierung und deinem Ziel ab.
          Als grobe Einordnung der Bruttomietrendite:
        </p>
        <ul style={{ ...para, paddingLeft: 20, margin: "0 0 6px" }}>
          <li><strong style={{ color: C.text }}>unter 3 %</strong> — du zahlst vor allem für Lage und Wertstabilität, kaum laufender Cashflow.</li>
          <li><strong style={{ color: C.text }}>3–4 %</strong> — typisch für gefragte Groß­stadtlagen, moderater Ertrag.</li>
          <li><strong style={{ color: C.text }}>4–5,5 %</strong> — solides Verhältnis aus Sicherheit und Ertrag.</li>
          <li><strong style={{ color: C.text }}>über 5,5 %</strong> — rechnerisch stark, aber Substanz, Lage und Vermietbarkeit besonders genau prüfen.</li>
        </ul>
        <p style={para}>
          Konkrete Durchschnittswerte für Kaufpreise, Mieten und Renditen von 137 deutschen Städten findest du im{" "}
          <Link href="/kapitalanlage" style={{ color: C.accent, textDecoration: "none" }}>Bereich Kapitalanlage nach Stadt</Link>.
        </p>
      </div>

      {/* Weiterführend / interne Links */}
      <div style={sec}>
        <h2 style={{ ...h2, fontSize: 17 }}>Tiefer einsteigen</h2>
        <ul style={{ ...para, paddingLeft: 20, margin: 0 }}>
          <li><Link href="/wissen/kennzahlen/rendite-berechnen" style={{ color: C.accent, textDecoration: "none" }}>Rendite richtig berechnen</Link> — alle Kennzahlen im Detail</li>
          <li><Link href="/wissen/kennzahlen/mietrendite-berechnen" style={{ color: C.accent, textDecoration: "none" }}>Mietrendite berechnen</Link> — Brutto vs. Netto Schritt für Schritt</li>
          <li><Link href="/wissen/kennzahlen/kaufpreisfaktor-anlageimmobilie-zu-teuer" style={{ color: C.accent, textDecoration: "none" }}>Kaufpreisfaktor</Link> — wann eine Immobilie zu teuer ist</li>
          <li><Link href="/wissen/kennzahlen/cashflow-analyse" style={{ color: C.accent, textDecoration: "none" }}>Cashflow-Analyse im Detail</Link></li>
        </ul>
      </div>

      {/* FAQ */}
      <div style={sec}>
        <h2 style={h2}>Häufige Fragen zum Renditerechner</h2>
        {FAQ.map((f) => (
          <div key={f.q} style={{ marginTop: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15.5, margin: "0 0 4px" }}>{f.q}</h3>
            <p style={{ ...para, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg,#101a2e,#0D0F16)", border: `1px solid ${C.accent}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <h2 style={{ ...h2, marginBottom: 6 }}>Mehr als nur die Rendite: die volle Bewertung</h2>
        <p style={{ ...para, marginBottom: 14 }}>
          Der Renditerechner zeigt dir die Zahlen. Der kostenlose ImmoScorer bewertet ein konkretes Objekt zusätzlich
          nach Lage, Zustand, Energie und Finanzierbarkeit — mit KI-Score und Verhandlungs-Tipps, ganz ohne Account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/analysis" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            Objekt kostenlos bewerten →
          </Link>
          <Link href="/check" style={{ border: `1px solid ${C.border}`, color: C.text, fontWeight: 700, fontSize: 14, padding: "11px 18px", borderRadius: 12, textDecoration: "none" }}>
            🎤 Sprach-Check
          </Link>
        </div>
      </div>

      <p style={{ color: C.dim, fontSize: 12, lineHeight: 1.6, margin: "8px 0 0" }}>
        Der Rechner liefert eine vereinfachte Überschlagsrechnung ohne Steuern (AfA, persönlicher Steuersatz),
        Sondertilgungen, Leerstand oder Instandhaltungsstau. Er ersetzt keine individuelle Steuer-, Finanz- oder
        Anlageberatung. Beispielwerte dienen nur der Veranschaulichung.
      </p>
    </main>
  );
}
