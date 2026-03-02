/* ── Rule-based fallback strategy generator (no API key needed) ── */

export interface StrategyInputs {
  firstName?: string;
  age?: number;
  employment?: string;
  income?: string;
  familyStatus?: string;
  livingSituation?: string;
  equity?: number;
  monthlySavings?: number;
  existingProperties?: string;
  existingDebts?: string;
  schufa?: string;
  mainGoal?: string;
  timeHorizon?: string;
  targetIncome?: number;
  riskTolerance?: string;
  preferredTypes?: string[];
  preferredRegion?: string;
  management?: string;
  timeAvailable?: string;
}

export interface StrategyPhase {
  title: string;
  timeframe: string;
  description: string;
  actions: string[];
  targetProperty: string;
  estimatedBudget: string;
  expectedCashflow: string;
}

export interface StrategyResult {
  summary: string;
  strategyName: string;
  phase1: StrategyPhase;
  phase2: StrategyPhase;
  phase3: StrategyPhase;
  financialPlan: {
    eigenkapitalPlan: string;
    sparplan: string;
    finanzierungsStrategie: string;
  };
  riskManagement: {
    risks: string[];
    reserves: string;
    diversification: string;
  };
  milestones: { time: string; goal: string }[];
  firstSteps: string[];
  investmentCriteria: {
    idealCity: string;
    priceRange: string;
    minRendite: string;
    objectType: string;
    avoidList: string[];
  };
  taxTips: string[];
}

export function generateFallbackStrategy(d: StrategyInputs): StrategyResult {
  const eq = d.equity || 0;
  const sav = d.monthlySavings || 0;
  const age = d.age || 30;
  const isStarter =
    !d.existingProperties || d.existingProperties === "Keine (Einsteiger)";
  const isYoung = age < 35;
  const isOlder = age > 50;
  const conservative =
    d.riskTolerance === "Konservativ" || d.riskTolerance === "Ausgewogen";
  const isFlip = d.mainGoal === "Fix & Flip / aktives Immobilien-Business";
  const isCashflow =
    d.mainGoal === "Passives Einkommen / Cashflow aufbauen" ||
    d.mainGoal === "Hauptberuf kündigen / finanziell frei werden";
  const isTax = d.mainGoal === "Steueroptimierung";
  const isRetirement = d.mainGoal === "Sichere Geldanlage / Inflationsschutz";

  let strategyName: string;
  let summary: string;

  if (isFlip) {
    strategyName = "Fix & Flip Strategie";
    summary = `Basierend auf Ihrem Profil empfehlen wir eine aktive Fix & Flip Strategie. Mit ${eq.toLocaleString("de-DE")} € Eigenkapital und einer Sparrate von ${sav.toLocaleString("de-DE")} € können Sie mit einem ersten Sanierungsobjekt starten und durch gezielte Aufwertung Gewinne realisieren.`;
  } else if (isCashflow && !conservative) {
    strategyName = "Aggressiver Cashflow-Aufbau";
    summary = `Ihre Strategie zielt auf schnellen Cashflow-Aufbau. Mit ${eq.toLocaleString("de-DE")} € Eigenkapital fokussieren Sie sich auf renditestarke Objekte in B/C-Lagen, um möglichst schnell positive monatliche Einnahmen zu generieren.`;
  } else if (isOlder && conservative) {
    strategyName = "Sichere Cashflow-Strategie";
    summary = `Für Ihren Zeithorizont und Ihr Sicherheitsbedürfnis empfehlen wir eine konservative Cashflow-Strategie. Fokus auf solide Objekte in guten Lagen mit sofortigem positivem Cashflow und minimalem Risiko.`;
  } else if (isTax) {
    strategyName = "Steueroptimierte Vermögensstrategie";
    summary = `Mit Fokus auf Steuervorteile empfehlen wir eine Buy & Hold Strategie mit maximaler AfA-Nutzung. Sanierungsobjekte und Denkmalschutz bieten die höchsten steuerlichen Vorteile bei gleichzeitigem Vermögensaufbau.`;
  } else if (isRetirement) {
    strategyName = "Inflationsschutz & Altersvorsorge";
    summary = `Immobilien als sichere Geldanlage: Langfristiger Vermögensaufbau mit schuldenfreien Immobilien bis zur Rente. Fokus auf wertstabile Lagen und solide Mietrenditen.`;
  } else {
    strategyName = isYoung ? "Langfristiger Vermögensaufbau" : "Solide Buy & Hold Strategie";
    summary = `${d.firstName ? d.firstName + ", Ihre" : "Ihre"} persönliche Strategie setzt auf langfristigen Vermögensaufbau durch Buy & Hold. Mit ${eq.toLocaleString("de-DE")} € Startkapital und ${sav.toLocaleString("de-DE")} € monatlicher Sparrate ist ein schrittweiser Aufbau eines Immobilienportfolios realistisch.`;
  }

  const priceRange = eq < 20000
    ? "40.000-80.000 €"
    : eq < 50000
      ? "60.000-130.000 €"
      : eq < 100000
        ? "100.000-250.000 €"
        : "150.000-400.000 €";

  const cityType = eq < 50000
    ? "B/C-Städte wie Leipzig, Chemnitz, Magdeburg, Halle, Bremerhaven"
    : eq < 150000
      ? "Starke B-Städte wie Dresden, Nürnberg, Hannover, Bremen"
      : "Gute Lagen in A/B-Städten wie Düsseldorf, Köln, Stuttgart Umland";

  return {
    summary,
    strategyName,
    phase1: {
      title: "Phase 1: Fundament legen",
      timeframe: isStarter ? "Monat 1-6" : "Monat 1-3",
      description: isStarter
        ? `Eigenkapital sichern, Finanzierbarkeit prüfen und das erste Objekt finden. Nutzen Sie die ersten Monate für intensive Marktrecherche und Finanzierungsgespräche.`
        : `Schnelle Akquise des nächsten Objekts. Nutzen Sie Ihren Track Record für bessere Finanzierungskonditionen.`,
      actions: isStarter
        ? [
            "Finanzierungsrahmen mit 3 Banken abstimmen",
            "Marktrecherche in Zielstädten starten",
            `Eigenkapital auf Tagesgeldkonto sichern (${eq.toLocaleString("de-DE")} €)`,
            "ImmoScorer Analysen für mindestens 10 Objekte durchführen",
          ]
        : [
            "Bestandsportfolio-Performance analysieren",
            "Eigenkapital aus Wertsteigerung berechnen",
            "Neue Zielobjekte mit ImmoScorer bewerten",
          ],
      targetProperty: eq < 50000
        ? "1-2 Zimmer ETW in C-Stadt, Baujahr 1960-1990, gepflegt oder leicht sanierungsbedürftig"
        : "2-3 Zimmer ETW in B-Lage, guter Zustand, sofort vermietbar",
      estimatedBudget: priceRange,
      expectedCashflow: eq < 50000 ? "50-150 €/Monat" : "100-300 €/Monat",
    },
    phase2: {
      title: "Phase 2: Wachstum",
      timeframe: isStarter ? "Monat 7-24" : "Monat 4-18",
      description:
        "Erstes Objekt stabilisieren, Mieteinnahmen optimieren und Eigenkapital für das zweite Objekt ansparen. Die Erfahrungen aus dem ersten Kauf beschleunigen den zweiten.",
      actions: [
        "Mieteinnahmen des ersten Objekts stabilisieren",
        `Monatliche Sparrate (${sav.toLocaleString("de-DE")} €) konsequent fortführen`,
        "Zweites Objekt suchen und analysieren",
        "Steuerliche Optimierung mit Steuerberater besprechen",
      ],
      targetProperty:
        "Zweite ETW oder kleines MFH (2-3 Einheiten), idealerweise in einer anderen Stadt zur Diversifikation",
      estimatedBudget:
        eq < 50000 ? "80.000-150.000 €" : "120.000-300.000 €",
      expectedCashflow:
        eq < 50000 ? "150-350 €/Monat kumuliert" : "300-600 €/Monat kumuliert",
    },
    phase3: {
      title: "Phase 3: Skalierung",
      timeframe: isYoung ? "Jahr 3-10" : "Jahr 2-7",
      description: `Systematischer Ausbau auf ${isYoung ? "5-10" : "3-5"} Objekte. Nutzung des wachsenden Eigenkapitals und der nachgewiesenen Mieteinnahmen für größere Objekte. ${eq > 100000 ? "Prüfung einer GmbH-Struktur ab dem 4. Objekt." : ""}`,
      actions: [
        `Portfolio auf ${isYoung ? "5-10" : "3-5"} Objekte ausbauen`,
        "Professionelle Hausverwaltung ab 3 Objekten einschalten",
        eq > 100000
          ? "GmbH-Struktur mit Steuerberater prüfen"
          : "Steuerliche Optimierung maximieren (AfA, Werbungskosten)",
        "Refinanzierung bestehender Objekte prüfen",
      ],
      targetProperty:
        "Größere Objekte: MFH mit 3-6 Einheiten oder Paket aus ETWs",
      estimatedBudget: "200.000-500.000 € pro Objekt",
      expectedCashflow: isCashflow
        ? `${Math.min(d.targetIncome || 3000, 5000).toLocaleString("de-DE")} €/Monat Ziel`
        : "1.000-3.000 €/Monat kumuliert",
    },
    financialPlan: {
      eigenkapitalPlan:
        eq < 20000
          ? `Aktuell ${eq.toLocaleString("de-DE")} € vorhanden. In ${Math.ceil((20000 - eq) / Math.max(sav, 200))} Monaten erreichen Sie die 20.000 €-Marke für ein erstes kleines Objekt. Kaufnebenkosten (10-15%) müssen abgedeckt sein.`
          : `${eq.toLocaleString("de-DE")} € Eigenkapital decken die Nebenkosten eines Objekts bis ca. ${Math.round(eq / 0.12).toLocaleString("de-DE")} € Kaufpreis. Pro Objekt 15% des Kaufpreises als EK einplanen.`,
      sparplan: `${sav.toLocaleString("de-DE")} € monatlich = ${(sav * 12).toLocaleString("de-DE")} €/Jahr zusätzliches Eigenkapital. Ziel: Alle 18-24 Monate ein neues Objekt finanzieren. Sparrate auf separates Konto, nicht antasten.`,
      finanzierungsStrategie: `80% LTV als Standard, 15 Jahre Zinsbindung, 2% anfängliche Tilgung, 5% Sondertilgung p.a. vereinbaren. Bei ${
        d.employment === "Beamter"
          ? "Beamtenstatus profitieren Sie von besseren Konditionen (bis 100% Finanzierung möglich)"
          : d.employment === "Selbstständig"
            ? "Selbstständigkeit mindestens 3 BWAs und aktuelle Steuererklärung bereithalten"
            : "Angestelltenverhältnis sind die Chancen auf gute Konditionen sehr gut"
      }.`,
    },
    riskManagement: {
      risks: [
        "Leerstandsrisiko: 1-2 Monatsmieten Reserve pro Objekt halten. Bei Neuvermietung zeitnah inserieren.",
        "Zinsänderungsrisiko: Lange Zinsbindung (15+ Jahre) wählen. Forward-Darlehen 24 Monate vor Ablauf prüfen.",
        "Sanierungsrisiko: Vor Kauf Sachverständigen hinzuziehen. 10% des Kaufpreises als Sanierungspuffer.",
        "Mietnomaden: Gründliche Bonitätsprüfung. SCHUFA + Einkommensnachweise + Vormieterbescheinigung.",
      ],
      reserves: `Mindestens ${Math.max(3, Math.round(eq / 20000)) * 3000} € Liquiditätsreserve (3-6 Monatsmieten pro Objekt). Nicht in die Finanzierung einrechnen.`,
      diversification:
        "Über mindestens 2 verschiedene Städte streuen. Mix aus 1-2 und 3-4 Zimmer Wohnungen für unterschiedliche Mietergruppen.",
    },
    milestones: [
      {
        time: "3 Monate",
        goal: "Finanzierungsrahmen geklärt, erste Marktanalysen abgeschlossen",
      },
      {
        time: "6 Monate",
        goal: isStarter ? "Erstes Objekt gekauft oder im Prozess" : "Nächstes Objekt gesichert",
      },
      {
        time: "12 Monate",
        goal: "Erstes Objekt vermietet, stabiler Cashflow",
      },
      {
        time: "3 Jahre",
        goal: `${isYoung ? "3-4" : "2-3"} Objekte im Portfolio`,
      },
      {
        time: "5 Jahre",
        goal: `${isYoung ? "5-7" : "3-5"} Objekte, ${isCashflow ? "1.500-3.000 €/Monat Cashflow" : "solider Vermögensaufbau"}`,
      },
      {
        time: "10 Jahre",
        goal: isYoung
          ? "8-12 Objekte, erste Objekte entschuldet, deutlich positiver Cashflow"
          : "Portfolio stabil, Fokus auf Entschuldung und Cashflow-Optimierung",
      },
    ],
    firstSteps: [
      "Finanzierungsanfrage über ImmoScorer starten — kostenlos und unverbindlich Ihren Finanzierungsrahmen ermitteln",
      `${eq < 20000 ? "Sparplan starten: Automatisch " + sav + " €/Monat auf separates Tagesgeldkonto" : "Eigenkapital-Nachweis zusammenstellen: Kontoauszüge der letzten 3 Monate"}`,
      "Erste 5 Objekte in Zielregion mit ImmoScorer analysieren — Marktgefühl entwickeln",
      `${isStarter ? "Buch-Empfehlung: Grundlagenwissen aufbauen, Podcasts zu Immobilieninvestments hören" : "Bestandsportfolio-Check: Mietanpassungen und Refinanzierungspotenzial prüfen"}`,
    ],
    investmentCriteria: {
      idealCity: cityType,
      priceRange,
      minRendite: conservative ? "5%+ Bruttorendite" : "6%+ Bruttorendite",
      objectType: eq < 50000
        ? "1-2 Zimmer ETW, 25-50 m², Baujahr 1960-1995, gepflegt"
        : "2-3 Zimmer ETW, 50-75 m², guter Zustand, sofort vermietbar",
      avoidList: [
        "Objekte mit unklarem Sanierungsstau (keine Protokolle vorhanden)",
        "WEGs mit weniger als 5 €/m²/Jahr Instandhaltungsrücklage",
        "Regionen mit schrumpfender Bevölkerung und steigendem Leerstand",
        conservative
          ? "Gewerbeimmobilien und Sonderformate (Ferienwohnungen, Mikro-Apartments)"
          : "Sanierungsstau ohne klare Kostenkalkulation",
      ],
    },
    taxTips: [
      `AfA nutzen: ${age > 45 ? "2-2,5% lineare AfA auf den Gebäudeanteil (60-80% des Kaufpreises)" : "Denkmalschutz-AfA prüfen: Bis zu 100% der Sanierungskosten in 12 Jahren absetzbar"}`,
      "Werbungskosten dokumentieren: Fahrtkosten, Zinsen, Verwaltung, Versicherungen — alles absetzbar",
      `Spekulationsfrist beachten: Nach 10 Jahren Haltedauer ist der Verkaufsgewinn steuerfrei`,
      eq > 100000
        ? "GmbH-Struktur prüfen: Ab 3-5 Immobilien kann der Steuersatz von 45% auf 15,8% sinken"
        : "Verlustverrechnung: Negative Einkünfte aus V+V mindern Ihr zu versteuerndes Einkommen",
    ],
  };
}
