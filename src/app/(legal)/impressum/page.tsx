import type { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalNote, PH } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von ImmoScorer.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <article>
      <LegalH1>Impressum</LegalH1>

      <LegalNote>
        ⚠️ Vorlage mit Platzhaltern. Bitte die <strong>gelb markierten</strong>{" "}
        Angaben ergänzen und das Impressum vor dem Livegang anwaltlich /
        fachkundig prüfen lassen — insbesondere wegen der
        Finanzierungsvermittlung (§ 34i GewO).
      </LegalNote>

      <LegalH2>Angaben gemäß § 5 DDG</LegalH2>
      <LegalP>
        Serkan Parlak
        <br />
        Einzelunternehmen, handelnd unter &bdquo;Parlak Invest&ldquo;
        <br />
        <PH>[Straße Hausnummer]</PH>
        <br />
        <PH>[PLZ]</PH> Essen
        <br />
        Deutschland
      </LegalP>

      <LegalH2>Vertreten durch</LegalH2>
      <LegalP>Serkan Parlak (Inhaber)</LegalP>

      <LegalH2>Kontakt</LegalH2>
      <LegalP>
        Telefon: <PH>[Telefonnummer]</PH>
        <br />
        E-Mail: info@parlak-invest.de
      </LegalP>

      <LegalH2>Umsatzsteuer-Identifikationsnummer</LegalH2>
      <LegalP>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{" "}
        <PH>[DE… — falls vorhanden]</PH>
      </LegalP>

      <LegalH2>Registereintrag</LegalH2>
      <LegalP>Einzelunternehmen — kein Eintrag im Handelsregister.</LegalP>

      <LegalH2>Berufsrechtliche Angaben</LegalH2>
      <LegalP>
        Erlaubnis als{" "}
        <strong>Immobiliardarlehensvermittler nach § 34i Abs. 1 GewO</strong> und{" "}
        <strong>Immobilienmakler nach § 34c GewO</strong>.
        <br />
        Zuständige Aufsichts-/Erlaubnisbehörde: <PH>[zuständige IHK, z. B. IHK zu Essen]</PH>
        <br />
        Vermittlerregister-Nr.: <PH>[D-W-… — siehe www.vermittlerregister.info]</PH>
        <br />
        Registerstelle: Deutscher Industrie- und Handelskammertag (DIHK e. V.),
        www.vermittlerregister.info
        <br />
        Berufsrechtliche Regelungen: §§ 34c, 34i GewO, MaBV, FinVermV (abrufbar
        unter www.gesetze-im-internet.de).
      </LegalP>

      <LegalH2>
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
      </LegalH2>
      <LegalP>Serkan Parlak (Anschrift wie oben)</LegalP>

      <LegalH2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</LegalH2>
      <LegalP>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </LegalP>

      <LegalH2>Haftung für Inhalte</LegalH2>
      <LegalP>
        Die Inhalte von ImmoScorer wurden mit größter Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte sowie der
        bereitgestellten Analysen und Scores können wir jedoch keine Gewähr
        übernehmen. ImmoScorer ist ein Analyse- und Informationswerkzeug und
        ersetzt keine individuelle Steuer-, Rechts- oder Finanzierungsberatung und
        kein Verkehrswertgutachten.
      </LegalP>
    </article>
  );
}
