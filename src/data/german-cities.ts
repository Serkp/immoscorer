/**
 * Static German city market data for location scoring.
 * Values reflect approximate 2024/2025 market averages.
 */

export interface CityData {
  city: string;
  state: string;
  avgRentPerSqm: number;
  avgPricePerSqm: number;
  population: number;
  populationTrend: "growing" | "stable" | "shrinking";
  tier: "A" | "B" | "C" | "D";
}

const CITIES: CityData[] = [
  // ═══════════════════════════════════════
  // TIER A — Top 7 Metropolen
  // ═══════════════════════════════════════
  { city: "München", state: "Bayern", avgRentPerSqm: 19.0, avgPricePerSqm: 9500, population: 1512000, populationTrend: "growing", tier: "A" },
  { city: "Frankfurt am Main", state: "Hessen", avgRentPerSqm: 14.0, avgPricePerSqm: 5500, population: 773000, populationTrend: "growing", tier: "A" },
  { city: "Hamburg", state: "Hamburg", avgRentPerSqm: 13.0, avgPricePerSqm: 5000, population: 1945000, populationTrend: "growing", tier: "A" },
  { city: "Berlin", state: "Berlin", avgRentPerSqm: 12.5, avgPricePerSqm: 4800, population: 3755000, populationTrend: "growing", tier: "A" },
  { city: "Stuttgart", state: "Baden-Württemberg", avgRentPerSqm: 14.0, avgPricePerSqm: 5000, population: 635000, populationTrend: "growing", tier: "A" },
  { city: "Düsseldorf", state: "Nordrhein-Westfalen", avgRentPerSqm: 12.0, avgPricePerSqm: 4200, population: 620000, populationTrend: "growing", tier: "A" },
  { city: "Köln", state: "Nordrhein-Westfalen", avgRentPerSqm: 12.0, avgPricePerSqm: 4000, population: 1084000, populationTrend: "growing", tier: "A" },

  // ═══════════════════════════════════════
  // TIER B — Starke Großstädte
  // ═══════════════════════════════════════
  { city: "Nürnberg", state: "Bayern", avgRentPerSqm: 10.5, avgPricePerSqm: 3400, population: 523000, populationTrend: "growing", tier: "B" },
  { city: "Hannover", state: "Niedersachsen", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 545000, populationTrend: "stable", tier: "B" },
  { city: "Leipzig", state: "Sachsen", avgRentPerSqm: 8.5, avgPricePerSqm: 2600, population: 616000, populationTrend: "growing", tier: "B" },
  { city: "Dresden", state: "Sachsen", avgRentPerSqm: 8.5, avgPricePerSqm: 2700, population: 563000, populationTrend: "growing", tier: "B" },
  { city: "Bonn", state: "Nordrhein-Westfalen", avgRentPerSqm: 11.0, avgPricePerSqm: 3600, population: 336000, populationTrend: "growing", tier: "B" },
  { city: "Münster", state: "Nordrhein-Westfalen", avgRentPerSqm: 11.5, avgPricePerSqm: 3800, population: 320000, populationTrend: "growing", tier: "B" },
  { city: "Freiburg im Breisgau", state: "Baden-Württemberg", avgRentPerSqm: 12.5, avgPricePerSqm: 4200, population: 236000, populationTrend: "growing", tier: "B" },
  { city: "Heidelberg", state: "Baden-Württemberg", avgRentPerSqm: 12.0, avgPricePerSqm: 4000, population: 162000, populationTrend: "growing", tier: "B" },
  { city: "Mainz", state: "Rheinland-Pfalz", avgRentPerSqm: 11.5, avgPricePerSqm: 3700, population: 220000, populationTrend: "growing", tier: "B" },
  { city: "Augsburg", state: "Bayern", avgRentPerSqm: 10.5, avgPricePerSqm: 3500, population: 300000, populationTrend: "growing", tier: "B" },
  { city: "Karlsruhe", state: "Baden-Württemberg", avgRentPerSqm: 11.0, avgPricePerSqm: 3400, population: 313000, populationTrend: "growing", tier: "B" },
  { city: "Wiesbaden", state: "Hessen", avgRentPerSqm: 11.5, avgPricePerSqm: 3800, population: 283000, populationTrend: "stable", tier: "B" },
  { city: "Darmstadt", state: "Hessen", avgRentPerSqm: 12.0, avgPricePerSqm: 3900, population: 164000, populationTrend: "growing", tier: "B" },
  { city: "Regensburg", state: "Bayern", avgRentPerSqm: 11.5, avgPricePerSqm: 3700, population: 157000, populationTrend: "growing", tier: "B" },
  { city: "Erlangen", state: "Bayern", avgRentPerSqm: 11.5, avgPricePerSqm: 3800, population: 113000, populationTrend: "growing", tier: "B" },
  { city: "Potsdam", state: "Brandenburg", avgRentPerSqm: 10.5, avgPricePerSqm: 3500, population: 185000, populationTrend: "growing", tier: "B" },
  { city: "Jena", state: "Thüringen", avgRentPerSqm: 9.0, avgPricePerSqm: 2800, population: 112000, populationTrend: "growing", tier: "B" },
  { city: "Würzburg", state: "Bayern", avgRentPerSqm: 10.5, avgPricePerSqm: 3300, population: 130000, populationTrend: "stable", tier: "B" },
  { city: "Ingolstadt", state: "Bayern", avgRentPerSqm: 11.0, avgPricePerSqm: 3600, population: 140000, populationTrend: "growing", tier: "B" },
  { city: "Ulm", state: "Baden-Württemberg", avgRentPerSqm: 10.5, avgPricePerSqm: 3400, population: 128000, populationTrend: "growing", tier: "B" },
  { city: "Konstanz", state: "Baden-Württemberg", avgRentPerSqm: 12.0, avgPricePerSqm: 4100, population: 85000, populationTrend: "growing", tier: "B" },
  { city: "Tübingen", state: "Baden-Württemberg", avgRentPerSqm: 12.0, avgPricePerSqm: 4000, population: 92000, populationTrend: "growing", tier: "B" },
  { city: "Rosenheim", state: "Bayern", avgRentPerSqm: 11.0, avgPricePerSqm: 3800, population: 65000, populationTrend: "growing", tier: "B" },
  { city: "Aachen", state: "Nordrhein-Westfalen", avgRentPerSqm: 10.0, avgPricePerSqm: 3000, population: 261000, populationTrend: "stable", tier: "B" },
  { city: "Bremen", state: "Bremen", avgRentPerSqm: 9.5, avgPricePerSqm: 2700, population: 569000, populationTrend: "stable", tier: "B" },
  { city: "Essen", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.0, avgPricePerSqm: 2400, population: 584000, populationTrend: "stable", tier: "B" },
  { city: "Dortmund", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.0, avgPricePerSqm: 2400, population: 593000, populationTrend: "stable", tier: "B" },
  { city: "Duisburg", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 502000, populationTrend: "shrinking", tier: "B" },
  { city: "Bochum", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 365000, populationTrend: "stable", tier: "B" },
  { city: "Wuppertal", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 355000, populationTrend: "shrinking", tier: "B" },
  { city: "Bielefeld", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 340000, populationTrend: "stable", tier: "B" },
  { city: "Mannheim", state: "Baden-Württemberg", avgRentPerSqm: 10.5, avgPricePerSqm: 3200, population: 312000, populationTrend: "stable", tier: "B" },
  { city: "Ludwigshafen am Rhein", state: "Rheinland-Pfalz", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 172000, populationTrend: "stable", tier: "B" },
  { city: "Mönchengladbach", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 268000, populationTrend: "stable", tier: "B" },
  { city: "Heilbronn", state: "Baden-Württemberg", avgRentPerSqm: 10.0, avgPricePerSqm: 3100, population: 128000, populationTrend: "growing", tier: "B" },
  { city: "Pforzheim", state: "Baden-Württemberg", avgRentPerSqm: 9.5, avgPricePerSqm: 2600, population: 128000, populationTrend: "stable", tier: "B" },
  { city: "Reutlingen", state: "Baden-Württemberg", avgRentPerSqm: 10.0, avgPricePerSqm: 3200, population: 117000, populationTrend: "stable", tier: "B" },
  { city: "Offenbach am Main", state: "Hessen", avgRentPerSqm: 11.0, avgPricePerSqm: 3500, population: 132000, populationTrend: "growing", tier: "B" },
  { city: "Lübeck", state: "Schleswig-Holstein", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 217000, populationTrend: "stable", tier: "B" },
  { city: "Göttingen", state: "Niedersachsen", avgRentPerSqm: 9.5, avgPricePerSqm: 2600, population: 120000, populationTrend: "stable", tier: "B" },
  { city: "Bamberg", state: "Bayern", avgRentPerSqm: 10.0, avgPricePerSqm: 3200, population: 78000, populationTrend: "stable", tier: "B" },
  { city: "Landshut", state: "Bayern", avgRentPerSqm: 11.0, avgPricePerSqm: 3600, population: 75000, populationTrend: "growing", tier: "B" },
  { city: "Passau", state: "Bayern", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 54000, populationTrend: "stable", tier: "B" },

  // ═══════════════════════════════════════
  // TIER C — Mittelstädte
  // ═══════════════════════════════════════
  { city: "Braunschweig", state: "Niedersachsen", avgRentPerSqm: 9.0, avgPricePerSqm: 2400, population: 249000, populationTrend: "stable", tier: "C" },
  { city: "Kiel", state: "Schleswig-Holstein", avgRentPerSqm: 9.0, avgPricePerSqm: 2400, population: 247000, populationTrend: "stable", tier: "C" },
  { city: "Rostock", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 8.5, avgPricePerSqm: 2300, population: 210000, populationTrend: "stable", tier: "C" },
  { city: "Erfurt", state: "Thüringen", avgRentPerSqm: 8.0, avgPricePerSqm: 2200, population: 214000, populationTrend: "stable", tier: "C" },
  { city: "Magdeburg", state: "Sachsen-Anhalt", avgRentPerSqm: 7.0, avgPricePerSqm: 1800, population: 240000, populationTrend: "stable", tier: "C" },
  { city: "Kassel", state: "Hessen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 204000, populationTrend: "stable", tier: "C" },
  { city: "Osnabrück", state: "Niedersachsen", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 166000, populationTrend: "stable", tier: "C" },
  { city: "Oldenburg", state: "Niedersachsen", avgRentPerSqm: 9.0, avgPricePerSqm: 2400, population: 172000, populationTrend: "growing", tier: "C" },
  { city: "Paderborn", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.5, avgPricePerSqm: 2300, population: 155000, populationTrend: "stable", tier: "C" },
  { city: "Siegen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 102000, populationTrend: "shrinking", tier: "C" },
  { city: "Trier", state: "Rheinland-Pfalz", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 111000, populationTrend: "stable", tier: "C" },
  { city: "Wolfsburg", state: "Niedersachsen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 125000, populationTrend: "stable", tier: "C" },
  { city: "Leverkusen", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 164000, populationTrend: "stable", tier: "C" },
  { city: "Solingen", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 160000, populationTrend: "stable", tier: "C" },
  { city: "Remscheid", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 112000, populationTrend: "shrinking", tier: "C" },
  { city: "Krefeld", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.0, avgPricePerSqm: 2100, population: 228000, populationTrend: "stable", tier: "C" },
  { city: "Oberhausen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 211000, populationTrend: "shrinking", tier: "C" },
  { city: "Hagen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.0, avgPricePerSqm: 1500, population: 189000, populationTrend: "shrinking", tier: "C" },
  { city: "Hamm", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 179000, populationTrend: "stable", tier: "C" },
  { city: "Saarbrücken", state: "Saarland", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 180000, populationTrend: "shrinking", tier: "C" },
  { city: "Mülheim an der Ruhr", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 172000, populationTrend: "stable", tier: "C" },
  { city: "Herne", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.0, avgPricePerSqm: 1500, population: 156000, populationTrend: "shrinking", tier: "C" },
  { city: "Bottrop", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 118000, populationTrend: "shrinking", tier: "C" },
  { city: "Moers", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 104000, populationTrend: "stable", tier: "C" },
  { city: "Hildesheim", state: "Niedersachsen", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 103000, populationTrend: "stable", tier: "C" },
  { city: "Salzgitter", state: "Niedersachsen", avgRentPerSqm: 6.5, avgPricePerSqm: 1400, population: 105000, populationTrend: "shrinking", tier: "C" },
  { city: "Cottbus", state: "Brandenburg", avgRentPerSqm: 7.0, avgPricePerSqm: 1600, population: 100000, populationTrend: "shrinking", tier: "C" },
  { city: "Schwerin", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 100000, populationTrend: "shrinking", tier: "C" },
  { city: "Flensburg", state: "Schleswig-Holstein", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 91000, populationTrend: "stable", tier: "C" },
  { city: "Gießen", state: "Hessen", avgRentPerSqm: 9.5, avgPricePerSqm: 2600, population: 92000, populationTrend: "stable", tier: "C" },
  { city: "Marburg", state: "Hessen", avgRentPerSqm: 9.5, avgPricePerSqm: 2600, population: 77000, populationTrend: "stable", tier: "C" },
  { city: "Fulda", state: "Hessen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 69000, populationTrend: "stable", tier: "C" },
  { city: "Lüneburg", state: "Niedersachsen", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 78000, populationTrend: "growing", tier: "C" },
  { city: "Celle", state: "Niedersachsen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 70000, populationTrend: "stable", tier: "C" },
  { city: "Neumünster", state: "Schleswig-Holstein", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 80000, populationTrend: "stable", tier: "C" },
  { city: "Detmold", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 75000, populationTrend: "stable", tier: "C" },
  { city: "Gütersloh", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 101000, populationTrend: "stable", tier: "C" },
  { city: "Minden", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 83000, populationTrend: "stable", tier: "C" },
  { city: "Herford", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 67000, populationTrend: "stable", tier: "C" },
  { city: "Iserlohn", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 93000, populationTrend: "shrinking", tier: "C" },
  { city: "Lüdenscheid", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.0, avgPricePerSqm: 1500, population: 72000, populationTrend: "shrinking", tier: "C" },
  { city: "Witten", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 97000, populationTrend: "stable", tier: "C" },
  { city: "Bergisch Gladbach", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 112000, populationTrend: "stable", tier: "C" },
  { city: "Recklinghausen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1700, population: 115000, populationTrend: "shrinking", tier: "C" },
  { city: "Neuss", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 160000, populationTrend: "stable", tier: "C" },
  { city: "Ratingen", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 91000, populationTrend: "stable", tier: "C" },
  { city: "Velbert", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 82000, populationTrend: "stable", tier: "C" },
  { city: "Weimar", state: "Thüringen", avgRentPerSqm: 7.5, avgPricePerSqm: 2000, population: 65000, populationTrend: "stable", tier: "C" },
  { city: "Gera", state: "Thüringen", avgRentPerSqm: 6.0, avgPricePerSqm: 1200, population: 93000, populationTrend: "shrinking", tier: "C" },
  { city: "Zwickau", state: "Sachsen", avgRentPerSqm: 6.0, avgPricePerSqm: 1100, population: 89000, populationTrend: "shrinking", tier: "C" },
  { city: "Plauen", state: "Sachsen", avgRentPerSqm: 5.5, avgPricePerSqm: 1000, population: 64000, populationTrend: "shrinking", tier: "C" },
  { city: "Stralsund", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 59000, populationTrend: "stable", tier: "C" },
  { city: "Greifswald", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 8.0, avgPricePerSqm: 2200, population: 59000, populationTrend: "growing", tier: "C" },
  { city: "Neubrandenburg", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 6.5, avgPricePerSqm: 1400, population: 63000, populationTrend: "shrinking", tier: "C" },
  { city: "Brandenburg an der Havel", state: "Brandenburg", avgRentPerSqm: 7.0, avgPricePerSqm: 1600, population: 73000, populationTrend: "stable", tier: "C" },
  { city: "Frankfurt (Oder)", state: "Brandenburg", avgRentPerSqm: 6.5, avgPricePerSqm: 1400, population: 58000, populationTrend: "shrinking", tier: "C" },
  { city: "Kaiserslautern", state: "Rheinland-Pfalz", avgRentPerSqm: 8.0, avgPricePerSqm: 2000, population: 101000, populationTrend: "stable", tier: "C" },
  { city: "Koblenz", state: "Rheinland-Pfalz", avgRentPerSqm: 8.5, avgPricePerSqm: 2300, population: 114000, populationTrend: "stable", tier: "C" },
  { city: "Villingen-Schwenningen", state: "Baden-Württemberg", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 87000, populationTrend: "stable", tier: "C" },
  { city: "Friedrichshafen", state: "Baden-Württemberg", avgRentPerSqm: 10.0, avgPricePerSqm: 3200, population: 62000, populationTrend: "stable", tier: "C" },
  { city: "Ravensburg", state: "Baden-Württemberg", avgRentPerSqm: 10.0, avgPricePerSqm: 3200, population: 52000, populationTrend: "stable", tier: "C" },
  { city: "Sindelfingen", state: "Baden-Württemberg", avgRentPerSqm: 11.0, avgPricePerSqm: 3500, population: 65000, populationTrend: "stable", tier: "C" },
  { city: "Esslingen am Neckar", state: "Baden-Württemberg", avgRentPerSqm: 11.0, avgPricePerSqm: 3500, population: 95000, populationTrend: "stable", tier: "C" },
  { city: "Ludwigsburg", state: "Baden-Württemberg", avgRentPerSqm: 11.5, avgPricePerSqm: 3700, population: 94000, populationTrend: "stable", tier: "C" },
  { city: "Göppingen", state: "Baden-Württemberg", avgRentPerSqm: 9.0, avgPricePerSqm: 2500, population: 58000, populationTrend: "stable", tier: "C" },
  { city: "Waiblingen", state: "Baden-Württemberg", avgRentPerSqm: 10.5, avgPricePerSqm: 3400, population: 57000, populationTrend: "stable", tier: "C" },
  { city: "Schweinfurt", state: "Bayern", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 54000, populationTrend: "shrinking", tier: "C" },
  { city: "Bayreuth", state: "Bayern", avgRentPerSqm: 8.5, avgPricePerSqm: 2200, population: 75000, populationTrend: "stable", tier: "C" },
  { city: "Aschaffenburg", state: "Bayern", avgRentPerSqm: 9.5, avgPricePerSqm: 2800, population: 72000, populationTrend: "stable", tier: "C" },
  { city: "Coburg", state: "Bayern", avgRentPerSqm: 7.5, avgPricePerSqm: 1800, population: 42000, populationTrend: "stable", tier: "C" },
  { city: "Kempten", state: "Bayern", avgRentPerSqm: 10.0, avgPricePerSqm: 3200, population: 70000, populationTrend: "growing", tier: "C" },
  { city: "Neu-Ulm", state: "Bayern", avgRentPerSqm: 10.0, avgPricePerSqm: 3000, population: 60000, populationTrend: "growing", tier: "C" },

  // ═══════════════════════════════════════
  // TIER D — Strukturschwache Städte
  // ═══════════════════════════════════════
  { city: "Chemnitz", state: "Sachsen", avgRentPerSqm: 6.0, avgPricePerSqm: 1200, population: 250000, populationTrend: "shrinking", tier: "D" },
  { city: "Halle (Saale)", state: "Sachsen-Anhalt", avgRentPerSqm: 6.5, avgPricePerSqm: 1400, population: 242000, populationTrend: "shrinking", tier: "D" },
  { city: "Dessau-Roßlau", state: "Sachsen-Anhalt", avgRentPerSqm: 5.5, avgPricePerSqm: 900, population: 81000, populationTrend: "shrinking", tier: "D" },
  { city: "Bremerhaven", state: "Bremen", avgRentPerSqm: 7.0, avgPricePerSqm: 1300, population: 114000, populationTrend: "shrinking", tier: "D" },
  { city: "Gelsenkirchen", state: "Nordrhein-Westfalen", avgRentPerSqm: 6.5, avgPricePerSqm: 1300, population: 263000, populationTrend: "shrinking", tier: "D" },
  { city: "Salzgitter", state: "Niedersachsen", avgRentPerSqm: 6.5, avgPricePerSqm: 1400, population: 105000, populationTrend: "shrinking", tier: "D" },
  { city: "Pirmasens", state: "Rheinland-Pfalz", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 41000, populationTrend: "shrinking", tier: "D" },
  { city: "Wilhelmshaven", state: "Niedersachsen", avgRentPerSqm: 6.5, avgPricePerSqm: 1200, population: 77000, populationTrend: "shrinking", tier: "D" },
  { city: "Delmenhorst", state: "Niedersachsen", avgRentPerSqm: 7.5, avgPricePerSqm: 1600, population: 82000, populationTrend: "stable", tier: "D" },
  { city: "Weiden in der Oberpfalz", state: "Bayern", avgRentPerSqm: 7.0, avgPricePerSqm: 1600, population: 43000, populationTrend: "stable", tier: "D" },
  { city: "Hof", state: "Bayern", avgRentPerSqm: 6.0, avgPricePerSqm: 1100, population: 46000, populationTrend: "shrinking", tier: "D" },
  { city: "Suhl", state: "Thüringen", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 36000, populationTrend: "shrinking", tier: "D" },
  { city: "Eisenach", state: "Thüringen", avgRentPerSqm: 6.0, avgPricePerSqm: 1100, population: 42000, populationTrend: "shrinking", tier: "D" },
  { city: "Nordhausen", state: "Thüringen", avgRentPerSqm: 5.5, avgPricePerSqm: 900, population: 42000, populationTrend: "shrinking", tier: "D" },
  { city: "Stendal", state: "Sachsen-Anhalt", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 39000, populationTrend: "shrinking", tier: "D" },
  { city: "Sangerhausen", state: "Sachsen-Anhalt", avgRentPerSqm: 5.0, avgPricePerSqm: 700, population: 27000, populationTrend: "shrinking", tier: "D" },
  { city: "Wittenberg", state: "Sachsen-Anhalt", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 46000, populationTrend: "shrinking", tier: "D" },
  { city: "Weißenfels", state: "Sachsen-Anhalt", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 40000, populationTrend: "shrinking", tier: "D" },
  { city: "Görlitz", state: "Sachsen", avgRentPerSqm: 6.0, avgPricePerSqm: 1100, population: 56000, populationTrend: "shrinking", tier: "D" },
  { city: "Bautzen", state: "Sachsen", avgRentPerSqm: 6.0, avgPricePerSqm: 1100, population: 39000, populationTrend: "shrinking", tier: "D" },
  { city: "Wismar", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.0, avgPricePerSqm: 1500, population: 44000, populationTrend: "stable", tier: "D" },
  { city: "Völklingen", state: "Saarland", avgRentPerSqm: 6.5, avgPricePerSqm: 1100, population: 39000, populationTrend: "shrinking", tier: "D" },
  { city: "Neunkirchen", state: "Saarland", avgRentPerSqm: 6.5, avgPricePerSqm: 1100, population: 47000, populationTrend: "shrinking", tier: "D" },
  { city: "Idar-Oberstein", state: "Rheinland-Pfalz", avgRentPerSqm: 5.5, avgPricePerSqm: 800, population: 29000, populationTrend: "shrinking", tier: "D" },
  { city: "Zweibrücken", state: "Rheinland-Pfalz", avgRentPerSqm: 6.0, avgPricePerSqm: 1000, population: 34000, populationTrend: "shrinking", tier: "D" },
];

// ─── Umlaut normalization ───
const UMLAUT_MAP: Record<string, string> = {
  ä: "ae", ö: "oe", ü: "ue", ß: "ss",
  ae: "ä", oe: "ö", ue: "ü",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äöüß]/g, (ch) => UMLAUT_MAP[ch] || ch)
    .replace(/[-–—()/,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find city data by name. Supports:
 * - Case-insensitive matching
 * - Umlaut normalization (Muenchen → München)
 * - Partial/substring matching (e.g. "Essen" matches even in "Essen-Rüttenscheid")
 */
export function findCityData(cityName: string): CityData | null {
  if (!cityName) return null;
  const input = normalize(cityName);

  // 1. Exact normalized match
  for (const c of CITIES) {
    if (normalize(c.city) === input) return c;
  }

  // 2. Input contains city name (e.g. "Frankfurt am Main" in "Frankfurt")
  for (const c of CITIES) {
    const nc = normalize(c.city);
    if (input.includes(nc) || nc.includes(input)) return c;
  }

  // 3. First-word match for compound city names (e.g. "Freiburg" matches "Freiburg im Breisgau")
  const inputFirst = input.split(" ")[0];
  if (inputFirst.length >= 4) {
    for (const c of CITIES) {
      const cityFirst = normalize(c.city).split(" ")[0];
      if (cityFirst === inputFirst) return c;
    }
  }

  return null;
}

export { CITIES };
