/* ─── ImmoScorer Wissensbereich ─── */

export interface KnowledgeTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface KnowledgeSection {
  heading: string;
  body: string;
  table?: KnowledgeTable; // optionale Tabelle (z. B. Rechenbeispiel)
}

export interface KnowledgeFaq {
  question: string;
  answer: string;
}

export interface KnowledgeArticle {
  slug: string;
  title: string;
  summary: string;
  readMinutes: number;
  sections: KnowledgeSection[];
  tip?: string;
  faq?: KnowledgeFaq[]; // erzeugt FAQ-Block + FAQPage-Markup
  /* Optionale SEO-Felder (überschreiben Defaults; werden in Paket B befüllt) */
  seoTitle?: string;        // <title>, falls vom H1 abweichend optimiert
  metaDescription?: string; // ~140-155 Zeichen für die Google-Snippet-Beschreibung
  publishedAt?: string;     // ISO-Datum, z. B. "2026-05-15"
  updatedAt?: string;       // ISO-Datum der letzten Aktualisierung
}

export interface KnowledgeCategory {
  slug: string;
  title: string;
  description: string;
  icon: string; // SVG path
  color: string;
  articles: KnowledgeArticle[];
  metaDescription?: string; // ~130-155 Zeichen für die Google-Snippet-Beschreibung
}

export const KNOWLEDGE_BASE: KnowledgeCategory[] = [
  /* ━━━━━━━━━━━━━━━━ 1. Grundlagen ━━━━━━━━━━━━━━━━ */
  {
    slug: "grundlagen",
    title: "Grundlagen",
    description: "Basiswissen für den Einstieg in die Immobilienanlage",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    color: "#7C6AFF",
    articles: [
      {
        slug: "immobilie-als-kapitalanlage",
        title: "Immobilie als Kapitalanlage",
        seoTitle: "Immobilie als Kapitalanlage: Leitfaden für Einsteiger",
        metaDescription:
          "Immobilie als Kapitalanlage: Lohnt sich das? Voraussetzungen, Eigenkapital, Ablauf in 6 Schritten, Rendite, Finanzierung, Steuern und typische Fehler — verständlich erklärt.",
        summary:
          "Der komplette Einstieg: Lohnt sich eine Anlageimmobilie, welche Voraussetzungen brauchen Sie und wie läuft der Kauf ab?",
        readMinutes: 11,
        publishedAt: "2026-05-20",
        updatedAt: "2026-06-02",
        sections: [
          {
            heading: "Lohnt sich eine Immobilie als Kapitalanlage?",
            body: "Eine vermietete Immobilie verbindet drei Ertragsquellen: laufende **Mieteinnahmen**, **Wertsteigerung** und **Steuervorteile** (u. a. Abschreibung und Abzug der Finanzierungszinsen). Gleichzeitig hilft der **Finanzierungshebel**: Sie investieren mit relativ wenig Eigenkapital und lassen die Mieter einen Großteil des Kredits abbezahlen.\n\nDem stehen Aufwand und Risiken gegenüber — Mietausfall, Instandhaltung, Zinsänderung und eingeschränkte Verfügbarkeit des Kapitals. Als Kapitalanlage eignet sich eine Immobilie daher vor allem, wenn Sie einen langen Anlagehorizont (10+ Jahre), solide Bonität und einen Liquiditätspuffer mitbringen.",
          },
          {
            heading: "Voraussetzungen: Eigenkapital, Bonität, Zeit",
            body: "**Eigenkapital:** Idealerweise decken Sie zumindest die Kaufnebenkosten (rund 9–15 %) aus Eigenkapital, besser zusätzlich 10–20 % des Kaufpreises. Mehr Eigenkapital senkt die Rate und den Zins.\n\n**Bonität:** Die Bank prüft Einkommen, bestehende Verpflichtungen und Schufa. Ein sicheres Einkommen verbessert Zins und Beleihung deutlich.\n\n**Zeit & Nerven:** Objektsuche, Prüfung, Verwaltung und Mieterthemen kosten Zeit. Wer das nicht selbst leisten will, plant eine Hausverwaltung ein (mindert den Cashflow).",
          },
          {
            heading: "In 6 Schritten zur ersten Anlageimmobilie",
            body: "Der Weg vom Plan zum Kauf folgt fast immer demselben Muster:",
            table: {
              caption: "Typischer Ablauf eines Immobilienkaufs als Kapitalanlage",
              headers: ["Schritt", "Inhalt"],
              rows: [
                ["1. Budget & Finanzierung", "Eigenkapital klären, Finanzierungsrahmen von der Bank bestätigen lassen"],
                ["2. Objektsuche", "Lage, Zustand, Mietniveau prüfen — mehrere Objekte vergleichen"],
                ["3. Bewertung", "Rendite, Kaufpreisfaktor, Cashflow und Finanzierbarkeit berechnen"],
                ["4. Finanzierung sichern", "Angebote vergleichen, Zinsbindung und Tilgung festlegen"],
                ["5. Notartermin & Kauf", "Kaufvertrag, Grundbucheintrag, Kaufnebenkosten zahlen"],
                ["6. Vermietung & Verwaltung", "Mieter, Mietvertrag, Nebenkostenabrechnung, Instandhaltung"],
              ],
            },
          },
          {
            heading: "Die wichtigsten Kennzahlen",
            body: "Bevor Sie kaufen, sollten Sie jedes Objekt durchrechnen: **Bruttorendite** (Jahreskaltmiete ÷ Kaufpreis), **Nettorendite** (nach allen Kosten), **Kaufpreisfaktor** und der monatliche **Cashflow**. Diese Zahlen entscheiden, ob sich die Anlage trägt — nicht das Bauchgefühl. ImmoScorer berechnet sie automatisch und ergänzt einen Finanzierbarkeits-Score.",
          },
          {
            heading: "Finanzierung & Steuern in Kürze",
            body: "**Finanzierung:** Üblich ist ein Annuitätendarlehen mit fester Zinsbindung (häufig 10–15 Jahre) und 2–3 % Anfangstilgung. Plus: Kaufnebenkosten sollten möglichst aus Eigenkapital kommen.\n\n**Steuern:** Bei Vermietung sind Finanzierungszinsen, Verwaltung, Instandhaltung und die **AfA** (Gebäudeabschreibung, meist 2–3 %/Jahr) als Werbungskosten absetzbar. Das senkt die Steuerlast und verbessert den Cashflow nach Steuern. Nach 10 Jahren Haltedauer ist ein Verkaufsgewinn in der Regel steuerfrei (Spekulationsfrist).",
          },
          {
            heading: "Risiken & typische Anfängerfehler",
            body: "Die häufigsten Fehler: **zu teuer kaufen** (zu hoher Kaufpreisfaktor), **Kaufnebenkosten unterschätzen**, **keinen Puffer** für Reparaturen/Leerstand einplanen, die **Lage** zugunsten der Rendite ignorieren und die Finanzierung **zu knapp** kalkulieren (kein Zinsänderungs-Szenario). Wer diese Punkte sauber durchrechnet, vermeidet die meisten Verlustfallen.",
          },
        ],
        tip: "Rechnen Sie vor dem ersten Kauf zwei, drei Objekte komplett durch — inklusive Kaufnebenkosten und einem Szenario mit 1–2 Prozentpunkten höheren Zinsen. So sehen Sie sofort, welches Objekt auch bei der Anschlussfinanzierung trägt.",
        faq: [
          {
            question: "Wie viel Eigenkapital brauche ich für eine Anlageimmobilie?",
            answer:
              "Als Faustregel sollten Sie mindestens die Kaufnebenkosten (rund 9–15 % des Kaufpreises) aus Eigenkapital bezahlen, besser zusätzlich 10–20 % des Kaufpreises. Eine Vollfinanzierung ist möglich, aber teurer und riskanter.",
          },
          {
            question: "Lohnt sich eine Immobilie als Kapitalanlage bei hohen Zinsen?",
            answer:
              "Auch bei höheren Zinsen kann es sich lohnen, wenn Mietrendite und Lage stimmen und der Cashflow trägt. Wichtig ist, mit dem aktuellen Zins zu rechnen — nicht mit Wunschwerten — und einen Puffer einzuplanen.",
          },
          {
            question: "Was ist eine realistische Rendite?",
            answer:
              "Bruttorenditen liegen je nach Lage zwischen etwa 3 % (Top-Städte) und 7 % (B-/C-Lagen). Entscheidend ist die Nettorendite nach allen Kosten und der Cashflow nach Finanzierung.",
          },
          {
            question: "Selbst verwalten oder Hausverwaltung?",
            answer:
              "Eine Hausverwaltung kostet meist 20–35 € pro Einheit und Monat und mindert den Cashflow, spart aber Zeit und Aufwand. Bei einer einzelnen Wohnung verwalten viele Anleger zunächst selbst.",
          },
          {
            question: "Wann ist der Verkaufsgewinn steuerfrei?",
            answer:
              "Bei vermieteten Immobilien ist der Veräußerungsgewinn in der Regel nach Ablauf der 10-jährigen Spekulationsfrist steuerfrei. Vorher fällt auf den Gewinn Einkommensteuer an.",
          },
        ],
      },
      {
        slug: "score-verstehen",
        title: "Den ImmoScorer Score verstehen",
        summary: "Wie der Gesamtscore aus sechs Teilfaktoren berechnet wird und was er aussagt.",
        readMinutes: 5,
        sections: [
          {
            heading: "Was ist der ImmoScorer Score?",
            body: "Der ImmoScorer Gesamtscore ist eine Kennzahl von 0 bis 100, die die Attraktivität einer Immobilie als Kapitalanlage abbildet. Er fasst sechs fundamentale Bewertungsdimensionen in einem einzigen Wert zusammen und ermöglicht damit einen schnellen, objektiven Vergleich verschiedener Objekte.",
          },
          {
            heading: "Die sechs Bewertungsfaktoren",
            body: "Der Score setzt sich aus folgenden gewichteten Teilscores zusammen:\n\n• Rendite (25 %): Bruttorendite, Kaufpreisfaktor und Mietmultiplikator im Verhältnis zum lokalen Markt.\n• Lage (20 %): Standortqualität basierend auf Einwohnerentwicklung, Infrastruktur, Kaufkraft und Arbeitsmarkt.\n• Substanz (20 %): Bauzustand, Alter, Sanierungsbedarf und Restnutzungsdauer des Gebäudes.\n• Energie (15 %): Energieeffizienzklasse, Heizungsart und erwartbare Energiekosten bzw. Nachrüstpflichten.\n• Cashflow (10 %): Monatlicher Überschuss nach Abzug von Kreditrate, Hausgeld, Verwaltung und Instandhaltung.\n• Wertsteigerungspotenzial (10 %): Prognose der Wertentwicklung basierend auf Markttrends, Stadtentwicklung und Sanierungspotenzial.",
          },
          {
            heading: "Score-Bereiche und ihre Bedeutung",
            body: "Ab 80 Punkten gilt eine Immobilie als sehr gutes Investment mit überdurchschnittlichem Rendite-Risiko-Profil. Der Bereich 65–79 signalisiert ein gutes Objekt mit leichtem Optimierungsbedarf. Scores zwischen 50 und 64 weisen auf ein moderates Investment hin – hier lohnt sich eine genauere Prüfung einzelner Faktoren. Unter 50 Punkten ist Vorsicht geboten: Entweder ist der Kaufpreis zu hoch, oder es bestehen strukturelle Risiken wie hoher Sanierungsbedarf oder ungünstige Lage.",
          },
          {
            heading: "Teilscores gezielt verbessern",
            body: "Analysieren Sie die einzelnen Teilscores, um gezielt Hebel zu finden. Ein niedriger Rendite-Score bei guter Lage kann auf einen zu hohen Kaufpreis hinweisen – verhandeln Sie. Ein schwacher Energie-Score lässt sich durch eine energetische Sanierung deutlich verbessern, was gleichzeitig die Vermietbarkeit steigert. Der Cashflow-Score verbessert sich durch höheres Eigenkapital oder günstigere Finanzierungskonditionen.",
          },
        ],
        tip: "Nutzen Sie den Vergleich, um mehrere Objekte nebeneinander zu bewerten. Oft zeigt erst der direkte Vergleich, welches Objekt das beste Gesamtpaket bietet.",
      },
      {
        slug: "erste-immobilie",
        title: "Die erste Immobilie als Kapitalanlage",
        summary: "Schritt-für-Schritt-Anleitung vom Eigenkapitalaufbau bis zur Schlüsselübergabe.",
        readMinutes: 8,
        sections: [
          {
            heading: "Eigenkapital und Bonität vorbereiten",
            body: "Für Ihre erste Kapitalanlage-Immobilie sollten Sie mindestens die Kaufnebenkosten (10–15 % des Kaufpreises) als Eigenkapital mitbringen. Die Kaufnebenkosten setzen sich zusammen aus Grunderwerbsteuer (3,5–6,5 % je nach Bundesland), Notar- und Grundbuchkosten (~2 %) und ggf. Maklerprovision (3,57–7,14 %). Darüber hinaus stärkt ein Eigenkapitalanteil von 20–30 % Ihre Verhandlungsposition und senkt die monatliche Kreditrate.",
          },
          {
            heading: "Objektsuche und Marktanalyse",
            body: "Definieren Sie zunächst Ihre Suchkriterien: Standort, Größe, Zustand, Budget. Analysieren Sie den lokalen Mietmarkt anhand von Mietspiegeln und Vergleichsmieten. Achten Sie auf Leerstandsquoten – in B- und C-Städten liegen die Renditen oft höher als in A-Städten, bei akzeptablem Risiko. Prüfen Sie den Bebauungsplan für mögliche Nachverdichtung und die Stadtentwicklungspläne für geplante Infrastrukturprojekte (Nahverkehr, Universitäten, Gewerbegebiete).",
          },
          {
            heading: "Due Diligence: Objekt gründlich prüfen",
            body: "Vor dem Kauf sollten Sie folgende Unterlagen prüfen: Grundbuchauszug (Lasten, Rechte Dritter), Teilungserklärung und Gemeinschaftsordnung bei Eigentumswohnungen, Protokolle der letzten 3 Eigentümerversammlungen, Wirtschaftsplan und Hausgeldabrechnung, Energieausweis, Mietvertrag und Miethistorie. Lassen Sie bei älteren Objekten einen Bausachverständigen den Zustand prüfen – 300–500 € Gutachterkosten können Sie vor Überraschungen im fünfstelligen Bereich schützen.",
          },
          {
            heading: "Finanzierung strukturieren",
            body: "Holen Sie Angebote von mindestens drei Banken ein und vergleichen Sie nicht nur den Zinssatz, sondern auch Sondertilgungsrecht, Tilgungssatz und Zinsbindungsdauer. Eine Zinsbindung von 15–20 Jahren gibt Planungssicherheit. Vereinbaren Sie mindestens 5 % Sondertilgung p.a. Die anfängliche Tilgung sollte bei mindestens 2 % liegen, besser 3 %, um innerhalb von 25–30 Jahren schuldenfrei zu sein.",
          },
          {
            heading: "Kaufprozess und erste Schritte",
            body: "Nach Einigung mit dem Verkäufer beauftragt in der Regel der Käufer den Notar. Der Kaufvertragsentwurf muss Ihnen mindestens 14 Tage vor dem Beurkundungstermin vorliegen. Nach der Beurkundung erhalten Sie eine Auflassungsvormerkung im Grundbuch, die Ihr Recht absichert. Nach Zahlung des Kaufpreises erfolgt die Eigentumsumschreibung. Informieren Sie die Hausverwaltung, schließen Sie eine Gebäudeversicherung ab und beginnen Sie zeitnah mit eventuellen Renovierungsarbeiten.",
          },
        ],
        tip: "Starten Sie konservativ mit einer kleinen Eigentumswohnung in guter Lage. Der Lerneffekt bei der ersten Immobilie ist enorm – bei der zweiten und dritten werden Sie deutlich sicherer und schneller handeln.",
      },
      {
        slug: "immobilienarten",
        title: "Welche Immobilienarten gibt es?",
        summary: "ETW, MFH, Gewerbe, Neubau – Vor- und Nachteile für Kapitalanleger.",
        readMinutes: 6,
        sections: [
          {
            heading: "Eigentumswohnung (ETW)",
            body: "Die Eigentumswohnung ist der klassische Einstieg für Kapitalanleger. Vorteile: Geringer Kapitalbedarf (ab ca. 50.000–100.000 €), einfache Verwaltung über WEG-Hausverwaltung, gute Vermietbarkeit. Nachteile: Eingeschränkte Entscheidungsfreiheit (WEG-Beschlüsse), Hausgeld als laufende Kosten, begrenzte Renditepotenziale bei kleinen Einheiten. Achten Sie auf die Höhe der Instandhaltungsrücklage – sie sollte mindestens 7–10 €/m²/Jahr betragen.",
          },
          {
            heading: "Mehrfamilienhaus (MFH)",
            body: "Mehrfamilienhäuser bieten Skaleneffekte: Eine Verwaltung, ein Dach, ein Grundstück – aber mehrere Mieteinnahmen. Renditen liegen oft 1–2 Prozentpunkte über vergleichbaren ETWs. Dafür ist der Kapitalbedarf deutlich höher und das Klumpenrisiko größer. MFH lohnen sich besonders in B- und C-Lagen mit stabiler Nachfrage. Bei der Finanzierung achten auf den Beleihungswert: Banken bewerten MFH nach dem Ertragswertverfahren.",
          },
          {
            heading: "Gewerbeimmobilien",
            body: "Büros, Einzelhandel, Praxen und Lager bieten oft höhere Renditen (6–10 %), sind aber konjunkturanfälliger. Gewerbemietverträge laufen meist 5–10 Jahre und bieten Indexierung, jedoch ist das Nachvermietungsrisiko bei Leerstand erheblich. Gewerbe eignet sich für erfahrene Investoren, die den lokalen Markt gut kennen.",
          },
          {
            heading: "Neubau vs. Bestand",
            body: "Neubau bietet moderne Standards, niedrige Instandhaltung und KfW-Effizienzhaus-Förderung, hat aber hohe Kaufpreise und geringe Anfangsrenditen (oft unter 3 %). Bestandsimmobilien ermöglichen höhere Renditen und Wertsteigerung durch Sanierung, erfordern aber genaue Prüfung des baulichen Zustands. Denkmalschutz-Objekte bieten steuerliche Vorteile (§ 7h/7i EStG), haben aber strenge Auflagen.",
          },
        ],
        tip: "Für den Einstieg empfehlen wir eine Bestandswohnung in B-Lage mit leichtem Modernisierungsbedarf. So kombinieren Sie akzeptable Rendite mit überschaubarem Risiko und lernen dabei das Handwerk.",
      },
    ],
  },

  /* ━━━━━━━━━━━━━━━━ 2. Kennzahlen ━━━━━━━━━━━━━━━━ */
  {
    slug: "kennzahlen",
    title: "Kennzahlen & Bewertung",
    description: "Die wichtigsten Zahlen für fundierte Investitionsentscheidungen",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
    color: "#4C9AFF",
    articles: [
      {
        slug: "rendite-berechnen",
        title: "Rendite richtig berechnen",
        seoTitle: "Immobilienrendite berechnen: Brutto, Netto & Eigenkapital",
        metaDescription:
          "Immobilienrendite berechnen: Bruttorendite, Nettorendite und Eigenkapitalrendite mit Formeln, Rechenbeispiel und Richtwerten für A-, B- und C-Lagen.",
        summary:
          "Brutto, Netto, Eigenkapitalrendite – welche Kennzahl wann relevant ist, mit Formeln und durchgerechnetem Beispiel.",
        readMinutes: 9,
        publishedAt: "2026-05-15",
        updatedAt: "2026-06-02",
        sections: [
          {
            heading: "Warum die Rendite über Gewinn oder Verlust entscheidet",
            body: "Die Rendite ist die wichtigste Kennzahl bei jeder Kapitalanlage-Immobilie – sie sagt Ihnen, wie viel Ihr eingesetztes Geld tatsächlich erwirtschaftet. Doch \"die\" Rendite gibt es nicht: Je nachdem, welche Kosten Sie einrechnen, ergeben sich sehr unterschiedliche Werte. Wer nur auf die Bruttorendite im Exposé schaut, überschätzt die Wirtschaftlichkeit fast immer deutlich.\n\nIn diesem Artikel lernen Sie die drei entscheidenden Renditekennzahlen kennen – **Bruttorendite**, **Nettorendite** und **Eigenkapitalrendite** – inklusive Formeln, Richtwerten und einer vollständig durchgerechneten Beispielimmobilie.",
          },
          {
            heading: "Bruttorendite: der schnelle Filter",
            body: "Die Bruttorendite ist der schnellste Indikator, um Objekte vorzusortieren:\n\n**Bruttorendite = (Jahreskaltmiete ÷ Kaufpreis) × 100**\n\nSie eignet sich, um aus vielen Inseraten die interessanten herauszufiltern, berücksichtigt aber weder Kaufnebenkosten noch laufende Bewirtschaftungskosten – die reale Rendite liegt also immer darunter. Als grobe Orientierung gilt: Liegt die Bruttorendite unter 4 %, muss das Objekt außergewöhnliche Lagequalität oder klares Wertsteigerungspotenzial bieten, damit sich die Investition trägt.",
          },
          {
            heading: "Nettorendite: die ehrliche Kennzahl",
            body: "Die Nettorendite bezieht alle Kosten ein und ist damit die belastbarere Größe:\n\n**Nettorendite = ((Jahreskaltmiete − nicht umlagefähige Bewirtschaftungskosten) ÷ (Kaufpreis + Kaufnebenkosten)) × 100**\n\nZu den nicht umlagefähigen Kosten zählen vor allem: nicht umlagefähiges Hausgeld, Instandhaltungsrücklage, Verwaltungskosten und ein Mietausfallwagnis (üblich 2–4 % der Kaltmiete). Die Kaufnebenkosten (Grunderwerbsteuer, Notar, Grundbuch, ggf. Makler) liegen je nach Bundesland bei rund 9–15 % des Kaufpreises. In der Praxis liegt die Nettorendite typischerweise **1,5 bis 2,5 Prozentpunkte** unter der Bruttorendite.",
          },
          {
            heading: "Eigenkapitalrendite: der Hebeleffekt der Finanzierung",
            body: "Die Eigenkapitalrendite zeigt, was Ihr tatsächlich eingesetztes Geld erwirtschaftet – und damit den Hebeleffekt (Leverage) der Bank-Finanzierung:\n\n**Eigenkapitalrendite = (Jahresreinertrag nach Kapitaldienst ÷ eingesetztes Eigenkapital) × 100**\n\nWeil ein großer Teil des Kaufpreises über das Darlehen finanziert wird, kann die Eigenkapitalrendite deutlich über der Objektrendite liegen – bei moderatem Eigenkapital und solider Mietrendite sind zweistellige Werte möglich. **Achtung:** Der Hebel wirkt in beide Richtungen. Steigen die Zinsen bei der Anschlussfinanzierung oder fallen die Mieten, kann die Eigenkapitalrendite schnell negativ werden. Kalkulieren Sie deshalb immer auch ein Szenario mit höheren Zinsen.",
          },
          {
            heading: "Kaufpreisfaktor & Mietmultiplikator",
            body: "Der Kaufpreisfaktor verdichtet die Bewertung auf eine einzige Zahl:\n\n**Kaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete**\n\nEr sagt, wie viele Jahreskaltmieten der Kaufpreis entspricht – und ist der Kehrwert der Bruttorendite. Je niedriger der Faktor, desto schneller hat sich der Kaufpreis über die Mieten amortisiert. Die folgenden Orientierungswerte helfen bei der Einordnung (Stand 2026):",
            table: {
              caption: "Orientierungswerte Kaufpreisfaktor & Bruttorendite nach Lage",
              headers: ["Lage", "Kaufpreisfaktor", "Bruttorendite", "Einordnung"],
              rows: [
                ["A-Städte (München, Hamburg, Frankfurt)", "28–35", "3–4 %", "teuer, auf Wertsteigerung gesetzt"],
                ["B-Städte (Leipzig, Dresden, Nürnberg)", "22–28", "4–5 %", "marktüblich"],
                ["C-Städte & ländlicher Raum", "15–22", "5–8 %", "günstig, höheres Risiko"],
              ],
            },
          },
          {
            heading: "Rechenbeispiel: Eigentumswohnung Schritt für Schritt",
            body: "So sieht eine realistische Rechnung für eine vermietete 70-m²-Eigentumswohnung aus. Die Bewirtschaftungskosten setzen sich hier zusammen aus Verwaltung (360 €), Instandhaltungsrücklage (rund 670 €), Mietausfallwagnis (3 %, rund 310 €) und nicht umlagefähigem Hausgeld (rund 480 €).",
            table: {
              caption: "Beispiel: 70-m²-Wohnung, Kaufpreis 250.000 €, Kaltmiete 850 €/Monat",
              headers: ["Position", "Wert"],
              rows: [
                ["Kaufpreis", "250.000 €"],
                ["Kaufnebenkosten (ca. 12 %)", "30.000 €"],
                ["Gesamtinvestition", "280.000 €"],
                ["Jahreskaltmiete (850 € × 12)", "10.200 €"],
                ["Bruttorendite (10.200 ÷ 250.000)", "4,08 %"],
                ["− Bewirtschaftungskosten / Jahr", "1.820 €"],
                ["Jahresreinertrag", "8.380 €"],
                ["Nettorendite (8.380 ÷ 280.000)", "2,99 %"],
                ["Kaufpreisfaktor (250.000 ÷ 10.200)", "24,5"],
              ],
            },
          },
        ],
        tip: "Berechnen Sie für jedes Objekt immer alle drei Renditekennzahlen. Die Bruttorendite filtert, die Nettorendite bewertet die echte Wirtschaftlichkeit und die Eigenkapitalrendite zeigt den wahren Vermögensaufbau. ImmoScorer übernimmt diese Rechnung automatisch – inklusive Kaufnebenkosten je Bundesland.",
        faq: [
          {
            question: "Was ist eine gute Bruttorendite bei einer Immobilie?",
            answer:
              "Als Faustregel gilt: ab etwa 4–5 % Bruttorendite wird eine vermietete Wohnung in einer soliden Lage interessant. In gefragten A-Städten sind 3–4 % marktüblich (hier zählt vor allem die Wertsteigerung), in B- und C-Lagen sind 5–8 % möglich, allerdings mit höherem Vermietungsrisiko. Entscheidend ist immer das Verhältnis von Rendite zu Lage und Zustand.",
          },
          {
            question: "Brutto- oder Nettorendite – welche zählt wirklich?",
            answer:
              "Die Bruttorendite eignet sich nur zum schnellen Vorfiltern. Für die echte Kaufentscheidung zählt die Nettorendite, weil sie Kaufnebenkosten und laufende Bewirtschaftungskosten einrechnet. Sie liegt meist 1,5–2,5 Prozentpunkte unter der Bruttorendite.",
          },
          {
            question: "Wie berechne ich die Eigenkapitalrendite?",
            answer:
              "Eigenkapitalrendite = (Jahresreinertrag nach Kapitaldienst ÷ eingesetztes Eigenkapital) × 100. Sie misst die Verzinsung Ihres tatsächlich eingesetzten Geldes. Durch den Finanzierungshebel kann sie deutlich über der Objektrendite liegen – steigt aber auch das Risiko bei höheren Zinsen.",
          },
          {
            question: "Welcher Kaufpreisfaktor ist noch akzeptabel?",
            answer:
              "Ein Kaufpreisfaktor unter 22 gilt als günstig, 22–28 als marktüblich und über 28 als teuer. In Top-Lagen werden teils Faktoren über 30 bezahlt – das rechnet sich nur mit überdurchschnittlicher Wertsteigerung.",
          },
          {
            question: "Lohnt sich eine Immobilie mit negativem Cashflow?",
            answer:
              "Das kann sinnvoll sein, wenn eine hohe Wertsteigerung erwartet wird oder steuerliche Effekte (AfA, Zinsabzug) den Fehlbetrag ausgleichen. Ein dauerhaft negativer Cashflow ohne diese Perspektive ist jedoch ein Warnsignal – Sie zahlen dann jeden Monat aus eigener Tasche dazu.",
          },
        ],
      },
      {
        slug: "cashflow-analyse",
        title: "Cashflow-Analyse im Detail",
        summary: "Monatlichen Überschuss berechnen und Liquiditätsengpässe vermeiden.",
        readMinutes: 5,
        sections: [
          {
            heading: "Was ist der Cashflow?",
            body: "Der Cashflow einer Immobilie ist der monatliche Überschuss (oder Fehlbetrag) nach Abzug aller Kosten von den Mieteinnahmen. Ein positiver Cashflow bedeutet, dass die Immobilie sich selbst trägt und Gewinn erwirtschaftet. Ein negativer Cashflow erfordert monatliche Zuschüsse aus Ihrem Einkommen.",
          },
          {
            heading: "Cashflow-Berechnung Schritt für Schritt",
            body: "1. Kaltmiete pro Monat\n2. Abzüglich nicht-umlagefähiges Hausgeld (ca. 2–4 €/m²)\n3. Abzüglich Verwaltungskosten (ca. 25–35 €/Einheit/Monat)\n4. Abzüglich Instandhaltungsrücklage (ca. 0,50–1,50 €/m²/Monat)\n5. Abzüglich Mietausfallwagnis (2–4 % der Kaltmiete)\n6. Abzüglich Kreditrate (Zins + Tilgung)\n7. Ergebnis = Monatlicher Cashflow vor Steuern\n\nBeispiel: 70 m² Wohnung, 700 € Kaltmiete, 150 € Hausgeld (nicht-umlagefähig), 30 € Verwaltung, 70 € Rücklage, 21 € Mietausfallwagnis, 380 € Kreditrate = 49 € positiver Cashflow.",
          },
          {
            heading: "Cashflow-Optimierung",
            body: "Stellschrauben für besseren Cashflow: Höheres Eigenkapital senkt die Kreditrate. Längere Zinsbindung gibt Sicherheit gegen steigende Zinsen. Mietanpassung nach Mietspiegel nutzen. Betriebskostenoptimierung (Versicherungen vergleichen, Hausgeld prüfen). Modernisierungen, die Mieterhöhungen rechtfertigen (z. B. neues Bad, Balkon). Berücksichtigen Sie steuerliche Effekte: Zinsen und AfA reduzieren Ihre Steuerlast, was den Cashflow nach Steuern verbessert.",
          },
        ],
        tip: "Planen Sie immer einen Liquiditätspuffer von 3–6 Monatsmieten ein. Unerwartete Reparaturen, Mieterwechsel oder Leerstand können den Cashflow vorübergehend belasten.",
      },
      {
        slug: "lage-bewerten",
        title: "Standort und Lage bewerten",
        summary: "Von der Makrolage bis zum Mikro-Standort: worauf es wirklich ankommt.",
        readMinutes: 7,
        sections: [
          {
            heading: "Makrolage: Die Stadt",
            body: "Die Makrolage beschreibt die wirtschaftliche Stärke der Region. Relevante Faktoren: Bevölkerungsentwicklung (wächst die Stadt?), Arbeitsmarkt und Branchenmix, Kaufkraftindex, Hochschulen und Forschungseinrichtungen, geplante Infrastrukturprojekte. Städte mit Universitäten, diversifizierter Wirtschaft und positiver Zuwanderung bieten die beste Grundlage für langfristige Wertsteigerung.",
          },
          {
            heading: "Mikrolage: Das Viertel",
            body: "Die Mikrolage entscheidet über Vermietbarkeit und Mietpreis. Bewerten Sie: ÖPNV-Anbindung (< 500 m zur Haltestelle ideal), Einkaufsmöglichkeiten, Schulen und Kitas, Grünflächen und Naherholung, Lärmbelastung (Straße, Flughafen, Schiene), Sozialstruktur und Sicherheit. Eine gute Mikrolage in einer schwächeren Makrolage kann besser sein als eine schlechte Mikrolage in einer Top-Stadt.",
          },
          {
            heading: "Lageklassen A bis D",
            body: "A-Lage: Innerstädtische Top-Lagen in Großstädten. Höchste Preise, niedrigste Renditen (3–4 %), aber maximale Sicherheit und Wertstabilität. Ideal für konservative Investoren.\n\nB-Lage: Gute Wohnlagen mit solider Infrastruktur. Renditen 4–6 %, bestes Verhältnis von Risiko zu Ertrag. Ideal für Buy & Hold.\n\nC-Lage: Randlagen oder aufstrebende Viertel. Renditen 5–8 %, höheres Leerstandsrisiko, aber Wertsteigerungspotenzial bei positiver Entwicklung.\n\nD-Lage: Strukturschwache Gebiete. Renditen 8–12 %, aber hohes Leerstandsrisiko und schwierige Verkäuflichkeit. Nur für erfahrene Investoren.",
          },
          {
            heading: "Lageentwicklung erkennen",
            body: "Achten Sie auf Aufwertungsindikatoren: Neue Gastronomie und Einzelhandel, Bautätigkeit und Neubauprojekte, steigende Angebotsmieten, Zuzug junger Berufstätiger, geplante Verkehrsprojekte (neue U-Bahn-Station, Straßenbahn). Gentrifizierung erkennt man oft 3–5 Jahre bevor sie sich in den Kaufpreisen widerspiegelt. Lokale Zeitungen und Stadtratsbeschlüsse sind wertvolle Informationsquellen.",
          },
        ],
        tip: "Fahren Sie immer persönlich zum Objekt – und zwar zu verschiedenen Tageszeiten. Samstagnachmittag und Dienstagabend zeigen ein ganz anderes Bild als die Besichtigung am Montagvormittag.",
      },
    ],
  },

  /* ━━━━━━━━━━━━━━━━ 3. Finanzierung ━━━━━━━━━━━━━━━━ */
  {
    slug: "finanzierung",
    title: "Finanzierung & Steuern",
    description: "Finanzierungsstrategien, Steuervorteile und Fördermittel optimal nutzen",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#34D399",
    articles: [
      {
        slug: "kaufnebenkosten",
        title: "Kaufnebenkosten beim Immobilienkauf",
        seoTitle: "Kaufnebenkosten beim Immobilienkauf: Übersicht & Beispiel",
        metaDescription:
          "Kaufnebenkosten beim Immobilienkauf: Grunderwerbsteuer nach Bundesland, Notar, Grundbuch und Makler — wie hoch sie sind, ein Rechenbeispiel und wie Sie sie senken.",
        summary:
          "Grunderwerbsteuer, Notar, Grundbuch, Makler: Welche Nebenkosten beim Kauf anfallen, wie hoch sie sind und wie Sie sie optimieren.",
        readMinutes: 8,
        publishedAt: "2026-05-20",
        updatedAt: "2026-06-02",
        sections: [
          {
            heading: "Was sind Kaufnebenkosten?",
            body: "Kaufnebenkosten sind die Kosten, die **zusätzlich zum Kaufpreis** beim Immobilienkauf anfallen. Sie betragen je nach Bundesland und Maklereinsatz rund **9–15 % des Kaufpreises** und müssen in der Regel aus **Eigenkapital** bezahlt werden — Banken finanzieren sie meist nicht mit. Wer sie unterschätzt, hat eine Finanzierungslücke. Die vier großen Posten sind Grunderwerbsteuer, Notar, Grundbuch und ggf. Maklerprovision.",
          },
          {
            heading: "Die einzelnen Posten",
            body: "**Grunderwerbsteuer:** 3,5–6,5 % des Kaufpreises, je nach Bundesland (siehe Tabelle) — der größte Posten.\n\n**Notar:** ca. **1,0–1,5 %** für Beurkundung des Kaufvertrags und Abwicklung (gesetzlich geregelt).\n\n**Grundbuch:** ca. **0,5 %** für Eigentumsumschreibung und Eintragung der Grundschuld.\n\n**Maklerprovision:** falls ein Makler beteiligt ist, meist **3,57 % inkl. USt** für den Käufer (seit 2020 wird die Provision i. d. R. zwischen Käufer und Verkäufer geteilt).",
          },
          {
            heading: "Grunderwerbsteuer nach Bundesland",
            body: "Die Grunderwerbsteuer ist Ländersache und unterscheidet sich deutlich. Richtwerte (Satz bitte tagesaktuell prüfen, da die Länder ihn ändern können):",
            table: {
              caption: "Grunderwerbsteuersätze nach Bundesland (Richtwerte — bitte aktuell prüfen)",
              headers: ["Bundesland", "Satz"],
              rows: [
                ["Bayern", "3,5 %"],
                ["Sachsen", "5,5 %"],
                ["Baden-Württemberg, Bremen, Niedersachsen, Rheinland-Pfalz, Sachsen-Anhalt, Thüringen", "5,0 %"],
                ["Hamburg", "5,5 %"],
                ["Berlin, Hessen, Mecklenburg-Vorpommern", "6,0 %"],
                ["Brandenburg, NRW, Saarland, Schleswig-Holstein", "6,5 %"],
              ],
            },
          },
          {
            heading: "Rechenbeispiel",
            body: "So summieren sich die Nebenkosten bei einem Kaufpreis von 300.000 € (Beispiel NRW, mit Makler):",
            table: {
              caption: "Beispiel: Kaufpreis 300.000 € in NRW (mit Makler)",
              headers: ["Position", "Satz", "Betrag"],
              rows: [
                ["Grunderwerbsteuer", "6,5 %", "19.500 €"],
                ["Notar", "1,5 %", "4.500 €"],
                ["Grundbuch", "0,5 %", "1.500 €"],
                ["Maklerprovision", "3,57 %", "10.710 €"],
                ["Kaufnebenkosten gesamt", "≈ 12,1 %", "36.210 €"],
                ["Gesamtkosten", "—", "336.210 €"],
              ],
            },
          },
          {
            heading: "Kaufnebenkosten senken & steuerlich nutzen",
            body: "**Senken:** ohne Makler kaufen (Direktkauf/Bauträger), bewegliches Inventar (Einbauküche, Möbel) separat ausweisen — darauf fällt keine Grunderwerbsteuer an. **Steuerlich:** Bei vermieteten Objekten sind Notar- und Grundbuchkosten, die auf die **Finanzierung** (Grundschuld) entfallen, sofort absetzbar; die übrigen Nebenkosten erhöhen die Anschaffungskosten und werden über die **AfA** mit abgeschrieben. Die Grunderwerbsteuer selbst zählt zu den Anschaffungskosten.",
          },
        ],
        tip: "Planen Sie die Kaufnebenkosten von Anfang an als Eigenkapital ein — sonst entsteht eine Finanzierungslücke. Bei einer 300.000-€-Wohnung sind das schnell über 35.000 €.",
        faq: [
          {
            question: "Wie hoch sind die Kaufnebenkosten in Prozent?",
            answer:
              "Insgesamt etwa 9–15 % des Kaufpreises: Grunderwerbsteuer (3,5–6,5 %), Notar (ca. 1,0–1,5 %), Grundbuch (ca. 0,5 %) und — falls beteiligt — Maklerprovision (oft 3,57 % inkl. USt für den Käufer).",
          },
          {
            question: "Werden die Kaufnebenkosten von der Bank mitfinanziert?",
            answer:
              "In der Regel nicht. Banken erwarten, dass die Kaufnebenkosten aus Eigenkapital bezahlt werden. Eine Mitfinanzierung ist möglich, aber teurer und nicht immer machbar.",
          },
          {
            question: "Wo ist die Grunderwerbsteuer am niedrigsten?",
            answer:
              "Am niedrigsten in Bayern mit 3,5 %. Am höchsten mit 6,5 % in Brandenburg, NRW, dem Saarland und Schleswig-Holstein. Die Sätze können sich ändern — vor dem Kauf den aktuellen Satz prüfen.",
          },
          {
            question: "Kann ich Kaufnebenkosten steuerlich absetzen?",
            answer:
              "Bei Vermietung teilweise: Kosten rund um die Grundschuld/Finanzierung sind sofort abziehbar, die übrigen Nebenkosten erhöhen die Anschaffungskosten und werden über die AfA abgeschrieben. Bei Eigennutzung sind sie nicht absetzbar.",
          },
        ],
      },
      {
        slug: "finanzierung-strukturieren",
        title: "Immobilienfinanzierung richtig strukturieren",
        summary: "Zinsbindung, Tilgung, Sondertilgung – die optimale Kreditstruktur.",
        readMinutes: 7,
        sections: [
          {
            heading: "Die richtige Zinsbindung wählen",
            body: "Die Zinsbindung bestimmt, wie lange Ihr Zinssatz garantiert bleibt. Kurze Bindung (5–10 Jahre) bietet niedrigere Zinsen, aber Prolongationsrisiko. Lange Bindung (15–20 Jahre) kostet etwas mehr, gibt aber Planungssicherheit. Bei Kapitalanlage-Immobilien empfehlen wir 15 Jahre Zinsbindung als guten Kompromiss. Nach 10 Jahren können Sie laut § 489 BGB jederzeit mit 6 Monaten Frist kündigen – unabhängig von der vereinbarten Zinsbindung.",
          },
          {
            heading: "Tilgung und Sondertilgung",
            body: "Die anfängliche Tilgung bestimmt die Gesamtlaufzeit des Darlehens. Bei 2 % Tilgung und 3,5 % Zins dauert die Entschuldung ca. 30 Jahre. Bei 3 % Tilgung nur noch ca. 23 Jahre. Sondertilgungsrechte (meist 5–10 % der Darlehenssumme p.a.) ermöglichen es, den Kredit schneller zurückzuführen, wenn Sie Liquidität übrig haben. Bei Kapitalanlage-Immobilien ist eine niedrige Tilgung (2 %) steuerlich oft günstiger, da die Zinsen als Werbungskosten abzugsfähig sind.",
          },
          {
            heading: "Eigenkapital-Hebel und Loan-to-Value",
            body: "Der Loan-to-Value (LTV) beschreibt das Verhältnis von Darlehen zu Kaufpreis. Standard ist 80 % LTV, bei guter Bonität und Objektqualität auch 90–100 %. Höherer LTV steigert die Eigenkapitalrendite durch den Hebel, erhöht aber das Risiko bei Mietausfall oder Zinssteigerung. Faustregel: Die Kreditrate sollte maximal 60–70 % der Kaltmiete betragen, um Puffer für Leerstand und Reparaturen zu haben.",
          },
          {
            heading: "Mehrere Banken anfragen",
            body: "Vergleichen Sie immer mindestens 3 Angebote. Neben Hausbank und Direktbanken lohnt sich ein Finanzierungsvermittler, der Zugang zu über 400 Bankpartnern hat. Achten Sie nicht nur auf den Nominalzins, sondern den Effektivzins inklusive aller Nebenkosten. Kleinere Volks- und Raiffeisenbanken bieten besonders bei regionalen Objekten oft bessere Konditionen als Großbanken.",
          },
        ],
        tip: "Lassen Sie sich von der Bank ein Forward-Darlehen anbieten, wenn Ihre Zinsbindung in 12–36 Monaten ausläuft. So sichern Sie sich heutige Konditionen für die Anschlussfinanzierung.",
      },
      {
        slug: "steuern-sparen",
        title: "Steuervorteile bei Immobilien nutzen",
        summary: "AfA, Werbungskosten, Spekulationsfrist und GmbH-Struktur im Überblick.",
        readMinutes: 8,
        sections: [
          {
            heading: "Absetzung für Abnutzung (AfA)",
            body: "Die AfA ist der wichtigste Steuervorteil für Immobilieninvestoren. Sie können den Gebäudeanteil (nicht das Grundstück!) jährlich abschreiben: 2 % p.a. für Gebäude ab Baujahr 1925 (= 50 Jahre Nutzungsdauer), 2,5 % p.a. für Gebäude vor 1925, 3 % p.a. für Neubauten ab 2023 (§ 7 Abs. 4 EStG). Den Gebäudeanteil ermitteln Sie über die Kaufpreisaufteilung – nutzen Sie die BMF-Arbeitshilfe oder ein Gutachten. Ein hoher Gebäudeanteil (70–80 %) maximiert Ihre AfA.",
          },
          {
            heading: "Werbungskosten absetzen",
            body: "Alle Aufwendungen rund um Vermietung und Verpachtung mindern Ihre Steuerlast: Darlehenszinsen (nicht Tilgung!), Fahrtkosten zu Besichtigungen und Eigentümerversammlungen, Renovierung und Instandhaltung (sofort absetzbar bis 4.000 € netto / 15 % des Gebäudewerts in den ersten 3 Jahren), Hausverwaltung, Versicherungen, Grundsteuer, Kontoführungsgebühren, Steuerberater (anteilig). In den ersten Jahren übersteigen die Werbungskosten oft die Mieteinnahmen, was zu steuerlichen Verlusten führt, die mit anderen Einkünften verrechnet werden können.",
          },
          {
            heading: "Die 10-Jahres-Spekulationsfrist",
            body: "Gewinne aus dem Verkauf vermieteter Immobilien sind nach 10 Jahren Haltedauer komplett steuerfrei (§ 23 EStG). Die Frist beginnt mit dem Datum des notariellen Kaufvertrags. Verkaufen Sie vorher, fällt Spekulationssteuer auf den Gewinn an (persönlicher Einkommensteuersatz). Achtung: Bei mehr als 3 Objektverkäufen innerhalb von 5 Jahren droht die Einstufung als gewerblicher Grundstückshandel (Drei-Objekt-Grenze) – dann entfallen alle steuerlichen Vorteile der Vermietung.",
          },
          {
            heading: "GmbH-Struktur ab wann?",
            body: "Ab ca. 3–5 Immobilien kann eine vermögensverwaltende GmbH steuerlich sinnvoll sein. Steuersatz auf Mieteinnahmen: Privat bis zu 45 % (+ Soli), GmbH ca. 15,8 % (KSt + GewSt). Nachteile: Keine private Spekulationsfrist, Ausschüttungen werden nochmals besteuert (Kapitalertragsteuer), Gründungs- und laufende Kosten (Buchhaltung, Jahresabschluss). Die GmbH lohnt sich besonders, wenn Sie Gewinne reinvestieren statt ausschütten. Lassen Sie sich individuell von einem Steuerberater mit Immobilienfokus beraten.",
          },
        ],
        tip: "Führen Sie ab dem ersten Tag ein Haushaltsbuch für Ihre Immobilie. Jeder Beleg, jede Fahrt, jeder Anruf – dokumentieren Sie alles. Das zahlt sich bei der Steuererklärung aus.",
      },
      {
        slug: "foerdermittel",
        title: "KfW-Förderung und staatliche Zuschüsse",
        summary: "Welche Förderprogramme es gibt und wie Sie davon profitieren.",
        readMinutes: 5,
        sections: [
          {
            heading: "KfW-Effizienzhaus-Förderung",
            body: "Die KfW fördert energieeffizientes Bauen und Sanieren mit zinsgünstigen Darlehen und Tilgungszuschüssen. Für Bestandssanierungen (KfW 261): Bis zu 150.000 € Kredit pro Wohneinheit bei Sanierung zum Effizienzhaus. Tilgungszuschüsse von 5–25 % je nach erreichter Effizienzhausstufe. Die Förderung muss vor Beginn der Maßnahme beantragt werden – beauftragen Sie zuerst einen Energieberater.",
          },
          {
            heading: "BAFA-Förderung für Einzelmaßnahmen",
            body: "Das Bundesamt für Wirtschaft und Ausfuhrkontrolle (BAFA) fördert einzelne energetische Maßnahmen: Heizungsaustausch (bis 70 % Zuschuss bei Wärmepumpe), Dämmung von Dach, Fassade, Kellerdecke (15 % Zuschuss), Fenster- und Türentausch (15 % Zuschuss), Heizungsoptimierung (15 % Zuschuss). Die Förderung ist an bestimmte technische Mindestanforderungen geknüpft.",
          },
          {
            heading: "Denkmal-AfA (§ 7h/7i EStG)",
            body: "Sanierungskosten für denkmalgeschützte Gebäude können beschleunigt abgeschrieben werden: In den ersten 8 Jahren je 9 % der Sanierungskosten, in den folgenden 4 Jahren je 7 %. Das bedeutet: 100 % der Sanierungskosten sind in 12 Jahren steuerlich absetzbar. Voraussetzung: Die Sanierung muss mit der Denkmalschutzbehörde abgestimmt und bescheinigt werden. Diese Regelung macht auch hochpreisige Altbau-Sanierungen wirtschaftlich attraktiv.",
          },
        ],
        tip: "Kombination ist der Schlüssel: KfW-Kredit + BAFA-Zuschuss + steuerliche AfA können die effektiven Sanierungskosten um 40–60 % reduzieren.",
      },
    ],
  },

  /* ━━━━━━━━━━━━━━━━ 4. Sanierung ━━━━━━━━━━━━━━━━ */
  {
    slug: "sanierung",
    title: "Sanierung & Energie",
    description: "Sanierungskosten kalkulieren, Energieeffizienz verbessern, Wert steigern",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    color: "#FBBF24",
    articles: [
      {
        slug: "sanierungskosten",
        title: "Sanierungskosten realistisch kalkulieren",
        summary: "Typische Kosten für Dach, Fenster, Heizung, Bad und Fassade.",
        readMinutes: 6,
        sections: [
          {
            heading: "Typische Sanierungskosten nach Gewerk",
            body: "Dachsanierung: 150–250 €/m² Dachfläche. Eindeckung, Dämmung, Lattung. Bei Flachdach 80–150 €/m².\n\nFenstertausch: 500–800 € pro Standardfenster (3-fach-Verglasung). Bodentiefe Fenster/Balkontüren: 1.200–2.000 € pro Element.\n\nHeizungstausch: Gasbrennwert 6.000–10.000 €, Wärmepumpe 15.000–25.000 €, Fernwärmeanschluss 5.000–10.000 €.\n\nBadezimmer: Einfach 5.000–8.000 €, mittel 8.000–15.000 €, gehoben 15.000–25.000 €.\n\nFassadendämmung (WDVS): 100–200 €/m² Fassadenfläche.\n\nElektroinstallation (Komplett): 80–120 €/m² Wohnfläche.\n\nKomplettsanierung: 800–1.500 €/m² Wohnfläche je nach Umfang und Standard.",
          },
          {
            heading: "Kostenfallen vermeiden",
            body: "Häufige Kostenfallen bei Sanierungen: Asbest in Nachtspeicherheizungen, Fassadenplatten oder Bodenbelägen (Entsorgung teuer). Versteckte Feuchtigkeitsschäden in Kellerräumen und hinter Vorwandinstallationen. Marode Abwasserleitungen (Kamera-Inspektion vor Kauf empfohlen). Nachträglich eingebaute Wände ohne statische Freigabe. Altlasten im Boden (bei Grundstücken mit Gewerbe-Vornutzung). Lassen Sie vor dem Kauf einen Sachverständigen das Objekt prüfen – die 300–500 € Kosten sind die beste Investition.",
          },
          {
            heading: "Sanierung und Mietrecht",
            body: "Modernisierungskosten können zu 8 % jährlich auf die Mieter umgelegt werden (§ 559 BGB). Voraussetzung: Die Maßnahme steigert den Gebrauchswert, verbessert die Wohnverhältnisse oder spart Energie. Die Mieterhöhung ist auf maximal 3 €/m² in 6 Jahren begrenzt (2 €/m² bei Mieten unter 7 €/m²). Die Ankündigungsfrist beträgt 3 Monate. Erhaltungsmaßnahmen (reine Reparaturen) können nicht umgelegt werden.",
          },
        ],
        tip: "Holen Sie für jedes Gewerk mindestens drei Angebote ein und prüfen Sie Referenzen. Vereinbaren Sie Festpreise statt Stundenlohn und halten Sie alles schriftlich fest.",
      },
      {
        slug: "energieeffizienz",
        title: "Energieeffizienz und GEG-Pflichten",
        summary: "Was das Gebäudeenergiegesetz vorschreibt und wie Sie davon profitieren.",
        readMinutes: 6,
        sections: [
          {
            heading: "Der Energieausweis",
            body: "Seit 2014 ist der Energieausweis bei Verkauf und Neuvermietung Pflicht. Es gibt zwei Arten: Den Bedarfsausweis (berechnet theoretischen Energiebedarf, aussagekräftiger) und den Verbrauchsausweis (basiert auf tatsächlichem Verbrauch der letzten 3 Jahre, günstiger). Für Wohngebäude mit weniger als 5 Wohneinheiten und Baujahr vor 1977 ist der Bedarfsausweis Pflicht. Die Energieeffizienzklassen reichen von A+ (< 30 kWh/m²a) bis H (> 250 kWh/m²a).",
          },
          {
            heading: "GEG-Nachrüstpflichten bei Eigentümerwechsel",
            body: "Bei Kauf einer Bestandsimmobilie schreibt das Gebäudeenergiegesetz (GEG) folgende Nachrüstungen innerhalb von 2 Jahren vor:\n\n• Dämmung oberster Geschossdecke oder Dach (falls nicht begehbar: U-Wert max. 0,24 W/m²K)\n• Austausch von Heizkesseln, die älter als 30 Jahre sind (ausgenommen Brennwert- und Niedertemperaturkessel)\n• Dämmung warmwasserführender Rohre in unbeheizten Räumen\n\nDiese Pflichten gelten automatisch und unabhängig von weiteren Sanierungsplänen. Kalkulieren Sie die Kosten vor dem Kauf ein.",
          },
          {
            heading: "Energetische Sanierung als Werthebel",
            body: "Eine Verbesserung der Energieklasse um 2 Stufen (z. B. von F auf D) kann den Immobilienwert um 10–15 % steigern. Gleichzeitig sinken die Energiekosten für Mieter, was die Vermietbarkeit und Zahlungsbereitschaft erhöht. Besonders lohnend: Fassadendämmung (30–40 % Energieeinsparung), Fenstertausch (10–15 %), Heizungstausch auf Wärmepumpe (40–60 %). Die Kombination aller Maßnahmen kann den Energieverbrauch um bis zu 70 % senken.",
          },
        ],
        tip: "Prüfen Sie vor der Sanierung, ob das Objekt KfW-Effizienzhaus-Standard erreichen kann. Der Tilgungszuschuss (bis 25 %) macht die Differenz zur Standardsanierung oft mehr als wett.",
      },
    ],
  },

  /* ━━━━━━━━━━━━━━━━ 5. Strategie ━━━━━━━━━━━━━━━━ */
  {
    slug: "strategie",
    title: "Strategien & Strukturen",
    description: "Investmentstrategien, Portfolioaufbau und rechtliche Strukturen",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#FB923C",
    articles: [
      {
        slug: "buy-and-hold",
        title: "Buy & Hold: Langfristig Vermögen aufbauen",
        summary: "Die bewährteste Strategie für nachhaltigen Vermögensaufbau mit Immobilien.",
        readMinutes: 6,
        sections: [
          {
            heading: "Das Prinzip Buy & Hold",
            body: "Buy & Hold bedeutet: Kaufen, vermieten, langfristig halten. Sie profitieren von vier Renditekomponenten gleichzeitig: Laufende Mieteinnahmen (Cashflow), Tilgung durch den Mieter (Vermögensaufbau), Wertsteigerung der Immobilie (durchschnittlich 2–4 % p.a. in guten Lagen), Steuervorteile (AfA, Werbungskosten). Der größte Vorteil: Die Inflation arbeitet für Sie – Mieten steigen mit der Inflation, während Ihre Kreditrate nominal gleich bleibt.",
          },
          {
            heading: "Objektauswahl für Buy & Hold",
            body: "Ideale Buy & Hold-Objekte haben: Stabile Lage mit langfristiger Nachfrage (B-Lage in wachsender Stadt), Solide Bausubstanz (Baujahr 1960–2000 nach Sanierung), Positiver oder neutraler Cashflow ab Tag 1, Marktgerechte Miete mit Anpassungspotenzial, Gute Vermietbarkeit (2–4 Zimmer, 50–80 m²). Meiden Sie: Überteuerte A-Lagen mit Negativcashflow, Hochpreisige Neubauten mit minimaler Rendite, Strukturschwache Regionen mit Abwanderung.",
          },
          {
            heading: "Skalierung: Vom ersten Objekt zum Portfolio",
            body: "Der Vermögensaufbau mit Immobilien funktioniert exponentiell: Objekt 1 baut Eigenkapital auf (durch Tilgung und Wertsteigerung). Nach 3–5 Jahren können Sie das gestiegene Eigenkapital als Sicherheit für Objekt 2 nutzen. Mit jedem weiteren Objekt steigt Ihre Bonität (nachgewiesene Mieteinnahmen) und Ihr Verhandlungshebel. Ziel: 10 Objekte in 15–20 Jahren, die sich selbst tragen und langfristig schuldenfrei werden.",
          },
        ],
        tip: "Buy & Hold ist kein Sprint, sondern ein Marathon. Wer geduldig investiert und nicht bei jedem Markteinbruch panisch verkauft, wird langfristig belohnt.",
      },
      {
        slug: "fix-and-flip",
        title: "Fix & Flip: Sanieren und verkaufen",
        summary: "Wie Sie mit Sanierung und Weiterverkauf kurzfristig Gewinne erzielen.",
        readMinutes: 5,
        sections: [
          {
            heading: "Fix & Flip im Überblick",
            body: "Fix & Flip bedeutet: Unterbewertete Immobilie kaufen, sanieren/renovieren, mit Gewinn verkaufen. Die Marge entsteht durch den Unterschied zwischen Einkaufspreis + Sanierungskosten und dem erzielbaren Verkaufspreis. Typische Zielmarge: 15–25 % Gewinn auf den Gesamteinsatz. Diese Strategie erfordert Marktkenntnisse, Handwerker-Netzwerk und schnelle Umsetzung.",
          },
          {
            heading: "Kalkulation und Risiken",
            body: "Berechnung: Maximaler Einkaufspreis = Erwarteter Verkaufspreis – Sanierungskosten – Kaufnebenkosten – Verkaufskosten (Makler, Notar) – Haltekosten (Zinsen, Nebenkosten während Sanierung) – Zielmarge (15–25 %). Risiken: Kostenüberschreitungen bei Sanierung (20–30 % Puffer einplanen), längere Haltedauer als geplant, Marktänderungen während der Sanierungsphase. Steuerlich: Innerhalb der 10-Jahres-Frist fällt Spekulationssteuer an. Bei mehr als 3 Verkäufen in 5 Jahren droht gewerblicher Grundstückshandel.",
          },
          {
            heading: "Praktische Umsetzung",
            body: "Erfolgsfaktoren: Kaufen Sie nur mit klarer Kostenanalyse (nie aus dem Bauch heraus). Bauen Sie ein verlässliches Handwerker-Netzwerk auf. Sanieren Sie bedarfsgerecht für die Zielgruppe (Erstbezug nach Sanierung = Premium-Mieter/Käufer). Halten Sie die Sanierungsdauer kurz (3–6 Monate ideal). Planen Sie den Verkauf parallel zur Sanierung. Nutzen Sie Home Staging für den Verkauf.",
          },
        ],
        tip: "Fix & Flip ist eher Gewerbe als Investment. Starten Sie erst, wenn Sie mindestens 2–3 Buy & Hold-Objekte erfolgreich erworben und verwaltet haben.",
      },
      {
        slug: "portfolio-aufbauen",
        title: "Immobilien-Portfolio systematisch aufbauen",
        summary: "Diversifikation, Risikomanagement und der Weg zum passiven Einkommen.",
        readMinutes: 7,
        sections: [
          {
            heading: "Portfoliotheorie für Immobilien",
            body: "Ein gut diversifiziertes Immobilienportfolio streut über: Standorte (mind. 2–3 verschiedene Städte), Objekttypen (ETW, MFH, ggf. Gewerbeanteil), Mieterstruktur (Singles, Familien, Studenten), Baujahre und Zustände (Mix aus Neubau und saniertem Bestand). Das Ziel: Kein einzelnes Ereignis (Leerstand, Mietausfall, Markteinbruch in einer Stadt) gefährdet Ihre Gesamtrendite.",
          },
          {
            heading: "Wachstumsphasen",
            body: "Phase 1 (Jahr 1–3): Erste 1–2 Objekte kaufen, Erfahrung sammeln, Prozesse lernen. Fokus auf Sicherheit und Cashflow.\n\nPhase 2 (Jahr 3–7): Portfolio auf 3–5 Objekte ausbauen. Wertsteigerung der ersten Objekte als Eigenkapital nutzen. Optimierung der Steuerstruktur prüfen.\n\nPhase 3 (Jahr 7–15): 5–10+ Objekte, ggf. GmbH-Struktur, professionelle Verwaltung. Fokus auf Effizienz und Skalierung.\n\nPhase 4 (ab Jahr 15): Erste Objekte werden schuldenfrei. Reinvestition oder Genuss der passiven Einnahmen. Ggf. Verkauf steuerfreier Objekte (> 10 Jahre Haltedauer).",
          },
          {
            heading: "Risikomanagement",
            body: "Essenzielle Absicherungen: Liquiditätsreserve von 6 Monatsmieten pro Objekt. Gebäudeversicherung mit Elementarschadendeckung. Mietausfallversicherung bei Einzelobjekten erwägen. Zinsbindung von mindestens 15 Jahren. Regelmäßige Marktwertüberprüfung. Mietverträge professionell gestalten (Staffelmiete oder Indexmiete). Überwachen Sie Ihre Kapitaldienstfähigkeit – die Rate aller Kredite sollte 40 % Ihres Gesamteinkommens (inkl. Mieteinnahmen) nicht überschreiten.",
          },
          {
            heading: "Passives Einkommen als Ziel",
            body: "Das langfristige Ziel vieler Immobilieninvestoren: Genug passive Mieteinnahmen, um den Lebensunterhalt zu decken. Rechenbeispiel: Bei 10 Wohnungen à 700 € Kaltmiete und 50 % Kostenquote (inkl. Kreditraten) bleiben 3.500 € netto pro Monat. Nach vollständiger Tilgung (20–30 Jahre) steigt der Cashflow auf 5.000–6.000 € pro Monat. Hinzu kommt ein schuldenfreies Immobilienvermögen von 1–2 Mio. €.",
          },
        ],
        tip: "Erstellen Sie einen 10-Jahres-Plan mit konkreten Meilensteinen. Überprüfen Sie ihn jährlich und passen Sie ihn an. Wer sein Ziel kennt, trifft bessere Entscheidungen.",
      },
    ],
  },

  /* ━━━━━━━━━━━━━━━━ 6. Markt & Recht ━━━━━━━━━━━━━━━━ */
  {
    slug: "markt-recht",
    title: "Markt & Recht",
    description: "Marktzyklen verstehen, Mietrecht beachten und rechtssicher investieren",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    color: "#00D4FF",
    articles: [
      {
        slug: "marktzyklen",
        title: "Immobilienmarktzyklen verstehen",
        summary: "Wann kaufen, wann halten? Die Phasen des Immobilienmarkts.",
        readMinutes: 5,
        sections: [
          {
            heading: "Die vier Marktphasen",
            body: "Der Immobilienmarkt durchläuft typischerweise Zyklen von 7–15 Jahren mit vier Phasen:\n\n1. Erholung: Nach einem Abschwung steigen Mieten langsam, Leerstände sinken, Kaufpreise stagnieren. Beste Kaufgelegenheiten.\n\n2. Expansion: Steigende Preise und Mieten, sinkende Renditen, zunehmende Bautätigkeit. Gute Zeit für Bestandsanleger.\n\n3. Überhitzung: Spekulative Käufe, stark steigende Preise bei stagnierenden Mieten, hohe Bautätigkeit. Vorsicht bei Neukäufen.\n\n4. Abschwung: Fallende Preise, steigende Leerstände, Kreditverknappung. Wer Cashflow hat, übersteht die Phase – wer spekuliert hat, verkauft mit Verlust.",
          },
          {
            heading: "Zinszyklen und ihre Wirkung",
            body: "Zinsen sind der größte Einflussfaktor auf Immobilienpreise. Niedrige Zinsen → höhere Kaufpreise (Käufer können mehr finanzieren), steigende Zinsen → Preisdruck (Finanzierung wird teurer, Nachfrage sinkt). Der Zinsanstieg 2022/23 von 1 % auf 4 % hat die Kaufpreise in vielen Märkten um 10–20 % korrigiert. Für Buy & Hold-Investoren sind Phasen steigender Zinsen oft gute Kaufgelegenheiten, da der Wettbewerb nachlässt und Verhandlungsspielraum entsteht.",
          },
          {
            heading: "Antizyklisch investieren",
            body: "Die besten Deals entstehen, wenn andere nicht kaufen wollen. Antizyklisches Investieren bedeutet: In der Erholungsphase kaufen, wenn die Stimmung noch negativ ist. In der Expansionsphase halten und optimieren. In der Überhitzungsphase nur kaufen, wenn der Cashflow stimmt (keine Spekulation). Im Abschwung Liquidität bereithalten und Chancen nutzen. Warren Buffetts Prinzip gilt auch für Immobilien: Sei gierig, wenn andere ängstlich sind.",
          },
        ],
        tip: "Lassen Sie sich nicht von Markt-Euphorie oder Panik anstecken. Solange die Fundamentaldaten stimmen (Cashflow, Lage, Substanz), ist jeder Zeitpunkt ein guter Kaufzeitpunkt.",
      },
      {
        slug: "mietrecht",
        title: "Mietrecht-Grundlagen für Vermieter",
        summary: "Die wichtigsten Regeln zu Mietvertrag, Mieterhöhung und Kündigung.",
        readMinutes: 7,
        sections: [
          {
            heading: "Der Mietvertrag",
            body: "Ein guter Mietvertrag schützt beide Seiten. Empfehlenswert: Standardformulare von Haus & Grund oder dem IVD, ergänzt um individuelle Regelungen. Wichtige Klauseln: Staffelmiete (jährliche, feste Mieterhöhung) oder Indexmiete (gekoppelt an Verbraucherpreisindex), Schönheitsreparaturen (nur wirksam mit flexibler Fristenregelung), Kleinreparaturklausel (bis 100–120 € pro Reparatur, max. 8 % der Jahresmiete), Kaution (max. 3 Monatskaltmieten, auf separatem Konto).",
          },
          {
            heading: "Mieterhöhung durchsetzen",
            body: "Mieterhöhung bis zur ortsüblichen Vergleichsmiete: Begründung durch Mietspiegel, Sachverständigengutachten oder 3 Vergleichswohnungen. Kappungsgrenze: Max. 20 % in 3 Jahren (in angespannten Märkten 15 %). Sperrfrist: Frühestens 12 Monate nach letzter Mieterhöhung, Wirkung ab dem übernächsten Monat. Modernisierungsmieterhöhung: 8 % der Modernisierungskosten p.a. auf die Miete umlegbar (§ 559 BGB). Indexmiete: Automatische Anpassung an den Verbraucherpreisindex – keine gesonderte Begründung nötig.",
          },
          {
            heading: "Kündigung: Rechte und Pflichten",
            body: "Als Vermieter können Sie nur aus berechtigtem Interesse kündigen (§ 573 BGB): Eigenbedarf (für sich, Familienangehörige oder Haushaltsangehörige), erhebliche Vertragsverletzung (Zahlungsverzug > 2 Monatsmieten, unerlaubte Untervermietung, nachhaltige Störung des Hausfriedens), wirtschaftliche Verwertung (nur wenn Weitervermietung unzumutbar). Kündigungsfristen: 3 Monate (bis 5 Jahre Mietdauer), 6 Monate (5–8 Jahre), 9 Monate (über 8 Jahre). Fristlose Kündigung bei Zahlungsverzug ab 2 Monatsmieten möglich.",
          },
          {
            heading: "Mieterauswahl und Bonitätsprüfung",
            body: "Eine sorgfältige Mieterauswahl ist die beste Prävention. Fordern Sie an: Selbstauskunft mit Einkommensnachweise der letzten 3 Monate, SCHUFA-Bonitätsauskunft (vom Mieter selbst eingeholt), Mietschuldenfreiheitsbescheinigung des Vorvermieter, Kopie des Personalausweises. Faustregel: Die Warmmiete sollte max. 30–35 % des Nettohaushaltseinkommens betragen. Achten Sie auf stabile Beschäftigungsverhältnisse und positive Referenzen.",
          },
        ],
        tip: "Investieren Sie in ein gutes Verhältnis zu Ihren Mietern. Zufriedene Mieter bleiben länger, zahlen pünktlich und pflegen die Wohnung. Das spart Ihnen Leerstand, Renovierung und Rechtsstreitigkeiten.",
      },
    ],
  },
];

/* ── Helpers ── */

export function getAllCategories() {
  return KNOWLEDGE_BASE;
}

export function getCategoryBySlug(slug: string) {
  return KNOWLEDGE_BASE.find((c) => c.slug === slug);
}

export function getArticle(categorySlug: string, articleSlug: string) {
  const cat = getCategoryBySlug(categorySlug);
  if (!cat) return null;
  const article = cat.articles.find((a) => a.slug === articleSlug);
  if (!article) return null;
  return { category: cat, article };
}

export function getAllArticlesFlat() {
  return KNOWLEDGE_BASE.flatMap((cat) =>
    cat.articles.map((a) => ({ ...a, category: cat }))
  );
}
