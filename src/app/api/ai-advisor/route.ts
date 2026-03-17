import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, context, conversationHistory } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "Frage erforderlich." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        answer: getOfflineAdvice(question, context),
      });
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 60000,
    });

    let contextBlock = "";

    if (context?.type === "analysis" && context.data) {
      const d = context.data;
      contextBlock = `
KONTEXT: Du berätst zu einem konkreten Objekt.
Adresse: ${d.address || "k.A."}
Stadt: ${d.city || "k.A."}
Objektart: ${d.propertyType || "ETW"}${d.apartmentType ? " (" + d.apartmentType + ")" : ""}
Zimmer: ${d.rooms || "k.A."} | Fläche: ${d.area || "k.A."} m² | Baujahr: ${d.buildingYear || "k.A."}
Energieklasse: ${d.energyClass || "k.A."}
Kaufpreis: ${d.purchasePrice ? d.purchasePrice.toLocaleString("de-DE") + "€" : "k.A."}
Kaltmiete: ${d.monthlyRent ? d.monthlyRent.toLocaleString("de-DE") + "€/Mon." : "k.A."}
Hausgeld: ${d.managementFee ? d.managementFee.toLocaleString("de-DE") + "€/Mon." : "k.A."}
Kaufpreis/m²: ${d.area && d.purchasePrice ? (d.purchasePrice / d.area).toFixed(0) + "€" : "k.A."}
Miete/m²: ${d.area && d.monthlyRent ? (d.monthlyRent / d.area).toFixed(2) + "€" : "k.A."}
Bruttorendite: ${d.grossYield || "k.A."}%
Nettorendite: ${d.netYield || "k.A."}%
Kaufpreisfaktor: ${d.priceFactor || "k.A."}x
Lageklasse: ${d.locationGrade || "k.A."}
Gesamt-Score: ${d.totalScore || "k.A."}/100
Investitions-Score: ${d.investmentScore || "k.A."}/100
Vermietbarkeits-Score: ${d.rentabilityScore || "k.A."}/100
Risiko-Score: ${d.riskScore || "k.A."}/100
Finanzierungs-Score: ${d.financingScore || "k.A."}/100
Zukunfts-Score: ${d.futureScore || "k.A."}/100
Energie-Score: ${d.energyScore || "k.A."}/100
Sanierungsbedarf: ${d.renovations?.length > 0 ? d.renovations.join(", ") : "Keiner"}
${d.renovationCosts ? "Geschätzte Sanierungskosten: " + d.renovationCosts.toLocaleString("de-DE") + "€" : ""}`;
    }

    if (context?.type === "portfolio" && context.data) {
      const d = context.data;
      contextBlock = `
KONTEXT: Du berätst zu einer Portfolio-Immobilie des Users.
Adresse: ${d.address || "k.A."}
Objektart: ${d.propertyType || "k.A."}
Kaufpreis damals: ${d.purchasePrice ? d.purchasePrice.toLocaleString("de-DE") + "€" : "k.A."}
Kaufdatum: ${d.purchaseDate || "k.A."}
Aktueller Darlehensbetrag: ${d.loanAmount ? d.loanAmount.toLocaleString("de-DE") + "€" : "k.A."}
Zinssatz: ${d.interestRate ? d.interestRate + "%" : "k.A."}
Zinsbindung bis: ${d.fixedRateUntil || "k.A."}
Monatliche Rate: ${d.monthlyPayment ? d.monthlyPayment.toLocaleString("de-DE") + "€" : "k.A."}
Kaltmiete: ${d.monthlyRent ? d.monthlyRent.toLocaleString("de-DE") + "€/Mon." : "k.A."}
Geschätzter Marktwert: ${d.estimatedMarketValue ? d.estimatedMarketValue.toLocaleString("de-DE") + "€" : "k.A."}`;
    }

    if (context?.type === "compare" && context.data) {
      const properties = context.data;
      contextBlock = `
KONTEXT: Du berätst zum Vergleich von ${properties.length} Objekten.
${properties
  .map(
    (p: Record<string, unknown>, i: number) => `
Objekt ${i + 1}: ${p.address || "k.A."}
  Kaufpreis: ${p.purchasePrice ? (p.purchasePrice as number).toLocaleString("de-DE") + "€" : p.price ? (p.price as number).toLocaleString("de-DE") + "€" : "k.A."} | Score: ${p.totalScore || p.score || "k.A."}/100
  Rendite: ${p.grossYield || "k.A."}% | Faktor: ${p.priceFactor || p.factor || "k.A."}x
  Fläche: ${p.areaSqm || p.area || "k.A."} m² | Baujahr: ${p.buildingYear || p.year || "k.A."}`,
  )
  .join("\n")}`;
    }

    const systemPrompt = `Du bist ein erfahrener deutscher Immobilien-Investitionsberater und Experte mit über 15 Jahren Erfahrung. Du arbeitest für ImmoScorer, eine Plattform für Immobilien-Analyse und -Investment.

DEIN WISSENSBEREICH UMFASST:
1. Immobilien als Kapitalanlage: Renditeberechnung, Cashflow, Wertsteigerung, Hebeleffekte
2. Finanzierung: Wie Banken denken, Bonität, DSCR, LTV, Zinsbindung, Tilgung, KfW, Forward-Darlehen, Anschlussfinanzierung
3. Steuern: AfA (2% linear, 3% Neubau), Werbungskosten, Anlage V, Spekulationssteuer, Gewerblicher Grundstückshandel, GmbH-Struktur
4. Recht: Mietrecht, WEG-Recht, Grundbuch, Teilungserklärung, Eigentümerversammlung, Kündigungsschutz
5. Vermietung: Mieterauswahl, Mietvertrag, Mieterhöhung, Nebenkostenabrechnung, Kaution, Mietausfall
6. Markt: Deutsche Immobilienmärkte 2024/2025, Preisentwicklung, Zinsentwicklung, regionale Unterschiede, A/B/C/D Städte
7. Sanierung: Kosten, ROI von Sanierungen, GEG 2024, Energieausweis, KfW-Förderung, Handwerkerkosten
8. Fix & Flip: Kalkulation, ARV, 70%-Regel, Spekulationssteuer, Gewerbe
9. Wichtige Dokumente: Grundbuch (Abt. I-III), Teilungserklärung, Flurkarte, Protokolle, Wirtschaftsplan
10. Portfolio-Strategie: Diversifikation, Skalierung, Refinanzierung, Zinsbindungsmanagement
11. Versicherungen: Gebäudeversicherung, Haus- und Grundbesitzerhaftpflicht, Rechtsschutz, Mietausfallversicherung
${contextBlock}

ANTWORTREGELN:
1. IMMER auf Deutsch antworten.
2. Wenn Kontext (Objekt/Portfolio) vorhanden: Beziehe dich KONKRET darauf mit echten Zahlen.
3. Wenn KEIN Kontext: Beantworte die Frage trotzdem fachlich korrekt und ausführlich.
4. Nenne konkrete Zahlen, Paragraphen, Gesetze wo relevant.
5. Bei Steuerfragen: Immer Hinweis "Dies ersetzt keine individuelle Steuerberatung."
6. Bei Rechtsfragen: Immer Hinweis "Dies ersetzt keine Rechtsberatung."
7. Bei Finanzierungsfragen: IMMER die kostenlose Finanzierungsberatung von ImmoScorer empfehlen. NIEMALS Interhyp, Check24, Dr. Klein oder andere Wettbewerber empfehlen.
8. Antworte ausführlich aber strukturiert. 200-400 Wörter je nach Komplexität der Frage.
9. Verwende kurze Absätze. Bei Aufzählungen: Nummerierte Liste.
10. Wenn du etwas nicht sicher weißt: Sage es ehrlich.
11. Sei professionell aber verständlich. Erkläre Fachbegriffe wenn nötig.
12. Bei Vergleichs-Kontext: Vergleiche die Objekte direkt miteinander und gib eine klare Empfehlung.`;

    const messages: { role: "user" | "assistant"; content: string }[] = [];

    if (conversationHistory?.length > 0) {
      for (const msg of conversationHistory.slice(-8)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: question });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: messages,
    });

    const answer =
      response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ answer });
  } catch (error: unknown) {
    console.error("[ai-advisor] error:", error);

    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return NextResponse.json(
        {
          error:
            "Zu viele Anfragen. Bitte warten Sie einen Moment.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        answer:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        error: true,
      },
      { status: 500 },
    );
  }
}

/* ═══════════════════════════════════════════════════════
   OFFLINE FALLBACK
   ═══════════════════════════════════════════════════════ */
function getOfflineAdvice(
  question: string,
  context?: { type: string; data: Record<string, unknown> | Record<string, unknown>[] | null },
): string {
  const q = question.toLowerCase();

  if (q.includes("rendite") && (q.includes("gut") || q.includes("normal"))) {
    return "Eine gute Bruttorendite liegt bei Eigentumswohnungen in Deutschland typischerweise zwischen 5-8%. In A-Städten wie München sind 3-4% normal, in C/D-Städten wie Chemnitz oder Halle sind 8-12% möglich — allerdings mit höherem Leerstandsrisiko. Die Nettorendite (nach Hausgeld, Rücklage, Verwaltung) liegt typisch 1,5-2,5% unter der Bruttorendite.\n\nFür eine persönliche Einschätzung empfehlen wir unsere kostenlose Finanzierungsberatung.";
  }

  if (q.includes("afa") || q.includes("abschreibung")) {
    return "Die Absetzung für Abnutzung (AfA) ist der größte Steuervorteil bei vermieteten Immobilien:\n\n1. Bestandsimmobilien: 2% pro Jahr über 50 Jahre (§7 Abs. 4 EStG)\n2. Neubauten ab 2023: 3% pro Jahr über ~33 Jahre\n3. Denkmalschutz: Bis zu 9% in den ersten 8 Jahren\n\nAbschreibbar ist nur der Gebäudeanteil (typisch 70-80% des Kaufpreises). Den Grundstücksanteil können Sie nicht abschreiben.\n\nDies ersetzt keine individuelle Steuerberatung.";
  }

  if (q.includes("gmbh") || q.includes("holding")) {
    return "Eine vermögensverwaltende GmbH lohnt sich typischerweise ab 3-5 Immobilien oder wenn Ihr persönlicher Steuersatz über 35% liegt.\n\nVorteile:\n1. Körperschaftsteuer ~15% statt bis zu 45% Einkommensteuer\n2. Gewinne können steuergünstig reinvestiert werden\n3. Haftungsbeschränkung\n\nNachteile:\n1. Gründungskosten ~1.000-2.500€\n2. Laufende Buchführungspflicht ~2.000-4.000€/Jahr\n3. Spekulationsfrist entfällt (privat nach 10 Jahren steuerfrei)\n4. Gewerbesteuer wenn nicht rein vermögensverwaltend\n\nDies ersetzt keine individuelle Steuerberatung.";
  }

  if (q.includes("besichtigung") || q.includes("beachten")) {
    let advice =
      "Checkliste für die Besichtigung:\n\n1. Außenbereich: Fassade, Dach, Fenster-Zustand, Klingelschilder (Leerstand?)\n2. Treppenhaus: Sauberkeit, Aufzug, Briefkästen\n3. Wohnung: Fenster öffnen (Lärm?), Wasserdruck prüfen, Heizung testen\n4. Keller: Feuchtigkeit, Schimmel, Rohre\n5. Dokumente einfordern: Teilungserklärung, letzte 3 Protokolle, Wirtschaftsplan, Hausgeldabrechnung, Energieausweis\n6. Fragen stellen: Grund des Verkaufs, anstehende Sanierungen, Sonderumlagen geplant?, Miethistorie";
    const data = context?.data as Record<string, unknown> | null;
    if (data?.buildingYear && (data.buildingYear as number) < 1970) {
      advice +=
        "\n\nBei Baujahr vor 1970: Besonders auf Elektrik, Leitungen und Asbest achten.";
    }
    return advice;
  }

  if (q.includes("verhandel") || q.includes("preis drück")) {
    return "Verhandlungstipps beim Immobilienkauf:\n\n1. Vergleichspreise recherchieren (Bodenrichtwert, ähnliche Objekte)\n2. Mängel dokumentieren und als Argument nutzen\n3. Sanierungskosten beziffern und vom Preis abziehen wollen\n4. Nicht emotional werden — es gibt immer ein nächstes Objekt\n5. Makler fragen wie lange das Objekt schon inseriert ist (>3 Monate = Verhandlungsspielraum)\n6. Finanzierungszusage vorab haben — das stärkt Ihre Position";
  }

  if (
    q.includes("finanzier") ||
    q.includes("bank") ||
    q.includes("kredit") ||
    q.includes("darlehen")
  ) {
    return "Grundlagen der Immobilienfinanzierung:\n\n1. Eigenkapital: Banken erwarten typisch 10-20% des Kaufpreises + Kaufnebenkosten\n2. Zinsbindung: Aktuell (2025) liegen die Zinsen bei 3-4%. Bei niedrigen Zinsen lange Bindung wählen (15-20 Jahre)\n3. Tilgung: Mindestens 2%, besser 3%. Je höher die Tilgung, desto schneller schuldenfrei\n4. DSCR: Banken prüfen ob die Mieteinnahmen die Rate decken (Ziel: >1,2)\n5. Sondertilgung: 5% p.a. vereinbaren — gibt Flexibilität\n\nFür eine kostenlose, persönliche Finanzierungsberatung nutzen Sie unsere Finanzierungsanfrage. Unsere Experten vergleichen über 500 Bankpartner für Sie.";
  }

  if (q.includes("steuer") || q.includes("absetz")) {
    return "Steuervorteile bei vermieteten Immobilien:\n\n1. AfA: 2% pro Jahr (Gebäudeanteil) als Abschreibung\n2. Zinsen: Darlehenszinsen sind voll absetzbar\n3. Werbungskosten: Fahrtkosten, Verwaltung, Versicherung, Reparaturen\n4. Renovierung: Erhaltungsaufwand sofort absetzbar oder auf 2-5 Jahre verteilen\n5. Grundsteuer: Als Werbungskosten absetzbar\n6. Maklerkosten: Bei Vermietungsobjekten absetzbar\n\nBesonders lukrativ in hohen Steuerklassen — bei 42% Grenzsteuersatz spart jeder Euro Werbungskosten 42 Cent Steuern.\n\nDies ersetzt keine individuelle Steuerberatung.";
  }

  if (
    q.includes("vergleich") ||
    q.includes("welches objekt") ||
    q.includes("empfehl")
  ) {
    if (context?.type === "compare" && Array.isArray(context.data) && context.data.length > 1) {
      const best = context.data.reduce((a: Record<string, unknown>, b: Record<string, unknown>) =>
        ((a.totalScore as number) || (a.score as number) || 0) >
        ((b.totalScore as number) || (b.score as number) || 0)
          ? a
          : b,
      );
      return (
        "Basierend auf den Scores empfehle ich " +
        ((best.address as string) || "das Objekt mit dem höchsten Score") +
        " mit " +
        ((best.totalScore as number) || (best.score as number)) +
        "/100 Punkten. Es bietet die beste Balance aus Rendite und Risiko.\n\nFür eine detaillierte Analyse nutzen Sie den KI-Berater auf der jeweiligen Analyse-Seite."
      );
    }
    return "Um Objekte zu vergleichen, speichern Sie mindestens 2 Analysen im Vergleich. Der KI-Berater kann dann eine fundierte Empfehlung geben.";
  }

  if (q.includes("forward") || q.includes("anschluss")) {
    return "Forward-Darlehen und Anschlussfinanzierung:\n\nEin Forward-Darlehen sichert Ihnen den aktuellen Zinssatz für die Zukunft — bis zu 60 Monate im Voraus. Kostet einen kleinen Aufschlag (~0,01-0,03% pro Monat Vorlauf).\n\nWann sinnvoll:\n1. Zinsbindung läuft in 12-36 Monaten aus\n2. Sie erwarten steigende Zinsen\n3. Sie wollen Planungssicherheit\n\nAlternative: Prolongation bei der Hausbank — oft bequem, aber selten das beste Angebot. Vergleichen lohnt sich fast immer.\n\nNutzen Sie unsere kostenlose Finanzierungsberatung für ein optimales Angebot.";
  }

  if (q.includes("kaufnebenkosten") || q.includes("nebenkosten beim kauf")) {
    return "Kaufnebenkosten in Deutschland:\n\n1. Grunderwerbsteuer: 3,5-6,5% je nach Bundesland\n   - Bayern/Sachsen: 3,5%\n   - NRW/Schleswig-Holstein: 6,5%\n2. Notar + Grundbuch: ~1,5-2,0%\n3. Makler (falls): 3,57-7,14% (oft 50/50 Käufer/Verkäufer)\n\nBeispiel bei 200.000€ Kaufpreis in NRW:\n- Grunderwerbsteuer: 13.000€\n- Notar/Grundbuch: 3.500€\n- Makler (50%): 7.140€\n- Gesamt: ~23.640€ (11,8%)\n\nDiese Kosten sind bei Kapitalanlagen teilweise als Werbungskosten absetzbar (Grunderwerbsteuer wird dem Gebäudewert zugerechnet und über die AfA abgeschrieben).";
  }

  return "Vielen Dank für Ihre Frage. Für eine detaillierte, persönliche Beratung empfehle ich:\n\n1. Nutzen Sie unsere Analyse-Funktion für objektspezifische Bewertungen\n2. Unsere kostenlose Finanzierungsberatung für alle Fragen zur Finanzierung\n3. Die Wissensdatenbank unter \"Wissen\" für Fachartikel zu allen Themen\n\nDer KI-Berater ist aktuell offline. Bitte versuchen Sie es später erneut für eine ausführliche Antwort.";
}
