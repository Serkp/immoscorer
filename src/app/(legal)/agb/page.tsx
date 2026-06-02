import type { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalNote, PH } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen für die Nutzung von ImmoScorer.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/agb" },
};

export default function AgbPage() {
  return (
    <article>
      <LegalH1>Allgemeine Geschäftsbedingungen (AGB)</LegalH1>

      <LegalNote>
        ⚠️ Vorlage. Bitte vor dem Verkauf des Pro-Abos anwaltlich prüfen lassen
        (Verbraucher-/Fernabsatzrecht, § 312 BGB).
      </LegalNote>

      <LegalH2>§ 1 Geltungsbereich &amp; Anbieter</LegalH2>
      <LegalP>
        Diese AGB gelten für die Nutzung der Web-App ImmoScorer, betrieben von{" "}
        <PH>Parlak Invest [Rechtsform, Anschrift]</PH> (&bdquo;Anbieter&ldquo;).
        Abweichende
        Bedingungen des Nutzers gelten nur bei ausdrücklicher Zustimmung.
      </LegalP>

      <LegalH2>§ 2 Leistungen</LegalH2>
      <LegalP>
        ImmoScorer stellt Werkzeuge zur Bewertung von Anlageimmobilien bereit
        (Scoring, Kennzahlen, Vergleich, Wissensinhalte). Die kostenlose Version
        ist dauerhaft nutzbar; die Pro-Version (<PH>9,99 €/Monat inkl. USt.</PH>)
        schaltet zusätzliche Funktionen frei. ImmoScorer ist ein Analyse- und
        Informationswerkzeug und ersetzt keine individuelle Steuer-, Rechts- oder
        Finanzierungsberatung und kein Verkehrswertgutachten. Eine bestimmte
        Wertentwicklung oder Finanzierungszusage wird nicht geschuldet.
      </LegalP>

      <LegalH2>§ 3 Vertragsschluss</LegalH2>
      <LegalP>
        Der Vertrag über die Pro-Version kommt zustande, indem der Nutzer den
        kostenpflichtigen Bestellvorgang über unseren Zahlungsdienstleister
        abschließt (Klick auf den als zahlungspflichtig gekennzeichneten Button).
      </LegalP>

      <LegalH2>§ 4 Preise &amp; Zahlung</LegalH2>
      <LegalP>
        Die Abrechnung erfolgt monatlich im Voraus über unseren
        Zahlungsdienstleister Stripe. Alle Preise verstehen sich inkl. gesetzlicher
        Umsatzsteuer.
      </LegalP>

      <LegalH2>§ 5 Laufzeit &amp; Kündigung</LegalH2>
      <LegalP>
        Das Pro-Abo ist monatlich und jederzeit zum Ende des laufenden
        Abrechnungszeitraums kündbar — bequem über das Kundenkonto bzw. das
        Kundenportal. Es besteht keine Mindestlaufzeit.
      </LegalP>

      <LegalH2>§ 6 Widerrufsrecht</LegalH2>
      <LegalP>
        Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten regelt
        unsere{" "}
        <a href="/widerruf" style={{ textDecoration: "underline" }}>
          Widerrufsbelehrung
        </a>
        .
      </LegalP>

      <LegalH2>§ 7 Haftung</LegalH2>
      <LegalP>
        Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit
        sowie bei Verletzung von Leben, Körper und Gesundheit. Im Übrigen haftet er
        nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den
        vertragstypischen, vorhersehbaren Schaden. Für Investitions- oder
        Finanzierungsentscheidungen des Nutzers wird keine Haftung übernommen.
      </LegalP>

      <LegalH2>§ 8 Schlussbestimmungen</LegalH2>
      <LegalP>
        Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein,
        bleibt die Wirksamkeit der übrigen unberührt.
      </LegalP>

      <LegalP>
        Stand: <PH>[Datum]</PH>
      </LegalP>
    </article>
  );
}
