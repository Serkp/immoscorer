import type { Metadata } from "next";
import { LegalH1, LegalH2, LegalP, LegalUL, LegalNote, PH } from "@/components/legal/Legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten bei ImmoScorer gemäß Art. 13 DSGVO.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <article>
      <LegalH1>Datenschutzerklärung</LegalH1>

      <LegalNote>
        ⚠️ Vorlage. Sie ist auf die tatsächlich eingesetzten Dienste abgestimmt,
        muss aber mit den finalen Anbieterdaten (gelb) ergänzt und vor dem
        Livegang anwaltlich geprüft werden. Schließen Sie mit jedem genannten
        Dienst einen Auftragsverarbeitungsvertrag (AVV, Art. 28 DSGVO) ab.
      </LegalNote>

      <LegalH2>1. Verantwortlicher</LegalH2>
      <LegalP>
        Verantwortlich für die Datenverarbeitung auf immoscorer.de ist:
        <br />
        <PH>Parlak Invest [Rechtsform]</PH>, <PH>[Straße Hausnr., PLZ Ort]</PH>,
        E-Mail: info@parlak-invest.de. Weitere Angaben im{" "}
        <a href="/impressum" style={{ textDecoration: "underline" }}>Impressum</a>.
      </LegalP>
      <LegalP>
        <PH>
          [Datenschutzbeauftragte/r: nur angeben, falls bestellt — i. d. R. erst
          ab 20 Personen ständiger Datenverarbeitung Pflicht.]
        </PH>
      </LegalP>

      <LegalH2>2. Ihre Rechte</LegalH2>
      <LegalP>
        Sie haben jederzeit das Recht auf Auskunft (Art. 15), Berichtigung
        (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21). Eine erteilte
        Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.
        Zudem haben Sie ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde.
      </LegalP>

      <LegalH2>3. Hosting (Vercel)</LegalH2>
      <LegalP>
        Die Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf werden
        technisch notwendige Server-Logdaten (IP-Adresse, Zeitpunkt, abgerufene
        Ressource, Browser/OS) verarbeitet, um Auslieferung und Sicherheit zu
        gewährleisten. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
        Interesse). Es findet eine Übermittlung in die USA statt (siehe Ziff. 11).
      </LegalP>

      <LegalH2>4. Registrierung &amp; Nutzerkonto (Supabase)</LegalH2>
      <LegalP>
        Für ein Konto verarbeiten wir Name, E-Mail-Adresse und ein
        (verschlüsseltes) Passwort über unseren Auth- und Datenbankdienst
        Supabase. Zweck: Bereitstellung des Logins und Ihrer gespeicherten
        Analysen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrag bzw.
        vorvertragliche Maßnahme).
      </LegalP>

      <LegalH2>5. Gespeicherte Analysen &amp; Portfolio (Supabase)</LegalH2>
      <LegalP>
        Wenn Sie Immobilien-Analysen oder Ihr Portfolio speichern, werden die von
        Ihnen eingegebenen Objekt- und Finanzdaten (z. B. Adresse, Kaufpreis,
        Miete, Scores) in Ihrer Datenbank gespeichert und sind nur Ihrem Konto
        zugeordnet (Row-Level-Security). Rechtsgrundlage: Art. 6 Abs. 1 lit. b
        DSGVO.
      </LegalP>

      <LegalH2>6. Finanzierungsanfragen</LegalH2>
      <LegalP>
        Wenn Sie eine Finanzierungsanfrage absenden, verarbeiten wir die
        angegebenen Daten (Vor-/Nachname, E-Mail, Telefon, Nachricht sowie ggf.
        Objektdaten), um Sie zur Finanzierung zu beraten bzw. an einen
        Finanzierungspartner (<PH>Parlak Invest</PH>) weiterzuleiten. Der Versand
        der Benachrichtigung erfolgt per E-Mail über Resend (siehe Ziff. 10).
        Rechtsgrundlage: Art. 6 Abs. 1 lit. a/b DSGVO (Ihre Einwilligung bzw.
        Anbahnung). Die Einwilligung ist freiwillig und widerrufbar.
      </LegalP>

      <LegalH2>7. Zahlungsabwicklung (Stripe)</LegalH2>
      <LegalP>
        Für das kostenpflichtige Abonnement nutzen wir Stripe Payments Europe Ltd.
        Bei einem Kauf werden Zahlungsdaten direkt bei Stripe verarbeitet; wir
        erhalten keine vollständigen Zahlungsdaten, sondern Status und
        Kunden-/Abo-Kennungen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
      </LegalP>

      <LegalH2>8. Adress- und Standortdaten (Google Maps Platform)</LegalH2>
      <LegalP>
        Zur Adress-Vervollständigung und Lage-Analyse nutzen wir die Google Maps
        Platform (Google Ireland Ltd.). Die Abfragen erfolgen serverseitig durch
        uns; es werden hierfür keine Google-Cookies in Ihrem Browser gesetzt.
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b/f DSGVO.
      </LegalP>

      <LegalH2>9. KI-gestützte Auswertungen (Anthropic &amp; OpenAI)</LegalH2>
      <LegalP>
        Für KI-Funktionen (z. B. KI-Berater, Exposé-Analyse, Strategie) werden die
        von Ihnen eingegebenen Inhalte an Anthropic und/oder OpenAI übermittelt und
        dort verarbeitet, um die Auswertung zu erstellen. Geben Sie hier keine
        nicht erforderlichen personenbezogenen Daten ein. Rechtsgrundlage: Art. 6
        Abs. 1 lit. b/f DSGVO. <PH>[Mit beiden Anbietern AVV abschließen und
        Trainings-Nutzung vertraglich ausschließen.]</PH>
      </LegalP>

      <LegalH2>10. E-Mail-Versand (Resend / Hostinger)</LegalH2>
      <LegalP>
        Transaktions- und Benachrichtigungs-E-Mails versenden wir über Resend bzw.
        unseren Mailprovider Hostinger. Verarbeitet werden die jeweilige
        E-Mail-Adresse und der Nachrichteninhalt. Rechtsgrundlage: Art. 6 Abs. 1
        lit. b/f DSGVO.
      </LegalP>

      <LegalH2>11. Cookies &amp; lokale Speicherung</LegalH2>
      <LegalP>
        Wir setzen ausschließlich technisch notwendige Speichervorgänge ein, die
        nach § 25 Abs. 2 TTDSG einwilligungsfrei sind:
      </LegalP>
      <LegalUL>
        <li>
          <strong>Login-Session</strong> (Supabase-Auth): hält Sie eingeloggt.
        </li>
        <li>
          <strong>Theme-Einstellung</strong> (Hell/Dunkel): speichert Ihre Auswahl
          im lokalen Speicher Ihres Browsers.
        </li>
      </LegalUL>
      <LegalP>
        Es findet derzeit kein Tracking und keine Werbe-/Analyse-Technologie statt.
        Sollten künftig einwilligungspflichtige Dienste hinzukommen, holen wir
        vorher Ihre Einwilligung über einen Cookie-Banner ein.
      </LegalP>

      <LegalH2>12. Drittlandübermittlung (USA)</LegalH2>
      <LegalP>
        Einige Dienste (u. a. Vercel, Stripe, OpenAI, Anthropic, Resend) können
        Daten in den USA verarbeiten. Soweit Anbieter unter dem EU-US Data Privacy
        Framework zertifiziert sind, erfolgt die Übermittlung auf dieser Grundlage;
        andernfalls auf Basis der EU-Standardvertragsklauseln (Art. 46 DSGVO).
      </LegalP>

      <LegalH2>13. Speicherdauer</LegalH2>
      <LegalP>
        Wir speichern personenbezogene Daten nur so lange, wie es für die genannten
        Zwecke erforderlich ist bzw. gesetzliche Aufbewahrungsfristen (z. B. handels-
        und steuerrechtlich) dies erfordern. Kontodaten werden mit Löschung des
        Kontos entfernt.
      </LegalP>

      <LegalP>
        Stand: <PH>[Datum der letzten Aktualisierung]</PH>
      </LegalP>
    </article>
  );
}
