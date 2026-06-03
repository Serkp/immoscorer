import type { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalNote, PH } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung",
  description: "Widerrufsrecht und Muster-Widerrufsformular für das ImmoScorer-Abonnement.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/widerruf" },
};

export default function WiderrufPage() {
  return (
    <article>
      <LegalH1>Widerrufsbelehrung</LegalH1>

      <LegalNote>
        ⚠️ Vorlage (Verbraucher / Fernabsatz). Bitte anwaltlich prüfen, besonders
        den Hinweis zum vorzeitigen Erlöschen bei digitalen Inhalten.
      </LegalNote>

      <LegalH2>Widerrufsrecht</LegalH2>
      <LegalP>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
        Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag
        des Vertragsschlusses.
      </LegalP>
      <LegalP>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (
        Serkan Parlak (&bdquo;Parlak Invest&ldquo;), <PH>[Straße, PLZ]</PH> Essen, E-Mail: info@parlak-invest.de) mittels
        einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder
        eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
        informieren. Sie können dafür das beigefügte Muster-Widerrufsformular
        verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der
        Widerrufsfrist genügt die rechtzeitige Absendung der Mitteilung.
      </LegalP>

      <LegalH2>Folgen des Widerrufs</LegalH2>
      <LegalP>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir
        von Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen
        ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns
        eingegangen ist.
      </LegalP>

      <LegalH2>Vorzeitiges Erlöschen des Widerrufsrechts</LegalH2>
      <LegalP>
        Bei einem Vertrag über die Bereitstellung digitaler Inhalte/Dienste erlischt
        das Widerrufsrecht, wenn Sie ausdrücklich zugestimmt haben, dass wir vor
        Ablauf der Widerrufsfrist mit der Ausführung beginnen, und Sie Ihre Kenntnis
        vom Verlust des Widerrufsrechts bestätigt haben.
      </LegalP>

      <LegalH2>Muster-Widerrufsformular</LegalH2>
      <LegalP>
        (Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses
        Formular aus und senden Sie es zurück.)
      </LegalP>
      <LegalP>
        — An Serkan Parlak (&bdquo;Parlak Invest&ldquo;), <PH>[Straße, PLZ]</PH> Essen, info@parlak-invest.de:
        <br />— Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag
        über die Erbringung der folgenden Dienstleistung: ImmoScorer Pro
        <br />— Bestellt am / erhalten am: …
        <br />— Name des/der Verbraucher(s): …
        <br />— Anschrift des/der Verbraucher(s): …
        <br />— Datum, Unterschrift (nur bei Mitteilung auf Papier): …
      </LegalP>
    </article>
  );
}
