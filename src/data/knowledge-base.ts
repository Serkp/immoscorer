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
{"slug": "erste-anlageimmobilie-fehler", "title": "Anlageimmobilie: 8 teure Fehler & wie du sie vermeidest", "seoTitle": "Anlageimmobilie: 8 teure Fehler & wie du sie vermeidest", "metaDescription": "Die 8 teuersten Fehler bei der ersten Anlageimmobilie - mit echten Euro-Zahlen erklärt. So umgehst du Renditefallen. Objekt jetzt kostenlos prüfen.", "summary": "Die 8 teuersten Fehler bei der ersten Anlageimmobilie - mit echten Euro-Zahlen erklärt. So umgehst du Renditefallen. Objekt jetzt kostenlos prüfen.", "readMinutes": 11, "publishedAt": "2026-06-16", "updatedAt": "2026-06-16", "sections": [{"heading": "Fehler 1: Mit der Bruttorendite rechnen statt der Nettorendite", "body": "Die Bruttomietrendite ist die Zahl, mit der Inserate werben: Jahreskaltmiete geteilt durch Kaufpreis. Sie ignoriert sämtliche Kosten - und genau das macht sie gefährlich. Was am Ende auf deinem Konto landet, ist die Nettorendite nach Bewirtschaftungskosten und Kaufnebenkosten.\n\nEin Rechenbeispiel für eine 70-m²-Wohnung in einer mittelgroßen Stadt:\n\nAus angeblichen 3,36 % werden real 2,31 %. Das ist kein Detail, sondern ein Drittel weniger Ertrag. Wer mit der Bruttorendite kalkuliert, überschätzt seinen Cashflow systematisch - und merkt es erst, wenn die erste Hausgeldabrechnung im Briefkasten liegt. Als grobe Brücke gilt: Die Nettorendite liegt typischerweise 25 bis 35 % unter der Bruttorendite. Sieht ein Inserat also mit 4 % Brutto attraktiv aus, bleiben real eher 2,6 bis 3,0 % übrig - und das vor Finanzierung und Steuern.", "table": {"headers": ["Position", "Betrag"], "rows": [["Kaufpreis", "250.000 €"], ["Jahreskaltmiete (700 €/Monat)", "8.400 €"], ["Bruttomietrendite", "3,36 %"], ["Kaufnebenkosten (ca. 11 %: Grunderwerbsteuer, Notar, Grundbuch)", "27.500 €"], ["Gesamtinvestition", "277.500 €"], ["Nicht umlagefähige Kosten (Verwaltung, Instandhaltungsrücklage, Mietausfallwagnis)", "– 2.000 €"], ["Nettojahresertrag", "6.400 €"], ["Nettomietrendite", "2,31 %"]]}}, {"heading": "Fehler 2: Die Kaufnebenkosten unterschätzen", "body": "Viele Einsteiger planen nur den Kaufpreis und vielleicht etwas Eigenkapital für die Bank. Die Kaufnebenkosten werden vergessen - dabei liegen sie in Deutschland je nach Bundesland bei 9 bis 12 % des Kaufpreises und müssen fast immer aus Eigenkapital bezahlt werden, weil Banken sie nicht mitfinanzieren.\n\n• **Grunderwerbsteuer:** 3,5 % in Bayern bis 6,5 % in NRW, Brandenburg, dem Saarland, Schleswig-Holstein und Thüringen - allein diese Spanne macht bei 250.000 € rund 7.500 € Unterschied.\n\n• **Notar und Grundbuch:** zusammen rund 1,5 bis 2 %, gesetzlich geregelt und kaum verhandelbar.\n\n• **Maklercourtage:** üblich sind etwa 3,57 % inkl. MwSt. für den Käufer. Wichtig für Kapitalanleger: Die seit Ende 2020 geltende hälftige Teilung der Maklerkosten (§§ 656a ff. BGB) greift nur, wenn der Käufer Verbraucher ist und es um eine Wohnung oder ein Einfamilienhaus geht. Bei Mehrfamilienhäusern oder gewerblichem Erwerb ist die Provisionsverteilung frei verhandelbar - du kannst also schnell die volle Courtage tragen.\n\nBei 250.000 € Kaufpreis in NRW mit Makler sind das schnell 27.500 bis 30.000 € - Geld, das sofort weg ist und sich erst über Jahre durch Wertsteigerung und Tilgung amortisiert. Wer das nicht eingeplant hat, steht beim Notartermin mit einer Finanzierungslücke da. Verhandlungshebel: Die Grunderwerbsteuer fällt nur auf den Grundstücks- und Gebäudewert an. Werden mitverkauftes Inventar wie Einbauküche oder Markisen separat im Kaufvertrag ausgewiesen, sinkt die Bemessungsgrundlage - das ist legal und spart bei größeren Beträgen vierstellig."}, {"heading": "Fehler 3: Die Lage am eigenen Wohnort statt an den Daten festmachen", "body": "\"Ich kaufe nur, was ich kenne\" klingt vernünftig, führt aber oft zum falschen Markt. Die entscheidenden Lagefaktoren für eine Anlageimmobilie sind nicht, ob dir der Stadtteil gefällt, sondern:\n\n• **Bevölkerungsprognose:** Wächst oder schrumpft die Region bis 2040? Strukturschwache Landkreise verlieren laut Prognosen teils über 10 % ihrer Einwohner - das drückt langfristig Miete und Wiederverkaufswert.\n\n• **Arbeitsmarkt und Branchenmix:** Eine Stadt mit einem einzigen Großarbeitgeber ist ein Klumpenrisiko. Gerät dieser Arbeitgeber in die Krise, brechen Nachfrage und Miete gleichzeitig ein.\n\n• **Leerstandsquote und Mietspiegel-Dynamik:** Steigen die Mieten seit Jahren, oder stagnieren sie? Eine Leerstandsquote über 5 % ist ein Warnsignal für einen entspannten Markt mit wenig Mietpotenzial.\n\nEine B-Stadt mit 2,8 % Bruttorendite und wachsender Bevölkerung kann langfristig deutlich überlegen sein gegenüber einer 5-%-Rendite in einem schrumpfenden Mittelzentrum, wo du in zehn Jahren Mühe hast, überhaupt zu vermieten oder zu verkaufen. Die hohe Rendite im Inserat ist oft kein Geschenk, sondern die Risikoprämie für einen Standort, den der Markt meidet. Faustregel: Je höher die ausgewiesene Rendite, desto genauer solltest du fragen, warum der Markt nicht mehr bezahlt."}, {"heading": "Fehler 4: Instandhaltung und Sanierungsstau ausblenden", "body": "Ein Dach hält rund 50 Jahre, eine Heizung 20 bis 25, Fenster und Fassade etwa 40. Diese Bauteile altern unabhängig davon, ob du gerade gekauft hast - und ihr Lebensende lässt sich nicht aufschieben. Die Faustregel der Instandhaltungsrücklage liegt bei 1 bis 1,5 % des Gebäudewerts pro Jahr, bei älteren Objekten eher am oberen Rand. Bei 200.000 € Gebäudewert sind das 2.000 bis 3.000 € jährlich, die du zurücklegen solltest - egal, ob die Bank sie in der Annuität sehen will oder nicht.\n\nKonkret: Bei einer Eigentumswohnung solltest du vor dem Kauf die **Protokolle der letzten drei Eigentümerversammlungen** und die **Höhe der Instandhaltungsrücklage der WEG** prüfen. Eine Gemeinschaft mit 40 Jahre altem Gebäude und nur 8.000 € Rücklage ist ein rotes Tuch - hier wurde jahrelang zu wenig zurückgelegt, und die Rechnung kommt mit Verzögerung. Steht eine Fassaden-, Dach- oder Strangsanierung an, kann eine Sonderumlage von 10.000 bis 30.000 € pro Eigentümer fällig werden. Das ist ein Posten, der in keinem Exposé steht - und der eine ganze Renditerechnung kippen kann. Wichtig: Eine bereits beschlossene Sonderumlage geht beim Kauf in der Regel auf dich als neuen Eigentümer über. Lies die Beschlüsse, nicht nur die Hochglanzbilder."}, {"heading": "Fehler 5: Energieeffizienz und das GEG ignorieren", "body": "Seit der GEG-Novelle (Gebäudeenergiegesetz) ist die Energieklasse kein Nebenaspekt mehr, sondern ein harter Preis- und Risikofaktor. Anders als oft behauptet gibt es keine pauschale Pflicht, eine funktionierende Öl- oder Gasheizung sofort zu ersetzen. Die realen Mechanismen sind konkreter - und für die Kalkulation wichtiger:\n\n• **30-Jahre-Regel:** Heizkessel, die vor 1991 eingebaut wurden, dürfen nicht mehr betrieben werden; jüngere Standard-Kessel müssen nach 30 Betriebsjahren raus. Ein Kessel von 1996 ist also 2026 ein konkreter, terminierter Kostenpunkt.\n\n• **65-%-Regel bei Neueinbau:** Jede neu eingebaute Heizung muss zu mindestens 65 % mit erneuerbarer Energie laufen - der nächste Tausch führt also faktisch zur Wärmepumpe oder einer gleichwertigen Lösung.\n\n• **Kommunale Wärmeplanung:** Ob und wann Fernwärme oder ein Verbot bestimmter Heizungen kommt, hängt von der Wärmeplanung deiner Kommune ab. Diese solltest du vor dem Kauf kennen.\n\nDer Austausch einer alten Heizung gegen eine Wärmepumpe kostet inklusive Anpassungen typischerweise 25.000 bis 40.000 € vor Förderung. Über die KfW-Förderung (bis zu 70 % beim Heizungstausch) lässt sich das deutlich senken - aber die Vorfinanzierung musst du stemmen, und bei vermieteten Objekten ist die Förderlage enger als beim Eigenheim. Hinzu kommt: Ein schlecht gedämmtes Objekt mit Klasse G oder H hat höhere Nebenkosten, was die Vermietbarkeit verschlechtert, und verliert an Wiederverkaufswert, weil künftige Käufer die Sanierungskosten einpreisen. Umgekehrt rechtfertigt ein Objekt mit Klasse A oder B einen höheren Kaufpreis. Die Energieklasse gehört deshalb fest in die Bewertung - nicht als Fußnote, sondern als eigenständiger Faktor."}, {"heading": "Fehler 6: Mit zu wenig Puffer und zu kurzer Zinsbindung finanzieren", "body": "Eine Finanzierung sieht im Niedrigzinsumfeld völlig anders aus als bei 4 % Sollzins. Zwei Teilfehler treten hier besonders oft auf:\n\n**Zu geringe Tilgung**\n\nBei 1 % Anfangstilgung und 4 % Zins brauchst du rund 40 Jahre bis zur vollständigen Rückzahlung. Eine Anfangstilgung von 2 bis 3 % verkürzt das erheblich und reduziert das Risiko am Ende der Zinsbindung. Genauso wichtig ist deren Länge: Wer bei 4 % nur 5 Jahre festschreibt, wettet darauf, dass die Zinsen danach nicht höher stehen. Läuft die Bindung in einer Hochzinsphase aus, kann sich die Rate beim Anschlusskredit deutlich erhöhen - in der Branche als Prolongationsrisiko bekannt. 10 bis 15 Jahre Zinsbindung kosten etwas Aufschlag, kaufen dir aber Planungssicherheit.\n\n**Kein Cashflow-Puffer**\n\nRechne nie mit 100 % Vermietung und null Reparaturen. Ein realistischer Ansatz kalkuliert mindestens einen Monat Mietausfall pro Jahr und eine Instandhaltungsrücklage ein. Beispiel mit 200.000 € Darlehen:\n\nEin negativer Cashflow ist nicht per se falsch - der Tilgungsanteil von rund 333 € monatlich ist reiner Vermögensaufbau, und Abschreibung (in der Regel 2 % p. a. auf den Gebäudewert) sowie Werbungskosten mindern die Steuerlast. Aber du musst die monatliche Unterdeckung dauerhaft aus deinem Einkommen tragen können, auch wenn die Wohnung mal drei Monate leer steht oder eine 4.000-€-Reparatur ansteht. Faustregel: Halte zusätzlich zur Rücklage drei bis sechs Monatsraten als Liquiditätspuffer vor. Wer das nicht durchhält, verkauft im ungünstigsten Moment - und ein Notverkauf ist der teuerste Verkauf.", "table": {"headers": ["Position", "Monatlich"], "rows": [["Mieteinnahme (kalt)", "+ 700 €"], ["Zins + Tilgung (4 % / 2 %)", "– 1.000 €"], ["Nicht umlagefähige Kosten + Rücklage", "– 170 €"], ["Cashflow vor Steuern", "– 470 €"]]}}, {"heading": "Fehler 7: Mieterstruktur und Mietvertrag nicht prüfen", "body": "Eine vermietete Wohnung wird oft mit dem Argument \"läuft ja schon\" verkauft. Doch ein bestehendes Mietverhältnis kann Fluch oder Segen sein:\n\n• **Miete unter Marktniveau:** Ein langjähriger Mieter zahlt vielleicht 9 €/m², während ortsüblich 12 €/m² sind. Wegen der Kappungsgrenze darfst du die Bestandsmiete innerhalb von drei Jahren höchstens um 20 % anheben - in Gebieten mit angespanntem Wohnungsmarkt (per Verordnung festgelegt, inzwischen über 600 Kommunen) sogar nur um 15 %. Die Lücke schließt sich also nur langsam, und in Mietpreisbremsen-Gebieten ist sie zusätzlich gedeckelt.\n\n• **Kündigungsbeschränkungen:** Bei Umwandlung von Miet- in Eigentumswohnungen gelten je nach Region Kündigungssperrfristen von bis zu zehn Jahren für Eigenbedarf. Manche Verträge enthalten zudem individuelle Klauseln, die Kündigungen erschweren.\n\n• **Zahlungsverhalten:** Lass dir die Mietzahlungen der letzten zwölf Monate belegen. Ein Mieter, der schon mehrfach in Verzug war, ist ein konkretes Ausfallrisiko - und eine Räumung dauert in Deutschland im Streitfall schnell ein Jahr und länger.\n\nDie Differenz zwischen Ist- und Marktmiete kann über die Haltedauer mehrere zehntausend Euro entgangener Einnahmen bedeuten. Bei 3 €/m² Mietlücke auf 70 m² sind das 2.520 € pro Jahr - über zehn Jahre eine fünfstellige Summe, die in die ehrliche Kalkulation gehört."}, {"heading": "Fehler 8: Nur auf die Mietrendite schauen - und die Eigenkapitalrendite übersehen", "body": "Hier liegt der vielleicht unterschätzteste Denkfehler: Die meisten Einsteiger bewerten ein Objekt allein über die Nettomietrendite von 2 bis 3 % und schließen daraus \"lohnt sich kaum\". Doch wer finanziert, investiert nicht den vollen Kaufpreis aus eigener Tasche, sondern nur das Eigenkapital - und genau darauf bezieht sich die **Eigenkapitalrendite**, die für einen Kapitalanleger entscheidende Kennzahl.\n\nEin vereinfachtes Beispiel: Du bringst 60.000 € Eigenkapital ein (Nebenkosten plus etwas Tilgungspuffer), finanzierst 250.000 €. Das Objekt steigt konservativ um 2 % im Wert (5.000 €), und die Tilgung baut im ersten Jahr rund 4.000 € Schulden ab. Allein aus Wertzuwachs und Tilgung entsteht ein Vermögensaufbau von 9.000 € - bezogen auf 60.000 € Eigenkapital sind das 15 % Eigenkapitalrendite, selbst wenn der laufende Cashflow null ist. Dieser Hebeleffekt (Leverage) ist der eigentliche Grund, warum Immobilien als Kapitalanlage funktionieren.\n\nAber der Hebel wirkt in beide Richtungen: Fällt der Wert um 2 % statt zu steigen, verstärkt der Kredit auch den Verlust. Genau deshalb darf die Renditebetrachtung nie isoliert stehen. Eine fundierte Entscheidung braucht mehrere Dimensionen, die zusammenwirken:\n\n• **Rendite** - netto und auf das Eigenkapital bezogen, nicht brutto\n\n• **Risiko** - Lage, Mieterstruktur, Klumpenrisiken\n\n• **Finanzierbarkeit** - Cashflow-Tragfähigkeit unter Stress, Prolongationsrisiko\n\n• **Lage** - datenbasiert, nicht nach Sympathie\n\n• **Energie** - Klasse, Sanierungsrisiko, GEG-Pflichten\n\nErst wenn diese Faktoren gemeinsam betrachtet werden, entsteht ein belastbares Gesamtbild. Eine 4-%-Rendite nützt wenig, wenn das Sanierungsrisiko hoch und die Region schrumpfend ist. Umgekehrt kann eine moderate Mietrendite mit Top-Lage, Klasse-A-Energie und solider Eigenkapitalrendite das deutlich bessere Investment sein.\n\n**Bevor du eine Anlageimmobilie kaufst, prüfe sie systematisch: Mit dem kostenlosen ImmoScorer bewertest du dein Objekt in Sekunden anhand von Rendite, Risiko, Finanzierbarkeit, Lage und Energie - und siehst auf einen Blick, ob die Zahlen wirklich tragen.** So ersetzt du Bauchgefühl durch einen klaren Score, bevor du sechsstellig unterschreibst."}], "faq": [{"question": "Welche Rendite sollte eine erste Anlageimmobilie mindestens haben?", "answer": "Eine pauschale Zahl gibt es nicht, weil Rendite und Risiko zusammenhängen. In gefragten Großstädten sind Nettomietrenditen von 2,5 bis 3,5 % üblich, in B- und C-Lagen 4 bis 5 % und mehr - allerdings mit höherem Leerstands- und Wiederverkaufsrisiko. Entscheidend ist nicht die höchste Mietrendite, sondern die Kombination aus tragfähigem Cashflow, vertretbarem Risiko und einer ordentlichen Eigenkapitalrendite über die Haltedauer."}, {"question": "Wie viel Eigenkapital brauche ich für die erste Anlageimmobilie?", "answer": "Als Faustregel solltest du mindestens die Kaufnebenkosten (9 bis 12 %) aus Eigenkapital aufbringen, da Banken diese nicht finanzieren. Sinnvoll sind 15 bis 20 % der Gesamtinvestition, weil das die Zinskonditionen verbessert und den monatlichen Cashflow entlastet. Eine 100-%- oder 110-%-Finanzierung ist möglich, aber teurer und riskanter - der Zinsaufschlag frisst dann einen Teil des Hebeleffekts wieder auf."}, {"question": "Was ist der häufigste Fehler von Einsteigern?", "answer": "Mit der Bruttomietrendite zu rechnen und die laufenden sowie einmaligen Kosten zu unterschätzen. Dadurch wirkt ein Objekt rentabler, als es ist. Eng damit verbunden ist das Ignorieren von Sanierungsstau und Energieeffizienz - beides kann fünfstellige Nachzahlungen auslösen, etwa über eine WEG-Sonderumlage oder einen fälligen Heizungstausch."}, {"question": "Lohnt sich eine Anlageimmobilie bei höheren Zinsen überhaupt noch?", "answer": "Ja, aber die Auswahl wird wichtiger. Bei 4 % Zins muss die Kombination aus Lage, Mietentwicklung und Tilgung stimmen, damit sich Vermögensaufbau und Steuervorteile rechnen. Objekte, die bei Niedrigzins \"irgendwie liefen\", funktionieren jetzt nicht mehr automatisch. Wichtig ist außerdem eine ausreichend lange Zinsbindung, um das Risiko bei der Anschlussfinanzierung zu begrenzen. Eine saubere, mehrdimensionale Bewertung trennt die guten von den schlechten Investments."}, {"question": "Worauf muss ich bei einer bereits vermieteten Wohnung besonders achten?", "answer": "Auf die Höhe der Ist-Miete im Verhältnis zur ortsüblichen Vergleichsmiete, das Zahlungsverhalten des Mieters (zwölf Monate Belege anfordern) und mögliche Kündigungsbeschränkungen. Wegen der Kappungsgrenze von 20 % - in angespannten Märkten 15 % - in drei Jahren lässt sich eine zu niedrige Bestandsmiete nur langsam anheben. Das ist kein Ausschlusskriterium, muss aber in die Renditerechnung einfließen."}]},
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
{"slug": "cashflow-immobilien-finden", "title": "Cashflow-Immobilie finden: Rechnung mit Zahlen", "seoTitle": "Cashflow-Immobilie finden: Rechnung mit Zahlen", "metaDescription": "Cashflow-Immobilien finden, die sich selbst tragen: Kennzahlen, zwei volle Beispielrechnungen und die Filter, die zählen. Jetzt kostenlos prüfen.", "summary": "Cashflow-Immobilien finden, die sich selbst tragen: Kennzahlen, zwei volle Beispielrechnungen und die Filter, die zählen. Jetzt kostenlos prüfen.", "readMinutes": 11, "publishedAt": "2026-06-16", "updatedAt": "2026-06-16", "sections": [{"heading": "Was „trägt sich selbst“ konkret bedeutet", "body": "Es gibt drei Stufen, und du solltest immer wissen, von welcher gerade die Rede ist. Verkäufer und Makler vermischen sie gern – weil die hübscheste Zahl die unehrlichste ist.\n\n• **Brutto-Cashflow:** Kaltmiete minus Annuität (Zins + Tilgung). Ignoriert Nebenkosten und Rücklagen. Hübsch, aber für eine Entscheidung wertlos.\n\n• **Netto-Cashflow vor Steuer:** Kaltmiete minus Annuität minus nicht umlagefähige Kosten (Verwaltung, Instandhaltungsrücklage, Mietausfallrisiko). Das ist die ehrliche Betriebssicht – die Zahl, die dein Konto am Monatsende tatsächlich sieht.\n\n• **Netto-Cashflow nach Steuer:** zusätzlich bereinigt um die Einkommensteuerwirkung aus AfA und absetzbaren Zinsen. Bei Anlegern mit hohem Grenzsteuersatz hilft das – aber meist weniger, als Verkäufer suggerieren (dazu unten die konkrete Rechnung).\n\nEine Immobilie „trägt sich selbst“, wenn der **Netto-Cashflow vor Steuer mindestens null** ist. Alles darüber ist echter Überschuss, alles darunter ist Zuschussgeschäft. Letzteres kann bei reinem Wertzuwachs-Fokus sinnvoll sein – aber dann ist es eine bewusste Entscheidung und kein Versehen."}, {"heading": "Die Kennzahlen, die wirklich zählen", "body": "**1. Bruttomietrendite – nur als Grobfilter**\n\nBruttomietrendite = Jahreskaltmiete ÷ Kaufpreis × 100. Eine 300.000-Euro-Wohnung mit 1.000 Euro Kaltmiete bringt 12.000 ÷ 300.000 = **4,0 %**. Diese Zahl taugt nur, um in Sekunden auszusortieren. Grobe Orientierung beim aktuellen Zinsniveau: Unter etwa 4,5 % Bruttomietrendite wird positiver Cashflow ohne sehr hohen Eigenkapitaleinsatz schwierig, ab rund 5,5 % wird es realistischer. In B- und C-Lagen sind 6 bis 7 % möglich.\n\n**2. Nettomietrendite – näher an der Wahrheit**\n\nHier ziehst du Kaufnebenkosten und nicht umlagefähige Bewirtschaftungskosten ab. Die Kaufnebenkosten liegen je nach Bundesland bei rund 9 bis 12 % (Grunderwerbsteuer 3,5 % in Bayern und Sachsen bis 6,5 % in NRW oder Brandenburg, Notar und Grundbuch ca. 1,5 bis 2 %, Makler bei geteilter Courtage oft 3,57 % inkl. Mehrwertsteuer). Aus einem Kaufpreis von 300.000 Euro werden so schnell 333.000 Euro Gesamtinvestition – und genau diese 33.000 Euro vergisst der typische Anfängerrechner.\n\n**3. Kaufpreisfaktor (Vervielfältiger)**\n\nKaufpreisfaktor = Kaufpreis ÷ Jahreskaltmiete. Er ist der Kehrwert der Bruttomietrendite und das schnellste Bauchgefühl-Maß. Faktor 25 bedeutet 4,0 % Bruttorendite, Faktor 22 rund 4,5 %, Faktor 18 rund 5,6 %. Für Cashflow-Objekte solltest du tendenziell unter Faktor 22 suchen; in Top-Lagen wie München liegt der Faktor oft bei 30 bis 35 – dort gibt es praktisch keinen positiven Cashflow, sondern nur eine Wette auf Wertsteigerung.\n\n**4. Der DSCR – und der Denkfehler, der dahintersteckt**\n\nDer Debt Service Coverage Ratio (DSCR) kommt aus dem professionellen Immobiliengeschäft: **Nettomieteinnahmen nach Bewirtschaftung ÷ Kapitaldienst**. Entscheidend ist, was du als Kapitaldienst ansetzt – und hier liegt ein Missverständnis, das in fast jedem Privatanleger-Ratgeber steckt:\n\n• **DSCR auf die Zinslast** (Zinsdeckungsgrad): Deckt die Miete die Zinsen der Bank? Das interessiert vor allem den Kreditgeber. Hier reichen schon Werte deutlich über 1,0.\n\n• **DSCR auf die volle Annuität** (Zins + Tilgung): Deckt die Miete deinen kompletten Kreditdienst? Erst **ein DSCR von 1,0 auf die Annuität bedeutet, dass sich das Objekt aus Liquiditätssicht selbst trägt.**\n\nWarum das wichtig ist, siehst du gleich an den Beispielen: Eine Wohnung kann einen komfortablen Zinsdeckungsgrad von 1,3 haben – und trotzdem jeden Monat Geld kosten, weil die Tilgung obendrauf kommt. Wenn du nur eine Zahl im Kopf behalten willst, dann den DSCR auf die volle Annuität. Werte ab 1,1 geben dir zusätzlich Puffer für Leerstand und steigende Anschlusszinsen."}, {"heading": "Die vollständige Cashflow-Rechnung an zwei Beispielen", "body": "Nehmen wir eine realistische 3-Zimmer-Eigentumswohnung, 70 m², in einer soliden mittelgroßen Stadt (B-Lage). Wir rechnen einmal komplett durch – genau diese Posten musst du immer ansetzen.\n\nJetzt die Finanzierung. Annahme: 20.000 Euro Eigenkapital fließen in die Nebenkosten, finanziert werden 256.250 Euro (Kaufpreis plus die restlichen 6.250 Euro Nebenkosten). Zinssatz 3,8 %, anfängliche Tilgung 2,0 % – ein realistisches Szenario im aktuellen Markt.\n\nDas ist das typische Ergebnis bei 4 % Bruttorendite und 2 % Tilgung: Die Wohnung kostet dich 521 Euro im Monat. Sie trägt sich klar nicht selbst. Der DSCR auf die Annuität liegt bei nur 0,58, auf die reine Zinslast bei 0,89 – sogar die Zinsen sind aus der Miete allein nicht voll gedeckt.\n\nUnd das, obwohl rund 427 Euro der Annuität reine Tilgung sind – also in dein eigenes Vermögen fließen. Auf Vermögensebene baust du auf, im monatlichen Geldbeutel zahlst du drauf. Diese Trennung ist der wichtigste Reflex eines erfahrenen Anlegers (zur 10-Jahres-Sicht weiter unten).\n\n**Was den Hebel umlegt: dieselbe Wohnung in einer C-Lage**\n\nJetzt dasselbe Objekt, aber gekauft für 175.000 Euro bei identischer Miete (Faktor 17,5, Bruttorendite 5,7 %). Finanzierungssumme nach 20.000 Euro Eigenkapital rund 173.400 Euro, gleiche Konditionen.\n\nSchon viel näher an der Null – allein der niedrigere Kaufpreisfaktor (17,5 statt 25) hat den monatlichen Zuschuss von 521 auf 120 Euro gedrückt. Der DSCR auf die Zinslast liegt hier bei komfortablen 1,31, der DSCR auf die volle Annuität aber erst bei 0,86. Genau deshalb fühlt sich das Objekt „fast selbsttragend“ an, ist es vor Steuer aber noch nicht ganz.\n\n**Wo liegt die echte Nulllinie?** Bei diesen Konditionen wird der Netto-Cashflow vor Steuer erst um **Faktor 15** herum positiv (dann liegt der DSCR auf die Annuität bei rund 1,0). Das ist die wichtigste Korrektur an einer verbreiteten Faustregel: „Unter Faktor 18 trägt sich das schon“ stimmt vor Steuer in der Regel nicht. Es stimmt erst, wenn du die Steuerwirkung einrechnest – und auch das nur bei hohem Grenzsteuersatz.\n\n**Was die Steuer wirklich bringt (und was nicht)**\n\nBleiben wir beim 175.000-Euro-Objekt und einem Anleger mit 42 % Grenzsteuersatz. Absetzbar sind die AfA, der Zinsanteil (nicht die Tilgung!) und die nicht umlagefähigen Kosten. Wichtig: Die AfA von 2 % gilt nur auf den **Gebäudeanteil**, nicht auf Grund und Boden. Bei einem realistischen Gebäudeanteil von 75 % sind das 2.625 Euro statt der oft fälschlich genannten 3.500 Euro.\n\n• AfA (2 % auf 131.250 € Gebäudeanteil): 2.625 €/Jahr\n\n• Zinsanteil Jahr 1: ca. 6.590 €/Jahr\n\n• nicht umlagefähige Kosten: ca. 1.380 €/Jahr\n\n• Werbungskosten gesamt: ca. 10.595 € gegenüber 10.000 € Mieteinnahmen\n\nDaraus ergibt sich ein steuerlicher Verlust von rund 595 Euro, die Steuerersparnis bei 42 % liegt also bei etwa 250 Euro im Jahr – gut **21 Euro im Monat**. Der Netto-Cashflow verbessert sich damit von −120 auf rund −99 Euro. Spürbar, aber das Objekt rutscht nicht in den klar positiven Bereich. Wer dir verspricht, die AfA mache aus jedem Minus-Cashflow ein Plus, rechnet entweder mit der falschen AfA-Basis oder mit einer noch günstigeren Wohnung. Die Steuer ist Feinjustierung, kein Rettungsanker.\n\n**Der zweite Hebel: 1,5 % statt 2 % Tilgung**\n\nSenkst du im ersten Beispiel (250.000 €) die Tilgung auf 1,5 %, sinkt die Annuität von 1.239 auf 1.132 Euro – der monatliche Zuschuss schrumpft um 107 Euro. Tilgung ist kein Verlust, sondern Sparen. Über den Cashflow entscheidest du also auch über die Frage: schnell entschulden oder Liquidität schonen? Beides ist legitim, aber du musst es bewusst steuern – und einkalkulieren, dass eine niedrigere Tilgung die Restschuld zur Anschlussfinanzierung größer lässt.\n\n**Der 10-Jahres-Vermögensblick: warum −521 Euro nicht das Ende der Geschichte sind**\n\nReine Cashflow-Betrachtung unterschlägt, was unter der Oberfläche passiert. Rechnen wir das B-Lage-Objekt (250.000 €) über zehn Jahre durch, bei 1,5 % jährlichem Wertzuwachs – eine bewusst vorsichtige Annahme:\n\nDu zahlst über zehn Jahre rund 82.400 Euro ein und stehst mit gut 102.000 Euro mehr Eigenkapital da – vor Steuer und vor Verkaufskosten, aber als Größenordnung aussagekräftig. Das ist die ehrliche Verteidigung eines moderat negativen Cashflows. **Die Grenze ist deine Liquidität:** 521 Euro im Monat musst du zehn Jahre lang sicher aufbringen können, auch bei Leerstand oder einer Sonderumlage. Genau deshalb ist und bleibt der Netto-Cashflow vor Steuer die Kennzahl, an der du dich beim Kauf orientierst – nicht der schöne Vermögensblick danach.", "table": {"headers": ["Über 10 Jahre", "Betrag"], "rows": [["Eingezahlt (20.000 € EK + 10 Jahre Zuschuss à ca. 6.240 €)", "ca. −82.400 €"], ["Getilgt (Schuldenabbau)", "+62.200 €"], ["Wertzuwachs (1,5 % p. a.)", "+40.100 €"], ["Vermögenseffekt", "+102.300 €"]]}}, {"heading": "Woran du Cashflow-Objekte schon im Exposé erkennst", "body": "Du musst nicht jede Anzeige durchrechnen. Mit drei Filtern siebst du 90 % aus, bevor du Zeit investierst:\n\n• **Kaufpreisfaktor unter 22** (Kaufpreis ÷ Jahreskaltmiete). Steht die Miete nicht im Exposé, nimm 11 bis 13 €/m² als Annahme für die Region – bei einfachen Lagen eher weniger.\n\n• **Realistische Ist-Miete, kein Wunschdenken.** Vorsicht bei „Mietpotenzial nach Sanierung“ und bei möblierten Premium-Mieten – rechne immer mit der heute dauerhaft erzielbaren Kaltmiete.\n\n• **Keine versteckte Sanierungsbombe.** Baujahr vor 1978 ohne energetische Modernisierung, hohe Heizkosten, anstehende Fassaden- oder Dacharbeiten laut Protokoll der Eigentümerversammlung – das frisst die Rücklage und kann eine Sonderumlage von mehreren Tausend Euro bedeuten. Lass dir Protokolle und Höhe der Instandhaltungsrücklage vor dem Notartermin zeigen.\n\nDiese Faktoren – Rendite, Finanzierbarkeit, Risiko, Lage und Energie – greifen ineinander. Eine 7-%-Wohnung in einer schrumpfenden Region mit Ölheizung kann unterm Strich riskanter sein als eine 5-%-Wohnung in einer wachsenden Stadt. Genau diese fünf Dimensionen auf einen Score zu verdichten, ist die Idee hinter dem kostenlosen **ImmoScorer**: Du gibst Kaufpreis, Miete und Eckdaten ein und siehst in Sekunden, ob ein Objekt das Zeug zur Cashflow-Immobilie hat – prüfe dein nächstes Exposé jetzt kostenlos, bevor du eine Besichtigung buchst."}, {"heading": "Die drei häufigsten Rechenfehler", "body": "• **Kaufnebenkosten vergessen.** Rund 10 % auf den Kaufpreis fehlen sonst in jeder Rendite. Sie sind nicht abschreibbar (außer der anteilige Notar-/Grundbuchteil, der dem Gebäude zugeordnet wird) und meist Eigenkapital.\n\n• **Umlagefähige und nicht umlagefähige Kosten verwechseln.** Heizung, Wasser, Müll trägt der Mieter. Verwaltung, Instandhaltungsrücklage und dein Mietausfallrisiko trägst du – und nur die gehören in den Cashflow.\n\n• **Mit dem Bestzins und mit Tilgung als Kosten gleichzeitig kalkulieren.** Rechne 0,2 bis 0,3 Prozentpunkte Zinsaufschlag ein und teste, ob das Objekt auch bei einer Anschlussfinanzierung zu 5 % noch trägt. Wer nur beim heutigen Zins rechnet, baut auf Sand."}, {"heading": "Fazit", "body": "Cashflow-Immobilien finden ist keine Glückssache, sondern eine Frage des Kaufpreisfaktors und einer ehrlichen Vollkostenrechnung. Die Bruttomietrendite ist nur der Türsteher; entscheiden tun Nettorechnung, der DSCR auf die volle Annuität und die nicht umlagefähigen Kosten. Als Faustregel beim aktuellen Zinsniveau gilt: Unter Faktor 22 wird es überhaupt interessant, und erst um Faktor 15 herum trägt sich ein Objekt vor Steuer aus eigener Kraft – bei hohem Grenzsteuersatz und etwas Eigenkapital rückt diese Schwelle Richtung Faktor 17 bis 18. Den Rest macht Disziplin beim Durchrechnen – und das konsequente Aussortieren der 90 %, die nur nach Schnäppchen aussehen."}], "faq": [{"question": "Wie viel Cashflow pro Wohnung ist realistisch?", "answer": "Bei sauber ausgewählten Objekten in B- und C-Lagen sind 50 bis 150 Euro Netto-Cashflow vor Steuer pro Monat und Wohnung ein guter, erreichbarer Wert. Wer mit 300 Euro plus pro Einheit kalkuliert, sollte die Annahmen (Miete, Rücklage, Leerstand, Zins) sehr kritisch prüfen – meist ist eine Position deutlich zu optimistisch angesetzt."}, {"question": "Welcher Kaufpreisfaktor ist gut für Cashflow?", "answer": "Faustregel beim aktuellen Zinsniveau: Faktor unter 22 ist die Eintrittsschwelle, um Faktor 15 wird der Cashflow vor Steuer meist positiv, ab 14 bis 16 ist es ein starkes Renditeobjekt. Dann aber genau prüfen, warum es so günstig ist (Lage, Zustand, Mietstruktur, anstehende Sanierungen)."}, {"question": "Trägt sich eine Immobilie auch ganz ohne Eigenkapital selbst?", "answer": "Bei einer 110-%-Finanzierung (Kaufpreis plus Nebenkosten) ist die Kreditsumme und damit die Annuität höher, positiver Cashflow vor Steuer gelingt dann fast nur bei Faktor unter 15 bis 16. Schon 20.000 Euro Eigenkapital für die Nebenkosten senken die Kreditsumme spürbar und kippen die Rechnung oft näher Richtung Plus. Ganz ohne Eigenkapital ist möglich, aber Bonität und Objekt müssen erstklassig sein, und du verzichtest auf jeden Puffer."}, {"question": "Zählt die Tilgung als Kosten?", "answer": "Für den reinen Cashflow ja, weil sie deine Liquidität bindet. Wirtschaftlich ist sie aber Vermögensaufbau, kein Verlust – du tauschst Geld gegen Schuldenabbau. Deshalb betrachten erfahrene Anleger immer beide Sichten getrennt: den Cashflow (Liquidität heute) und Tilgung plus Wertentwicklung (Vermögen morgen). Steuerlich ist übrigens nur der Zinsanteil der Rate absetzbar, die Tilgung nicht."}, {"question": "Bringt die AfA wirklich so viel Steuerersparnis?", "answer": "Weniger, als oft behauptet. Die lineare AfA beträgt bei Bestandsimmobilien ab Baujahr 1925 nur 2 % pro Jahr (2,5 % bei älteren Gebäuden, 3 % bei Neubauten mit Fertigstellung ab 2023) – und das nur auf den Gebäudeanteil, nicht auf Grund und Boden. Bei einem 175.000-Euro-Objekt mit 75 % Gebäudeanteil sind das rund 2.625 Euro im Jahr; bei 42 % Grenzsteuersatz bringt der Verlust aus AfA, Zinsen und Kosten gut 20 Euro Cashflow-Verbesserung pro Monat. Hilfreich, aber kein Ersatz für einen niedrigen Kaufpreisfaktor."}]},
{"slug": "kaufpreisfaktor-anlageimmobilie-zu-teuer", "title": "Kaufpreisfaktor: Wann ist eine Immobilie zu teuer?", "seoTitle": "Kaufpreisfaktor: Wann ist eine Immobilie zu teuer?", "metaDescription": "Kaufpreisfaktor einfach erklärt: guter Vervielfältiger, Umrechnung in Rendite, Break-even-Formel und ab wann eine Anlageimmobilie zu teuer ist. Jetzt prüfen.", "summary": "Kaufpreisfaktor einfach erklärt: guter Vervielfältiger, Umrechnung in Rendite, Break-even-Formel und ab wann eine Anlageimmobilie zu teuer ist. Jetzt ", "readMinutes": 10, "publishedAt": "2026-06-16", "updatedAt": "2026-06-16", "sections": [{"heading": "Was der Kaufpreisfaktor genau aussagt", "body": "Der Kaufpreisfaktor (auch Vervielfältiger oder Mietpreismultiplikator) setzt den Kaufpreis ins Verhältnis zur Jahresnettokaltmiete. Die Formel lautet:\n\n**Kaufpreisfaktor = Kaufpreis ÷ Jahresnettokaltmiete**\n\nEin Beispiel: Eine Wohnung kostet 300.000 Euro und wird für 1.000 Euro netto kalt pro Monat vermietet. Die Jahresnettokaltmiete beträgt 12.000 Euro. Der Kaufpreisfaktor liegt damit bei 300.000 ÷ 12.000 = **25**. Anders ausgedrückt: Sie zahlen 25 Jahresmieten für das Objekt. Rein rechnerisch dauert es 25 Jahre, bis sich der Kaufpreis allein über die Mieteinnahmen amortisiert hat, und zwar vor Kosten, Steuern und Mietsteigerungen.\n\nWichtig ist der Begriff nettokalt: Es zählt ausschließlich die reine Grundmiete ohne Betriebskosten, Heizung und sonstige Umlagen. Wer versehentlich die Warmmiete einsetzt, rechnet sich den Faktor künstlich schön und unterschätzt den Preis um schnell 20 bis 30 Prozent.\n\n**Der direkte Draht zur Bruttorendite**\n\nKaufpreisfaktor und Bruttomietrendite sind zwei Seiten derselben Medaille. Sie sind exakt der Kehrwert voneinander:\n\n**Bruttorendite (%) = 100 ÷ Kaufpreisfaktor**\n\nDas ist praktisch, weil Sie jeden Faktor sofort in eine Rendite übersetzen können, ohne neu zu rechnen:\n\nDie Logik in einem Satz: Je **höher** der Faktor, desto **niedriger** die Rendite und desto teurer die Immobilie im Verhältnis zur Miete. Ein Faktor von 40 bedeutet eine magere Bruttorendite von 2,5 Prozent. Davon sind Bewirtschaftungskosten und Zinsen noch nicht abgezogen.", "table": {"headers": ["Kaufpreisfaktor", "Entspricht Bruttorendite", "Einordnung"], "rows": [["16,7", "6,0 %", "sehr günstig (B-/C-Lagen, Ostdeutschland)"], ["20", "5,0 %", "solide, marktüblich in vielen Mittelstädten"], ["25", "4,0 %", "gehobenes Niveau, gute Lagen"], ["30", "3,3 %", "teuer, typisch für A-Städte"], ["40", "2,5 %", "Spitzenlage, sehr ambitioniert"]]}}, {"heading": "Welcher Kaufpreisfaktor ist gut, welcher zu teuer?", "body": "Eine pauschale Grenze gibt es nicht, denn der vertretbare Faktor hängt von Lage, Zinsniveau und Wachstumserwartung ab. Als historische Faustregel galt lange: Bis Faktor 20 ist eine Immobilie günstig, ab 25 wird es ambitioniert. In den Niedrigzinsjahren 2015 bis 2021 wurden in Metropolen Faktoren von 35 bis weit über 40 bezahlt, weil Kredite quasi nichts kosteten und erwartete Wertsteigerungen die niedrige laufende Rendite kompensierten.\n\nMit dem Zinsanstieg ab 2022 hat sich das gedreht. Bei Finanzierungszinsen, die sich Mitte 2026 für vermietete Objekte je nach Bonität und Beleihung meist im Bereich von rund 3,7 bis 4,2 Prozent bewegen, funktioniert die Kalkulation nur noch, wenn die Bruttorendite in der Nähe des Zinssatzes oder darüber liegt. Konkret: Ein Objekt mit Faktor 30 (3,3 Prozent Bruttorendite), das zu 4 Prozent finanziert wird, erwirtschaftet aus eigener Kraft keinen positiven Cashflow mehr, denn die laufenden Kosten übersteigen die Miete. Sie zahlen jeden Monat drauf.\n\n**Regionale Orientierungswerte**\n\nDie folgenden Spannen geben eine realistische Größenordnung für Bestandswohnungen wieder. Sie ersetzen keine konkrete Objektbewertung, helfen aber bei der ersten Einordnung:\n\nDie Logik dahinter: In Hochpreisstädten akzeptieren Käufer höhere Faktoren, weil sie auf stabile Nachfrage, geringes Mietausfallrisiko und langfristige Wertsteigerung setzen. In strukturschwachen Regionen gibt es die hohe Rendite nur, weil das Risiko von Leerstand und Wertverlust entsprechend größer ist. Ein niedriger Faktor ist also nicht automatisch ein gutes Geschäft, sondern oft eine Risikoprämie, für die der Markt Sie entschädigt.", "table": {"headers": ["Lagetyp", "Typischer Faktor", "Bruttorendite"], "rows": [["A-Städte (München, Hamburg, Frankfurt)", "28–38", "2,6–3,6 %"], ["B-Städte (Leipzig, Hannover, Nürnberg, Essen)", "22–28", "3,6–4,5 %"], ["C-/D-Städte und Umland", "16–22", "4,5–6,3 %"], ["Strukturschwache Regionen", "10–16", "6,3–10 %"]]}}, {"heading": "Die Break-even-Formel: Welcher Faktor trägt sich?", "body": "Statt sich auf gefühlte Faustregeln zu verlassen, können Sie den maximal tragbaren Kaufpreisfaktor direkt aus Ihrem Finanzierungszins ableiten. Die Bedingung für ein Objekt, das sich aus eigener Kraft trägt, ist denkbar einfach: Die Nettomietrendite sollte mindestens den Kreditzins erreichen. Daraus folgt ein Grenzwert, den wir hier als Break-even-Faktor bezeichnen:\n\n**Break-even-Faktor ≈ (1 − Bewirtschaftungsquote) ÷ Zinssatz**\n\nRechnen wir das mit realistischen Werten durch. Bei einer Bewirtschaftungsquote von 20 Prozent (also 0,2 für nicht umlagefähige Kosten, Verwaltung und Instandhaltungsrücklage) und einem Zins von 4,0 Prozent ergibt sich: (1 − 0,2) ÷ 0,04 = **20**. Das heißt: Bei 4 Prozent Zins trägt sich ein Objekt erst ab einem Bruttofaktor von etwa 20 oder darunter selbst. Bei 3,5 Prozent Zins verschiebt sich die Grenze auf 0,8 ÷ 0,035 ≈ 23, bei 4,5 Prozent sinkt sie auf 0,8 ÷ 0,045 ≈ 18.\n\nDiese Zahl ist keine Investmentempfehlung, sondern eine Tilgungs-neutrale Cashflow-Grenze: Oberhalb des Break-even-Faktors müssen entweder hohes Eigenkapital, steigende Mieten oder Wertzuwachs die Lücke schließen. Unterhalb davon trägt die Miete die Finanzierung. Genau deshalb sind in einem 4-Prozent-Zinsumfeld Faktoren über 25 nur mit klarer Wachstumsperspektive vertretbar, was die historische Faustregel bestätigt, aber sauber begründet.\n\n**Rückwärts gerechnet: der maximale Kaufpreis**\n\nDie Formel lässt sich auch umdrehen, um Ihr Maximalgebot zu bestimmen. Sie wollen mindestens 4,5 Prozent Bruttorendite, die Wohnung bringt 12.000 Euro Jahresnettokaltmiete? Dann ist Ihr Zielfaktor 100 ÷ 4,5 ≈ 22, und Ihr maximaler Kaufpreis liegt bei 22 × 12.000 = **264.000 Euro**. Jeder Euro darüber drückt die Rendite unter Ihre Schwelle. So verwandeln Sie eine vage Preisvorstellung in eine harte Verhandlungsgrenze."}, {"heading": "Wann ist die Immobilie zu teuer? Drei Rechenbeispiele", "body": "Ob ein Faktor zu hoch ist, entscheidet sich erst im Zusammenspiel mit Zins und Kosten. Die folgenden drei Fälle zeigen identische Wohnungen mit 70 Quadratmetern und derselben Miete, aber unterschiedlichen Kaufpreisen. Als Finanzierungszins setzen wir durchgehend 4,0 Prozent an.\n\n**Beispiel 1: Solides Objekt, Faktor 20**\n\n• Kaufpreis: 240.000 Euro\n\n• Jahresnettokaltmiete: 12.000 Euro (1.000 Euro/Monat)\n\n• **Kaufpreisfaktor: 20** → Bruttorendite 5,0 %\n\nZieht man rund 20 Prozent für Bewirtschaftung und Instandhaltungsrücklage ab, bleibt eine Nettomietrendite von etwa 4,0 Prozent. Damit liegt die Rendite genau auf dem Kreditzins, das Objekt erreicht seinen Break-even. Es trägt sich und ist nicht zu teuer. Jede Mietsteigerung oder jeder Prozentpunkt Eigenkapital schiebt es in den positiven Cashflow.\n\n**Beispiel 2: A-Lage, Faktor 32**\n\n• Kaufpreis: 384.000 Euro\n\n• Jahresnettokaltmiete: 12.000 Euro\n\n• **Kaufpreisfaktor: 32** → Bruttorendite 3,1 %\n\nNach Bewirtschaftungskosten bleibt eine Nettorendite von rund 2,5 Prozent. Bei 4,0 Prozent Zins entsteht eine laufende Unterdeckung von etwa 1,5 Prozentpunkten. Auf den Einstandspreis bezogen sind das grob 5.700 Euro, die Sie pro Jahr zuschießen, bevor überhaupt getilgt wurde. Die Immobilie rechnet sich nur, wenn Sie auf kräftige Mietsteigerungen oder Wertzuwachs spekulieren. Für einen reinen Cashflow-Anleger ist dieses Objekt im aktuellen Zinsumfeld zu teuer.\n\n**Beispiel 3: Vermeintliches Schnäppchen, Faktor 14**\n\n• Kaufpreis: 168.000 Euro\n\n• Jahresnettokaltmiete: 12.000 Euro\n\n• **Kaufpreisfaktor: 14** → Bruttorendite 7,1 %\n\nAuf dem Papier hervorragend, weit über dem Break-even. Doch die hohe Rendite hat fast immer einen Grund: schrumpfende Region, sanierungsbedürftige Bausubstanz oder eine schwache Energieklasse, die teure Nachrüstungen und Preisabschläge mit sich bringt. Stehen 30.000 Euro Sanierung an und steht die Wohnung phasenweise leer, steigt der reale Faktor auf 198.000 ÷ (12.000 − Mietausfall) schnell auf 18 bis 20, und die Traumrendite schmilzt zusammen. Ein niedriger Faktor ist eine Einladung zur genaueren Prüfung, kein Freibrief."}, {"heading": "Die Grenzen des Kaufpreisfaktors", "body": "So nützlich die Kennzahl für den ersten Filter ist, sie blendet entscheidende Faktoren aus. Verlassen Sie sich nie allein auf sie.\n\n**Was der Faktor ignoriert**\n\n• **Kaufnebenkosten:** Grunderwerbsteuer (je nach Bundesland 3,5 Prozent in Bayern bis 6,5 Prozent in NRW, Brandenburg, dem Saarland und Schleswig-Holstein), Notar, Grundbuch und gegebenenfalls Makler erhöhen den realen Einstandspreis um rund 8 bis 15 Prozent. Ihr effektiver Faktor ist also höher als der beworbene.\n\n• **Bewirtschaftungskosten:** Nicht umlagefähige Kosten wie Verwaltung, Instandhaltung und das Mietausfallrisiko reduzieren die Rendite spürbar. Der Bruttofaktor rechnet mit der vollen Miete, nicht mit dem, was real übrig bleibt.\n\n• **Zustand und Energie:** Eine sanierte Wohnung mit Energieeffizienzklasse B verdient einen höheren Faktor als ein unsaniertes Objekt mit Klasse F oder G, das absehbar Investitionen erfordert (dazu unten mehr).\n\n• **Mietpotenzial:** Liegt die aktuelle Miete deutlich unter dem Mietspiegel, sinkt der reale Faktor mit jeder künftigen Anpassung. Eine Immobilie mit Faktor 28 bei eingefrorener Altmiete kann besser sein als Faktor 22 bei bereits ausgereizter Miete.\n\n**Energieklasse: kein pauschaler Sanierungszwang, aber harte Preisrelevanz**\n\nRund um schwache Energieklassen kursieren viele Halbwahrheiten, deshalb hier die saubere Einordnung. Ein pauschaler, klassenbasierter Sanierungszwang für selbst genutzte oder vermietete Wohngebäude existiert in Deutschland nicht. Die in der EU-Gebäuderichtlinie (EPBD) von 2024 beschlossenen Mindeststandards für die energetisch schlechtesten Gebäude (sogenannte Worst Performing Buildings) gelten verpflichtend zunächst nur für **Nichtwohngebäude**. Trotzdem ist die Energieklasse für Anleger aus drei Gründen hochrelevant:\n\n• **Pflichten beim Eigentümerwechsel:** Das Gebäudeenergiegesetz (GEG) löst beim Kauf konkrete Nachrüstpflichten aus, die innerhalb von zwei Jahren umzusetzen sind, etwa der Austausch von Konstanttemperaturkesseln, die älter als 30 Jahre sind, die Dämmung der obersten Geschossdecke und die Dämmung von Heizungsrohren in unbeheizten Räumen.\n\n• **Preisabschläge:** Objekte mit schlechter Energiebilanz werden am Markt sichtbar günstiger gehandelt; für Klasse D und schlechter sind Abschläge von bis zu rund 30 Prozent gegenüber sanierten Vergleichsobjekten dokumentiert.\n\n• **Finanzierung:** Banken berücksichtigen die Energieeffizienzklasse zunehmend bei Konditionen und Beleihung. Ein Sanierungsfall kann also teurer in der Finanzierung und schwerer wieder verkäuflich sein.\n\nFür die Faktor-Bewertung heißt das: Ein niedriger Faktor bei Klasse G ist kein Schnäppchen, sondern oft die eingepreiste Erwartung künftiger Investitionen.\n\n**Brutto- versus Nettokaufpreisfaktor**\n\nProfis und Gutachter rechnen häufig mit dem **Nettokaufpreisfaktor**, der die Kaufnebenkosten in den Kaufpreis und die Bewirtschaftungskosten in die Miete einbezieht. Greifen wir Beispiel 2 noch einmal auf: 384.000 Euro Kaufpreis plus 11 Prozent Nebenkosten ergeben einen Einstand von 426.240 Euro. Bei einer um 20 Prozent reduzierten Nettomiete von 9.600 Euro steigt der echte Faktor von 32 auf rund **44**. Erst diese Zahl zeigt, wie teuer das Objekt wirklich ist.\n\nVerwandt damit ist der **Liegenschaftszinssatz**, mit dem Gutachter im Ertragswertverfahren die Marktverzinsung einer Region abbilden. Vereinfacht entspricht er der Nettorendite, die der Markt für eine bestimmte Lage und Objektart akzeptiert. Liegt Ihre errechnete Nettorendite spürbar unter dem örtlichen Liegenschaftszins, zahlen Sie mehr als den ertragsorientierten Verkehrswert."}, {"heading": "Vom Faktor zur fundierten Entscheidung", "body": "Der Kaufpreisfaktor ist ein exzellenter Schnelltest, um offensichtlich überteuerte Angebote auszusortieren. Als belastbare Faustregel für das aktuelle Zinsumfeld gilt: Ein Faktor unter 20 ist in den meisten Lagen attraktiv, zwischen 20 und 25 marktüblich, über 28 nur bei klarer Wachstumsperspektive vertretbar. Den exakten Grenzwert liefert Ihnen die Break-even-Formel aus Ihrem persönlichen Zinssatz. Für eine echte Kaufentscheidung müssen Sie aber Nebenkosten, Zustand, Energieklasse, Finanzierung und Mietpotenzial zusammen betrachten.\n\nGenau diese Verdichtung übernimmt der kostenlose ImmoScorer für Sie: Geben Sie Kaufpreis und Miete ein, und Sie erhalten in Sekunden einen ganzheitlichen Score aus Rendite, Risiko, Finanzierbarkeit, Lage und Energie, inklusive Einordnung, ob das Objekt zu teuer ist. So sehen Sie auf einen Blick, ob hinter einem verlockenden Faktor wirklich ein gutes Investment steckt, ganz ohne Anmeldung."}], "faq": [{"question": "Ist ein niedriger Kaufpreisfaktor immer besser?", "answer": "Nein. Ein niedriger Faktor bedeutet zunächst nur eine hohe Bruttorendite. Diese ist in der Regel eine Risikoprämie für strukturschwache Lagen, schlechte Bausubstanz oder Leerstandsrisiken. Ein Faktor von 14 in einer schrumpfenden Region kann unterm Strich ein schlechteres Geschäft sein als ein Faktor von 24 in einer wachsenden Stadt mit Wertsteigerungspotenzial."}, {"question": "Wie rechne ich den Faktor in eine Rendite um?", "answer": "Teilen Sie 100 durch den Kaufpreisfaktor. Faktor 20 entspricht 5,0 Prozent Bruttorendite (100 ÷ 20), Faktor 25 entspricht 4,0 Prozent und Faktor 33 rund 3,0 Prozent. Beachten Sie, dass dies die Bruttorendite ist. Nach Bewirtschaftungskosten liegt die Nettorendite meist 0,5 bis 1,5 Prozentpunkte niedriger."}, {"question": "Welcher Kaufpreisfaktor ist 2026 noch tragbar?", "answer": "Das hängt vom Finanzierungszins ab. Über die Break-even-Formel (1 minus Bewirtschaftungsquote, geteilt durch den Zinssatz) ergibt sich bei rund 4 Prozent Zins und 20 Prozent Bewirtschaftung eine Grenze von etwa Faktor 20, ab der sich ein Objekt selbst trägt. Faktoren bis 22 bis 24 sind damit in der Regel unproblematisch. Höhere Faktoren erfordern entweder viel Eigenkapital oder eine begründete Erwartung steigender Mieten und Werte."}, {"question": "Gilt der Kaufpreisfaktor auch für Häuser und Gewerbe?", "answer": "Grundsätzlich ja, die Formel ist identisch. Bei Gewerbeimmobilien sind die Faktoren wegen kürzerer Mietverträge und höherer Leerstandsrisiken meist niedriger (häufig 13 bis 18). Bei Ein- und Zweifamilienhäusern als Kapitalanlage liegen die Faktoren oft höher, weil ein Teil des Preises auf den Grundstücks- und Eigennutzerwert entfällt und nicht durch die Miete gedeckt ist."}]},
{"slug": "mietrendite-berechnen", "title": "Mietrendite berechnen: Brutto, Netto & EK-Rendite", "seoTitle": "Mietrendite berechnen: Brutto, Netto & EK-Rendite", "metaDescription": "Mietrendite berechnen mit Formeln, durchgerechnetem Zwei-Objekt-Beispiel und Richtwerten: Brutto, Netto, Eigenkapital. Immobilie jetzt kostenlos prüfen.", "summary": "Mietrendite berechnen mit Formeln, durchgerechnetem Zwei-Objekt-Beispiel und Richtwerten: Brutto, Netto, Eigenkapital. Immobilie jetzt kostenlos prüfe", "readMinutes": 11, "publishedAt": "2026-06-16", "updatedAt": "2026-06-16", "sections": [{"heading": "Warum es nicht „die\" Mietrendite gibt", "body": "„Mietrendite\" klingt nach einer einzigen Zahl, ist aber ein Sammelbegriff für mehrere Kennzahlen, die jeweils etwas anderes messen. Der rote Faden: Je mehr reale Kosten Sie einrechnen, desto niedriger – und desto ehrlicher – wird der Wert. Die Rendite im Inserat ist fast immer die **Bruttorendite**, also der schmeichelhafteste Fall. Sie ignoriert Kaufnebenkosten und laufende Bewirtschaftung und liegt deshalb fast immer über dem, was real bei Ihnen ankommt.\n\nDrei Kennzahlen beantworten drei unterschiedliche Fragen:\n\n• **Bruttorendite** – Lohnt sich ein zweiter Blick auf dieses Objekt überhaupt? (Schnellfilter)\n\n• **Nettorendite** – Was erwirtschaftet das Objekt nach allen Kosten wirklich? (Kaufentscheidung)\n\n• **Eigenkapitalrendite** – Wie stark verzinst sich mein tatsächlich eingesetztes Geld? (Vermögensaufbau)\n\nWer nur eine davon betrachtet, entscheidet mit halben Informationen. Eine saubere Mietrenditeberechnung rechnet alle drei – denn jede einzelne kann in die Irre führen, wenn man die anderen beiden ausblendet."}, {"heading": "Bruttorendite: der 10-Sekunden-Filter", "body": "Die Bruttorendite setzt die Jahreskaltmiete ins Verhältnis zum Kaufpreis. Sie ist bewusst grob – ihr einziger Zweck ist das schnelle Aussortieren uninteressanter Inserate, bevor Sie Zeit in eine Detailrechnung stecken.\n\n**Bruttorendite = (Jahreskaltmiete ÷ Kaufpreis) × 100**\n\nBeispiel: Eine Wohnung kostet 320.000 € und bringt 1.150 € Kaltmiete im Monat, also 13.800 € im Jahr. Die Bruttorendite beträgt (13.800 ÷ 320.000) × 100 = **4,31 %**. Diese Wohnung begleitet uns weiter unten als „Objekt A\".\n\nEntscheidend ist, was die Bruttorendite nicht enthält: keine Kaufnebenkosten, kein nicht umlagefähiges Hausgeld, keine Instandhaltung, kein Mietausfallrisiko. Sie überschätzt die echte Wirtschaftlichkeit damit fast immer um rund einen bis zwei Prozentpunkte. Als Daumenregel gilt: Liegt die Bruttorendite unter etwa 3,5 %, muss das Objekt durch herausragende Lage oder konkretes Wertsteigerungspotenzial überzeugen – sonst trägt es sich rechnerisch kaum, sobald die Finanzierung dazukommt."}, {"heading": "Nettorendite: die Zahl, die über den Kauf entscheidet", "body": "Die Nettorendite ist die ehrliche Objektkennzahl. Sie zieht von der Jahreskaltmiete die nicht umlagefähigen Bewirtschaftungskosten ab und bezieht im Nenner zusätzlich die Kaufnebenkosten ein – also die volle Summe, die Sie tatsächlich investieren.\n\n**Nettorendite = ((Jahreskaltmiete − nicht umlagefähige Kosten) ÷ (Kaufpreis + Kaufnebenkosten)) × 100**\n\nGenau hier passiert der häufigste Einsteigerfehler: die Verwechslung von **umlagefähigen** und **nicht umlagefähigen** Kosten. Umlagefähige Kosten – Müll, Wasser, Hausmeister, Heizung, Grundsteuer – zahlt der Mieter über die Nebenkostenabrechnung. Für Ihre Rendite sind sie neutral: Sie dürfen sie weder von der Miete abziehen noch als Belastung verbuchen. Renditerelevant sind nur die Kosten, die an Ihnen hängen bleiben:\n\n• **Nicht umlagefähiges Hausgeld** – vor allem Verwaltervergütung und Zuführung zur Instandhaltungsrücklage bei Eigentumswohnungen (häufig 25–45 €/Monat)\n\n• **Instandhaltung** über die Rücklage hinaus – Faustwert 7–10 €/m²/Jahr im Bestand; bei energetisch alter Substanz eher mehr\n\n• **Mietausfallwagnis** – üblich 2–4 % der Jahreskaltmiete für Leerstand, Mietminderung und säumige Mieter\n\n• **Externe Verwaltung**, falls Sie nicht selbst verwalten (oft 20–35 €/Monat je Einheit)\n\nDie Kaufnebenkosten – Grunderwerbsteuer (je nach Bundesland 3,5–6,5 %), Notar und Grundbuch (rund 1,5–2 %) sowie ggf. Maklercourtage (bis ca. 3,57 %) – summieren sich auf etwa 8–15 % des Kaufpreises und gehören zwingend in den Nenner. Sonst rechnen Sie die Rendite auf einer Investitionssumme schön, die Sie nie hatten. In der Praxis liegt die Nettorendite dadurch typischerweise **1 bis 2 Prozentpunkte unter der Bruttorendite**.\n\n**Die Grenze der Nettorendite:** Sie bewertet das Objekt – aber nicht Ihre Finanzierung. Zwei Käufer mit identischer Wohnung, aber unterschiedlichem Eigenkapital und Zins haben dieselbe Nettorendite und trotzdem völlig verschiedene Ergebnisse. Genau diese Lücke schließt die dritte Kennzahl."}, {"heading": "Eigenkapitalrendite: der Hebel, der den Unterschied macht", "body": "Brutto- und Nettorendite bewerten das Objekt – die Eigenkapitalrendite (auch EK-Rendite oder Return on Equity) bewertet Ihre Investition. Sie misst, wie stark sich das Geld verzinst, das Sie wirklich aus eigener Tasche eingesetzt haben. Und sie erklärt, warum sich Immobilien trotz scheinbar magerer Nettorenditen lohnen können: durch den **Finanzierungshebel** (Leverage).\n\n**Eigenkapitalrendite = (Jahresüberschuss nach Zins und Bewirtschaftung ÷ eingesetztes Eigenkapital) × 100**\n\nDer Mechanismus: Sie erwirtschaften die Mietrendite auf den gesamten Kaufpreis, zahlen Zinsen aber nur auf den fremdfinanzierten Teil. Solange die Objektrendite über dem Kreditzins liegt, hebt jeder geliehene Euro Ihre EK-Rendite nach oben. Bei moderatem Eigenkapital und solider Mietrendite sind so zweistellige Eigenkapitalrenditen möglich – obwohl die Nettorendite vielleicht nur bei 2,5 bis 3 % liegt.\n\nDaraus folgt eine der wichtigsten Faustregeln der Kapitalanlage – die **Hebel-Schwelle**:\n\n• **Nettorendite > Kreditzins** → der Hebel arbeitet für Sie, die EK-Rendite steigt mit jedem Prozentpunkt Fremdkapital.\n\n• **Nettorendite < Kreditzins** → der Hebel arbeitet gegen Sie, die EK-Rendite sinkt und kann negativ werden – Sie legen jeden Monat drauf.\n\n**Der Hebel wirkt also in beide Richtungen.** Spätestens für die Anschlussfinanzierung sollten Sie deshalb ein Szenario mit zwei bis drei Prozentpunkten höheren Zinsen durchrechnen – sonst kippt ein heute knapp positives Objekt beim nächsten Zinsbindungsende ins Minus. Ein zweiter Stolperstein: In der EK-Renditeformel taucht die **Tilgung** bewusst nicht als Kosten auf. Tilgung ist kein Verlust, sondern Vermögensaufbau – Sie kaufen sich Stück für Stück aus dem Kredit frei. Für die Liquidität zählt sie trotzdem, weshalb man parallel immer den monatlichen Cashflow betrachtet, der Zins und Tilgung enthält."}, {"heading": "Die vier Kennzahlen im direkten Vergleich", "body": "Diese Übersicht zeigt auf einen Blick, was jede Kennzahl einbezieht und wofür sie taugt:\n\nDer **Kaufpreisfaktor** (Kaufpreis ÷ Jahreskaltmiete) ist der Kehrwert der Bruttorendite und sagt, wie viele Jahreskaltmieten der Kaufpreis kostet. Er ist die schnellste Preisampel überhaupt: Faktor 20 entspricht rund 5 % Bruttorendite, Faktor 25 etwa 4 %, Faktor 33 nur noch 3 %. Je niedriger, desto günstiger eingekauft – in gefragten A-Städten sind heute aber selbst Faktoren von 28–35 normal, in C-Lagen oft 15–20.", "table": {"headers": ["Kennzahl", "Berücksichtigt", "Wofür", "Typischer Bereich"], "rows": [["Bruttorendite", "nur Kaltmiete & Kaufpreis", "Schnellfilter", "3–8 %"], ["Nettorendite", "+ Kaufnebenkosten & Bewirtschaftung", "Kaufentscheidung", "2–6 %"], ["Eigenkapitalrendite", "+ Finanzierung (Hebel)", "Vermögensaufbau", "5–15 %+"], ["Kaufpreisfaktor", "Kaufpreis ÷ Jahreskaltmiete", "schnelle Preisampel", "15–35"]]}}, {"heading": "Rechenbeispiel: zwei Objekte, eine Entscheidung", "body": "Jetzt wird es konkret. Sie haben **80.000 € Eigenkapital** und zwei Angebote auf dem Tisch. In beiden Fällen finanzieren Sie nach demselben Prinzip: Die Kaufnebenkosten plus eine Anzahlung von 20.000 € auf den Kaufpreis kommen aus Eigenkapital, der Rest läuft über ein Annuitätendarlehen zu 4,0 % Sollzins. Objekt A ist die teure B-Stadt-Wohnung von oben, Objekt B eine günstigere Wohnung in einer C-Lage.\n\nSo sind die laufenden Kosten angesetzt: Bei Objekt A (rund 74 m²) sind 2.760 € im Jahr ungefähr 770 € Instandhaltung (≈ 10 €/m²), 500 € Mietausfallwagnis (≈ 3,6 %) und rund 1.490 € nicht umlagefähiges Hausgeld plus Verwaltung. Bei Objekt B liegen die 2.100 € anteilig ähnlich. Bewusst gewählt: Beide Käufe binden exakt 20.000 € Anzahlung auf den Kaufpreis – der Eigenkapitalunterschied (55.200 € vs. 40.350 €) entsteht allein aus den höheren Kaufnebenkosten des teureren Objekts.\n\nDas Ergebnis ist lehrreich. Nach der Bruttorendite wirkt Objekt B nur leicht besser (5,06 % vs. 4,31 %). Doch sobald die Finanzierung ins Spiel kommt, kippt das Bild deutlich: Bei Objekt A liegt die Nettorendite (3,11 %) unter dem Kreditzins (4,0 %) – die Hebel-Schwelle ist unterschritten, der Hebel wirkt negativ, die EK-Rendite rutscht ins Minus, und Sie schießen jeden Monat aus eigener Tasche zu. Bei Objekt B liegt die Nettorendite über dem Zins, der Hebel arbeitet für Sie, und es bleibt ein kleiner positiver Ertrag – plus die Tilgung, die als Vermögensaufbau obendrauf kommt. Derselbe Anleger, derselbe Topf Eigenkapital, derselbe Zins – und doch trennt die beiden Objekte ein Renditeunterschied von über drei Prozentpunkten auf das eingesetzte Geld.\n\n**Die Lehre:** Erst die Eigenkapitalrendite zeigt, ob sich ein Objekt mit Finanzierung rechnet. Objekt A kann sich trotzdem lohnen – aber nur, wenn man bewusst auf überdurchschnittliche Wertsteigerung der besseren Lage und auf Steuereffekte (AfA und Zinsabzug) setzt und den negativen Cashflow als kalkulierten Einsatz versteht. Ohne diese Perspektive ist ein Minus vor Tilgung ein klares Warnsignal, kein Schnäppchen.", "table": {"headers": ["Position", "Objekt A (B-Stadt)", "Objekt B (C-Lage)"], "rows": [["Kaufpreis", "320.000 €", "185.000 €"], ["Kaltmiete / Monat", "1.150 €", "780 €"], ["Jahreskaltmiete", "13.800 €", "9.360 €"], ["Kaufnebenkosten (ca. 11 %)", "35.200 €", "20.350 €"], ["Gesamtinvestition", "355.200 €", "205.350 €"], ["Bruttorendite", "4,31 %", "5,06 %"], ["− nicht umlagefähige Kosten / Jahr", "2.760 €", "2.100 €"], ["Jahresreinertrag", "11.040 €", "7.260 €"], ["Nettorendite", "3,11 %", "3,54 %"], ["Kaufpreisfaktor", "23,2", "19,8"], ["Eingesetztes Eigenkapital (NK + 20.000 €)", "55.200 €", "40.350 €"], ["Darlehen", "300.000 €", "165.000 €"], ["− Zinsen Jahr 1 (4,0 %)", "12.000 €", "6.600 €"], ["Überschuss n. Zins (vor Tilgung)", "−960 €", "+660 €"], ["Eigenkapitalrendite", "−1,7 %", "+1,6 %"]]}}, {"heading": "Welche Zahl wann? Der schnelle Entscheidungsweg", "body": "In der Praxis rechnen Sie die drei Kennzahlen nicht gleichzeitig, sondern nacheinander – wie einen Trichter, der mit jeder Stufe enger wird:\n\n• **Bruttorendite / Kaufpreisfaktor** direkt aus dem Inserat. Unter ~3,5 % bzw. über Faktor ~28 ohne starkes Lagveargument: aussortieren, fertig.\n\n• **Nettorendite**, sobald ein Objekt den Filter passiert. Hier kommen Kaufnebenkosten und Bewirtschaftung dazu. Diese Zahl gegen den aktuellen Kreditzins halten – das ist der Lackmustest.\n\n• **Eigenkapitalrendite und Cashflow** erst kurz vor der Entscheidung, mit Ihrem konkreten Zins und Eigenkapital. Inklusive eines Zinsszenarios für die Anschlussfinanzierung.\n\nSo vermeiden Sie zwei klassische Fehler auf einmal: Sie verlieren keine Zeit mit Detailrechnungen für aussichtslose Objekte – und Sie kaufen kein Objekt, das nur in der Bruttorendite gut aussah."}, {"heading": "Die häufigsten Renditefallen", "body": "Diese Fehler kosten Anleger regelmäßig echte Rendite – und tauchen in keinem Exposé auf:\n\n• **Kaufnebenkosten vergessen.** 8–15 % des Kaufpreises gehören in den Nenner. Wer sie weglässt, schönt jede Rendite um rund einen halben Prozentpunkt.\n\n• **Umlagefähige Kosten abziehen.** Müll, Wasser, Hausmeister, Grundsteuer zahlt der Mieter – sie mindern Ihre Rendite nicht.\n\n• **Instandhaltung unterschätzen.** Die gesetzliche Rücklage deckt selten alles. 7–10 €/m²/Jahr sind bei Bestandsbauten realistisch, bei Altbau mehr.\n\n• **Mit dem Wunschzins rechnen.** Kalkulieren Sie mit dem heutigen Marktzins und einem Aufschlag für die Anschlussfinanzierung.\n\n• **Leerstand ausblenden.** Ohne Mietausfallwagnis (2–4 %) ist die Rechnung zu optimistisch – ein einziger Mieterwechsel kann mehrere Monatsmieten kosten.\n\n• **Energie ignorieren.** Ein schlechter Energieausweis bedeutet Sanierungspflichten nach GEG – versteckte Kosten, die die Rendite über Jahre drücken."}, {"heading": "Vom Rechnen zur Entscheidung", "body": "Die Formeln sind kein Selbstzweck. Sie sollen eine einzige Frage beantworten: Trägt sich dieses Objekt – auch im schlechten Szenario? Die Bruttorendite filtert, die Nettorendite bewertet die echte Wirtschaftlichkeit, und die Eigenkapitalrendite zeigt, was Ihr Geld nach Finanzierung wirklich leistet. Erst alle drei zusammen ergeben ein belastbares Bild. Wer zusätzlich Lage, Substanz und Energie einpreist, vermeidet die teuren Überraschungen nach dem Kauf.\n\nDas alles von Hand zu rechnen ist machbar, aber fehleranfällig – gerade die bundeslandabhängigen Kaufnebenkosten und das Zinsszenario übersieht man leicht.\n\n**Prüfen Sie Ihre Wunschimmobilie jetzt kostenlos mit ImmoScorer** – das Tool berechnet Brutto-, Netto- und Eigenkapitalrendite sowie den Kaufpreisfaktor in Sekunden, inklusive korrekter Kaufnebenkosten je Bundesland, und verdichtet Rendite, Risiko, Finanzierbarkeit, Lage und Energie zu einem verständlichen Score. Ohne Account, in unter einer Minute."}], "faq": [{"question": "Was ist eine gute Mietrendite?", "answer": "Das hängt von der Kennzahl und der Lage ab. Eine **Bruttorendite** ab etwa 4–5 % macht eine Wohnung in solider Lage interessant; in A-Städten sind 3–4 % marktüblich (dort zählt die Wertsteigerung), in C-Lagen sind 5–8 % möglich, aber mit höherem Risiko und schwächerer Wertentwicklung. Entscheidend bleibt die **Nettorendite**: Liegt sie spürbar über dem Kreditzins, arbeitet der Finanzierungshebel für Sie."}, {"question": "Wie unterscheiden sich Bruttorendite und Nettorendite konkret?", "answer": "Die Bruttorendite rechnet nur Jahreskaltmiete gegen Kaufpreis und dient zum Vorsortieren. Die Nettorendite zieht zusätzlich die nicht umlagefähigen Bewirtschaftungskosten ab und addiert die Kaufnebenkosten im Nenner. Dadurch liegt sie meist 1 bis 2 Prozentpunkte niedriger – und ist die belastbare Zahl für die Kaufentscheidung."}, {"question": "Warum kann die Eigenkapitalrendite höher sein als die Mietrendite?", "answer": "Weil Sie die Rendite auf den gesamten Kaufpreis erzielen, Zinsen aber nur auf den fremdfinanzierten Anteil zahlen. Liegt die Objektrendite über dem Kreditzins, hebelt jeder geliehene Euro Ihre Eigenkapitalrendite nach oben (Leverage). Liegt der Zins darüber, kehrt sich der Effekt um – dann ist die EK-Rendite niedriger oder sogar negativ."}, {"question": "Zählt die Tilgung als Kosten bei der Renditeberechnung?", "answer": "Nein. Die Tilgung ist Vermögensaufbau, kein Aufwand – Sie tauschen Liquidität gegen Eigentumsanteil am Objekt. In der Eigenkapitalrendite taucht sie deshalb nicht als Kosten auf. Für die monatliche Liquidität ist sie aber sehr relevant, weshalb man parallel immer den Cashflow betrachtet, der Zins und Tilgung enthält."}, {"question": "Rechnet man die Mietrendite vor oder nach Steuern?", "answer": "Die drei Standardkennzahlen sind Vorsteuerrenditen – so bleiben Objekte unabhängig von Ihrer persönlichen Steuerlage vergleichbar. Steuern (AfA, Abzug der Schuldzinsen, Ihr Grenzsteuersatz) betrachtet man in einem zweiten Schritt, weil sie individuell sind und gerade ein knapp negatives Vorsteuer-Ergebnis nach Steuern noch tragfähig machen können."}]},
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
