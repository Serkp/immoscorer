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
  vacancyRate: number; // Leerstandsquote in %
  tier: "A" | "B" | "C" | "D";
}

const CITIES: CityData[] = [
  // ═══════════════════════════════════════
  // TIER A — Top 7 Metropolen
  // ═══════════════════════════════════════
  { city: "München", state: "Bayern", avgRentPerSqm: 21.50, avgPricePerSqm: 9200, population: 1500000, populationTrend: "growing", vacancyRate: 0.2, tier: "A" },
  { city: "Frankfurt am Main", state: "Hessen", avgRentPerSqm: 15.50, avgPricePerSqm: 5800, population: 760000, populationTrend: "growing", vacancyRate: 0.5, tier: "A" },
  { city: "Hamburg", state: "Hamburg", avgRentPerSqm: 14.00, avgPricePerSqm: 5500, population: 1900000, populationTrend: "growing", vacancyRate: 0.5, tier: "A" },
  { city: "Berlin", state: "Berlin", avgRentPerSqm: 13.50, avgPricePerSqm: 5000, population: 3700000, populationTrend: "growing", vacancyRate: 0.8, tier: "A" },
  { city: "Stuttgart", state: "Baden-Württemberg", avgRentPerSqm: 15.00, avgPricePerSqm: 5200, population: 630000, populationTrend: "stable", vacancyRate: 0.4, tier: "A" },
  { city: "Düsseldorf", state: "Nordrhein-Westfalen", avgRentPerSqm: 13.00, avgPricePerSqm: 4500, population: 620000, populationTrend: "stable", vacancyRate: 0.6, tier: "A" },
  { city: "Köln", state: "Nordrhein-Westfalen", avgRentPerSqm: 13.00, avgPricePerSqm: 4200, population: 1080000, populationTrend: "growing", vacancyRate: 0.7, tier: "A" },

  // ═══════════════════════════════════════
  // TIER B — Starke Großstädte
  // ═══════════════════════════════════════
  { city: "Nürnberg", state: "Bayern", avgRentPerSqm: 11.50, avgPricePerSqm: 3500, population: 520000, populationTrend: "stable", vacancyRate: 1.0, tier: "B" },
  { city: "Hannover", state: "Niedersachsen", avgRentPerSqm: 10.50, avgPricePerSqm: 3200, population: 535000, populationTrend: "stable", vacancyRate: 1.2, tier: "B" },
  { city: "Leipzig", state: "Sachsen", avgRentPerSqm: 8.50, avgPricePerSqm: 2600, population: 600000, populationTrend: "growing", vacancyRate: 2.5, tier: "B" },
  { city: "Dresden", state: "Sachsen", avgRentPerSqm: 9.00, avgPricePerSqm: 2800, population: 560000, populationTrend: "stable", vacancyRate: 2.0, tier: "B" },
  { city: "Bonn", state: "Nordrhein-Westfalen", avgRentPerSqm: 12.00, avgPricePerSqm: 3800, population: 330000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Münster", state: "Nordrhein-Westfalen", avgRentPerSqm: 12.50, avgPricePerSqm: 4000, population: 320000, populationTrend: "growing", vacancyRate: 0.5, tier: "B" },
  { city: "Freiburg im Breisgau", state: "Baden-Württemberg", avgRentPerSqm: 13.50, avgPricePerSqm: 4500, population: 230000, populationTrend: "growing", vacancyRate: 0.3, tier: "B" },
  { city: "Heidelberg", state: "Baden-Württemberg", avgRentPerSqm: 13.00, avgPricePerSqm: 4200, population: 160000, populationTrend: "stable", vacancyRate: 0.5, tier: "B" },
  { city: "Mainz", state: "Rheinland-Pfalz", avgRentPerSqm: 12.00, avgPricePerSqm: 3800, population: 220000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Augsburg", state: "Bayern", avgRentPerSqm: 11.00, avgPricePerSqm: 3400, population: 300000, populationTrend: "growing", vacancyRate: 0.9, tier: "B" },
  { city: "Karlsruhe", state: "Baden-Württemberg", avgRentPerSqm: 11.50, avgPricePerSqm: 3500, population: 310000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Wiesbaden", state: "Hessen", avgRentPerSqm: 12.50, avgPricePerSqm: 4000, population: 280000, populationTrend: "stable", vacancyRate: 0.7, tier: "B" },
  { city: "Darmstadt", state: "Hessen", avgRentPerSqm: 12.50, avgPricePerSqm: 4200, population: 160000, populationTrend: "stable", vacancyRate: 0.6, tier: "B" },
  { city: "Regensburg", state: "Bayern", avgRentPerSqm: 12.00, avgPricePerSqm: 4000, population: 155000, populationTrend: "growing", vacancyRate: 0.5, tier: "B" },
  { city: "Erlangen", state: "Bayern", avgRentPerSqm: 12.50, avgPricePerSqm: 4000, population: 115000, populationTrend: "stable", vacancyRate: 0.4, tier: "B" },
  { city: "Potsdam", state: "Brandenburg", avgRentPerSqm: 11.00, avgPricePerSqm: 3800, population: 185000, populationTrend: "growing", vacancyRate: 0.6, tier: "B" },
  { city: "Jena", state: "Thüringen", avgRentPerSqm: 9.50, avgPricePerSqm: 3000, population: 110000, populationTrend: "stable", vacancyRate: 1.0, tier: "B" },
  { city: "Ulm", state: "Baden-Württemberg", avgRentPerSqm: 11.50, avgPricePerSqm: 3600, population: 130000, populationTrend: "stable", vacancyRate: 0.6, tier: "B" },
  { city: "Ingolstadt", state: "Bayern", avgRentPerSqm: 12.00, avgPricePerSqm: 3800, population: 140000, populationTrend: "stable", vacancyRate: 0.5, tier: "B" },
  { city: "Aachen", state: "Nordrhein-Westfalen", avgRentPerSqm: 10.50, avgPricePerSqm: 3000, population: 250000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Lübeck", state: "Schleswig-Holstein", avgRentPerSqm: 10.00, avgPricePerSqm: 3000, population: 220000, populationTrend: "stable", vacancyRate: 1.2, tier: "B" },
  { city: "Braunschweig", state: "Niedersachsen", avgRentPerSqm: 9.50, avgPricePerSqm: 2700, population: 250000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Kiel", state: "Schleswig-Holstein", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 250000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Rostock", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 8.50, avgPricePerSqm: 2500, population: 210000, populationTrend: "stable", vacancyRate: 2.0, tier: "B" },
  { city: "Essen", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 580000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "B" },
  { city: "Dortmund", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 590000, populationTrend: "stable", vacancyRate: 2.0, tier: "B" },
  { city: "Duisburg", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 500000, populationTrend: "shrinking", vacancyRate: 3.0, tier: "B" },
  { city: "Wuppertal", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1700, population: 360000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "B" },
  { city: "Bochum", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 365000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "B" },
  { city: "Bremen", state: "Bremen", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 570000, populationTrend: "stable", vacancyRate: 1.8, tier: "B" },
  { city: "Mannheim", state: "Baden-Württemberg", avgRentPerSqm: 10.50, avgPricePerSqm: 3000, population: 310000, populationTrend: "stable", vacancyRate: 1.2, tier: "B" },
  { city: "Bielefeld", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2300, population: 340000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Würzburg", state: "Bayern", avgRentPerSqm: 11.00, avgPricePerSqm: 3500, population: 130000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Göttingen", state: "Niedersachsen", avgRentPerSqm: 10.00, avgPricePerSqm: 2800, population: 120000, populationTrend: "stable", vacancyRate: 1.0, tier: "B" },
  { city: "Konstanz", state: "Baden-Württemberg", avgRentPerSqm: 12.00, avgPricePerSqm: 4000, population: 85000, populationTrend: "stable", vacancyRate: 0.5, tier: "B" },
  { city: "Tübingen", state: "Baden-Württemberg", avgRentPerSqm: 12.00, avgPricePerSqm: 4000, population: 92000, populationTrend: "growing", vacancyRate: 0.4, tier: "B" },
  { city: "Rosenheim", state: "Bayern", avgRentPerSqm: 11.00, avgPricePerSqm: 3800, population: 65000, populationTrend: "growing", vacancyRate: 0.5, tier: "B" },
  { city: "Bamberg", state: "Bayern", avgRentPerSqm: 10.00, avgPricePerSqm: 3000, population: 78000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Landshut", state: "Bayern", avgRentPerSqm: 11.00, avgPricePerSqm: 3600, population: 75000, populationTrend: "growing", vacancyRate: 0.5, tier: "B" },
  { city: "Passau", state: "Bayern", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 54000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Ludwigshafen am Rhein", state: "Rheinland-Pfalz", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 172000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Mönchengladbach", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 268000, populationTrend: "stable", vacancyRate: 2.0, tier: "B" },
  { city: "Heilbronn", state: "Baden-Württemberg", avgRentPerSqm: 10.00, avgPricePerSqm: 3100, population: 128000, populationTrend: "growing", vacancyRate: 0.8, tier: "B" },
  { city: "Pforzheim", state: "Baden-Württemberg", avgRentPerSqm: 9.50, avgPricePerSqm: 2600, population: 128000, populationTrend: "stable", vacancyRate: 1.5, tier: "B" },
  { city: "Reutlingen", state: "Baden-Württemberg", avgRentPerSqm: 10.00, avgPricePerSqm: 3200, population: 117000, populationTrend: "stable", vacancyRate: 0.8, tier: "B" },
  { city: "Offenbach am Main", state: "Hessen", avgRentPerSqm: 11.00, avgPricePerSqm: 3500, population: 132000, populationTrend: "growing", vacancyRate: 0.7, tier: "B" },

  // ═══════════════════════════════════════
  // TIER C — Mittelstädte
  // ═══════════════════════════════════════
  { city: "Erfurt", state: "Thüringen", avgRentPerSqm: 8.00, avgPricePerSqm: 2200, population: 215000, populationTrend: "stable", vacancyRate: 2.5, tier: "C" },
  { city: "Magdeburg", state: "Sachsen-Anhalt", avgRentPerSqm: 7.00, avgPricePerSqm: 1600, population: 240000, populationTrend: "stable", vacancyRate: 4.0, tier: "C" },
  { city: "Kassel", state: "Hessen", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 200000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Osnabrück", state: "Niedersachsen", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 170000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Oldenburg", state: "Niedersachsen", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 170000, populationTrend: "stable", vacancyRate: 1.2, tier: "C" },
  { city: "Paderborn", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 155000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Siegen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 100000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Trier", state: "Rheinland-Pfalz", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 110000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Flensburg", state: "Schleswig-Holstein", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 90000, populationTrend: "stable", vacancyRate: 1.8, tier: "C" },
  { city: "Wolfsburg", state: "Niedersachsen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 125000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Hildesheim", state: "Niedersachsen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 100000, populationTrend: "stable", vacancyRate: 2.5, tier: "C" },
  { city: "Marburg", state: "Hessen", avgRentPerSqm: 9.50, avgPricePerSqm: 2500, population: 77000, populationTrend: "stable", vacancyRate: 1.0, tier: "C" },
  { city: "Schwerin", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.00, avgPricePerSqm: 1500, population: 100000, populationTrend: "shrinking", vacancyRate: 4.5, tier: "C" },
  { city: "Cottbus", state: "Brandenburg", avgRentPerSqm: 6.50, avgPricePerSqm: 1200, population: 100000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "C" },
  { city: "Leverkusen", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.00, avgPricePerSqm: 2500, population: 164000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Solingen", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 160000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Remscheid", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1700, population: 112000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Krefeld", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.00, avgPricePerSqm: 2100, population: 228000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Oberhausen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 211000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Hagen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.00, avgPricePerSqm: 1500, population: 189000, populationTrend: "shrinking", vacancyRate: 3.0, tier: "C" },
  { city: "Hamm", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 179000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Saarbrücken", state: "Saarland", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 180000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Mülheim an der Ruhr", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 172000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Herne", state: "Nordrhein-Westfalen", avgRentPerSqm: 6.50, avgPricePerSqm: 1100, population: 155000, populationTrend: "shrinking", vacancyRate: 4.0, tier: "C" },
  { city: "Bottrop", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 118000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Gießen", state: "Hessen", avgRentPerSqm: 9.50, avgPricePerSqm: 2600, population: 92000, populationTrend: "stable", vacancyRate: 1.0, tier: "C" },
  { city: "Fulda", state: "Hessen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 69000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Lüneburg", state: "Niedersachsen", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 78000, populationTrend: "growing", vacancyRate: 0.8, tier: "C" },
  { city: "Celle", state: "Niedersachsen", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 70000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Neumünster", state: "Schleswig-Holstein", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 80000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Gütersloh", state: "Nordrhein-Westfalen", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 101000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Koblenz", state: "Rheinland-Pfalz", avgRentPerSqm: 8.50, avgPricePerSqm: 2300, population: 114000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Kaiserslautern", state: "Rheinland-Pfalz", avgRentPerSqm: 8.00, avgPricePerSqm: 2000, population: 101000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Bergisch Gladbach", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 112000, populationTrend: "stable", vacancyRate: 1.2, tier: "C" },
  { city: "Neuss", state: "Nordrhein-Westfalen", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 160000, populationTrend: "stable", vacancyRate: 1.2, tier: "C" },
  { city: "Weimar", state: "Thüringen", avgRentPerSqm: 7.50, avgPricePerSqm: 2000, population: 65000, populationTrend: "stable", vacancyRate: 2.5, tier: "C" },
  { city: "Bayreuth", state: "Bayern", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 75000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Aschaffenburg", state: "Bayern", avgRentPerSqm: 9.50, avgPricePerSqm: 2800, population: 72000, populationTrend: "stable", vacancyRate: 1.0, tier: "C" },
  { city: "Kempten", state: "Bayern", avgRentPerSqm: 10.00, avgPricePerSqm: 3200, population: 70000, populationTrend: "growing", vacancyRate: 0.8, tier: "C" },
  { city: "Schweinfurt", state: "Bayern", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 54000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Coburg", state: "Bayern", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 42000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Friedrichshafen", state: "Baden-Württemberg", avgRentPerSqm: 10.00, avgPricePerSqm: 3200, population: 62000, populationTrend: "stable", vacancyRate: 0.8, tier: "C" },
  { city: "Sindelfingen", state: "Baden-Württemberg", avgRentPerSqm: 11.00, avgPricePerSqm: 3500, population: 65000, populationTrend: "stable", vacancyRate: 0.8, tier: "C" },
  { city: "Esslingen am Neckar", state: "Baden-Württemberg", avgRentPerSqm: 11.00, avgPricePerSqm: 3500, population: 95000, populationTrend: "stable", vacancyRate: 0.7, tier: "C" },
  { city: "Ludwigsburg", state: "Baden-Württemberg", avgRentPerSqm: 11.50, avgPricePerSqm: 3700, population: 94000, populationTrend: "stable", vacancyRate: 0.6, tier: "C" },
  { city: "Greifswald", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 8.00, avgPricePerSqm: 2200, population: 59000, populationTrend: "growing", vacancyRate: 1.5, tier: "C" },
  { city: "Stralsund", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.50, avgPricePerSqm: 1800, population: 59000, populationTrend: "stable", vacancyRate: 2.5, tier: "C" },
  { city: "Brandenburg an der Havel", state: "Brandenburg", avgRentPerSqm: 7.00, avgPricePerSqm: 1600, population: 73000, populationTrend: "stable", vacancyRate: 3.0, tier: "C" },
  { city: "Frankfurt (Oder)", state: "Brandenburg", avgRentPerSqm: 6.50, avgPricePerSqm: 1400, population: 58000, populationTrend: "shrinking", vacancyRate: 4.0, tier: "C" },
  { city: "Gera", state: "Thüringen", avgRentPerSqm: 6.00, avgPricePerSqm: 1200, population: 93000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "C" },
  { city: "Zwickau", state: "Sachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1100, population: 89000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "C" },
  { city: "Plauen", state: "Sachsen", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 65000, populationTrend: "shrinking", vacancyRate: 7.0, tier: "C" },
  { city: "Neubrandenburg", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 6.50, avgPricePerSqm: 1400, population: 63000, populationTrend: "shrinking", vacancyRate: 4.0, tier: "C" },
  { city: "Villingen-Schwenningen", state: "Baden-Württemberg", avgRentPerSqm: 8.50, avgPricePerSqm: 2200, population: 87000, populationTrend: "stable", vacancyRate: 1.5, tier: "C" },
  { city: "Ravensburg", state: "Baden-Württemberg", avgRentPerSqm: 10.00, avgPricePerSqm: 3200, population: 52000, populationTrend: "stable", vacancyRate: 0.8, tier: "C" },
  { city: "Recklinghausen", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1700, population: 115000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Iserlohn", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1700, population: 93000, populationTrend: "shrinking", vacancyRate: 2.5, tier: "C" },
  { city: "Detmold", state: "Nordrhein-Westfalen", avgRentPerSqm: 7.50, avgPricePerSqm: 1700, population: 75000, populationTrend: "stable", vacancyRate: 2.0, tier: "C" },
  { city: "Salzgitter", state: "Niedersachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1000, population: 105000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "C" },

  // ═══════════════════════════════════════
  // TIER D — Strukturschwache Städte
  // ═══════════════════════════════════════
  { city: "Chemnitz", state: "Sachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1100, population: 250000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Halle (Saale)", state: "Sachsen-Anhalt", avgRentPerSqm: 6.50, avgPricePerSqm: 1200, population: 240000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "D" },
  { city: "Dessau-Roßlau", state: "Sachsen-Anhalt", avgRentPerSqm: 5.50, avgPricePerSqm: 900, population: 80000, populationTrend: "shrinking", vacancyRate: 8.0, tier: "D" },
  { city: "Bremerhaven", state: "Bremen", avgRentPerSqm: 6.00, avgPricePerSqm: 1000, population: 115000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "D" },
  { city: "Gelsenkirchen", state: "Nordrhein-Westfalen", avgRentPerSqm: 6.50, avgPricePerSqm: 1100, population: 260000, populationTrend: "shrinking", vacancyRate: 4.5, tier: "D" },
  { city: "Pirmasens", state: "Rheinland-Pfalz", avgRentPerSqm: 5.00, avgPricePerSqm: 700, population: 40000, populationTrend: "shrinking", vacancyRate: 8.0, tier: "D" },
  { city: "Wilhelmshaven", state: "Niedersachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1000, population: 75000, populationTrend: "shrinking", vacancyRate: 5.5, tier: "D" },
  { city: "Hof", state: "Bayern", avgRentPerSqm: 5.50, avgPricePerSqm: 900, population: 45000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Suhl", state: "Thüringen", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 35000, populationTrend: "shrinking", vacancyRate: 7.0, tier: "D" },
  { city: "Görlitz", state: "Sachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1000, population: 55000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Delmenhorst", state: "Niedersachsen", avgRentPerSqm: 7.50, avgPricePerSqm: 1600, population: 82000, populationTrend: "stable", vacancyRate: 3.0, tier: "D" },
  { city: "Weiden in der Oberpfalz", state: "Bayern", avgRentPerSqm: 7.00, avgPricePerSqm: 1600, population: 43000, populationTrend: "stable", vacancyRate: 3.0, tier: "D" },
  { city: "Eisenach", state: "Thüringen", avgRentPerSqm: 6.00, avgPricePerSqm: 1100, population: 42000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "D" },
  { city: "Nordhausen", state: "Thüringen", avgRentPerSqm: 5.50, avgPricePerSqm: 900, population: 42000, populationTrend: "shrinking", vacancyRate: 5.5, tier: "D" },
  { city: "Stendal", state: "Sachsen-Anhalt", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 39000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Sangerhausen", state: "Sachsen-Anhalt", avgRentPerSqm: 5.00, avgPricePerSqm: 700, population: 27000, populationTrend: "shrinking", vacancyRate: 7.0, tier: "D" },
  { city: "Wittenberg", state: "Sachsen-Anhalt", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 46000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Weißenfels", state: "Sachsen-Anhalt", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 40000, populationTrend: "shrinking", vacancyRate: 6.5, tier: "D" },
  { city: "Bautzen", state: "Sachsen", avgRentPerSqm: 6.00, avgPricePerSqm: 1100, population: 39000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "D" },
  { city: "Wismar", state: "Mecklenburg-Vorpommern", avgRentPerSqm: 7.00, avgPricePerSqm: 1500, population: 44000, populationTrend: "stable", vacancyRate: 3.5, tier: "D" },
  { city: "Völklingen", state: "Saarland", avgRentPerSqm: 6.50, avgPricePerSqm: 1100, population: 39000, populationTrend: "shrinking", vacancyRate: 4.5, tier: "D" },
  { city: "Neunkirchen", state: "Saarland", avgRentPerSqm: 6.50, avgPricePerSqm: 1100, population: 47000, populationTrend: "shrinking", vacancyRate: 4.5, tier: "D" },
  { city: "Idar-Oberstein", state: "Rheinland-Pfalz", avgRentPerSqm: 5.50, avgPricePerSqm: 800, population: 29000, populationTrend: "shrinking", vacancyRate: 6.0, tier: "D" },
  { city: "Zweibrücken", state: "Rheinland-Pfalz", avgRentPerSqm: 6.00, avgPricePerSqm: 1000, population: 34000, populationTrend: "shrinking", vacancyRate: 5.0, tier: "D" },
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

/**
 * Ortsübliche Spanne (Orientierung) um den kuratierten Mittelwert.
 * Innerstädtische Streuung ist in Top-Lagen größer als in einfachen Märkten,
 * daher tier-abhängiger Spread. Keine flurstückgenauen Werte — eine
 * realistische Bandbreite, in der sich Angebote der Stadt typischerweise bewegen.
 */
const TIER_SPREAD: Record<CityData["tier"], number> = { A: 0.35, B: 0.28, C: 0.22, D: 0.20 };

export interface MarketRange {
  priceMin: number;
  priceMax: number;
  rentMin: number;
  rentMax: number;
  spreadPct: number;
}

export function getMarketRange(c: CityData): MarketRange {
  const s = TIER_SPREAD[c.tier] ?? 0.25;
  const round = (n: number, step: number) => Math.round(n / step) * step;
  return {
    priceMin: round(c.avgPricePerSqm * (1 - s), 50),
    priceMax: round(c.avgPricePerSqm * (1 + s), 50),
    rentMin: Math.round(c.avgRentPerSqm * (1 - s) * 10) / 10,
    rentMax: Math.round(c.avgRentPerSqm * (1 + s) * 10) / 10,
    spreadPct: Math.round(s * 100),
  };
}
