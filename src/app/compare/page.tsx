"use client";

import { useEffect, useState } from "react";
import { getProperties } from "@/lib/storage";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Property } from "@/lib/types";

function explain(a: Property, b: Property): string {
  const reasons: string[] = [];

  const yieldA = (a.monthlyRent * 12) / a.purchasePrice;
  const yieldB = (b.monthlyRent * 12) / b.purchasePrice;
  if (yieldA > yieldB) reasons.push("h\u00F6here Bruttorendite");
  else if (yieldB > yieldA) reasons.push("niedrigere Bruttorendite");

  const psmA = a.purchasePrice / a.areaSqm;
  const psmB = b.purchasePrice / b.areaSqm;
  if (psmA < psmB) reasons.push("g\u00FCnstigerer m\u00B2-Preis");
  else if (psmB < psmA) reasons.push("h\u00F6herer m\u00B2-Preis");

  const renoA = Object.values(a.renovations).filter(Boolean).length;
  const renoB = Object.values(b.renovations).filter(Boolean).length;
  if (renoA < renoB) reasons.push("weniger Sanierungsbedarf");
  else if (renoB < renoA) reasons.push("mehr Sanierungsbedarf");

  if (a.locationGrade < b.locationGrade) reasons.push("bessere Lageklasse");
  if (a.energyClass < b.energyClass) reasons.push("bessere Energieeffizienz");

  if (a.score > b.score) {
    return `${a.street} erzielt einen h\u00F6heren Score aufgrund von ${reasons.slice(0, 3).join(", ") || "insgesamt besseren Kennzahlen"}.`;
  } else if (b.score > a.score) {
    const bReasons: string[] = [];
    if (yieldB > yieldA) bReasons.push("h\u00F6here Bruttorendite");
    if (psmB < psmA) bReasons.push("g\u00FCnstigerer m\u00B2-Preis");
    if (renoB < renoA) bReasons.push("weniger Sanierungsbedarf");
    if (b.locationGrade < a.locationGrade) bReasons.push("bessere Lageklasse");
    return `${b.street} erzielt einen h\u00F6heren Score aufgrund von ${bReasons.slice(0, 3).join(", ") || "insgesamt besseren Kennzahlen"}.`;
  }
  return "Beide Immobilien erzielen den gleichen Score \u2013 pr\u00FCfen Sie die Detaildaten f\u00FCr feinere Unterschiede.";
}

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProperties(getProperties());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const favorites = properties.filter((p) => p.favorite);
  const comparables = favorites.length >= 2 ? favorites : properties.slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Immobilien vergleichen</h1>
        <p className="section-subtitle mt-0.5">
          {favorites.length >= 2
            ? `${favorites.length} favorisierte Immobilien im Vergleich.`
            : "Markieren Sie mindestens 2 Immobilien als Favoriten."}
        </p>
      </div>

      {comparables.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{"\u2696\uFE0F"}</span>
          </div>
          <p className="font-bold text-lg">Keine Immobilien zum Vergleich</p>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-sm mx-auto">
            Speichern Sie zun\u00E4chst Immobilien \u00FCber die <a href="/analysis" className="text-[var(--accent)] font-semibold hover:underline">Analyse</a>.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 min-w-full pb-2">
              {comparables.map((p) => (
                <div key={p.id} className="w-72 flex-shrink-0 card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{p.street}</p>
                      <p className="text-xs text-[var(--muted)]">{p.city}</p>
                    </div>
                    <ScoreBadge score={p.score} size="lg" />
                  </div>

                  <div className="h-28 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center overflow-hidden">
                    {p.exposeImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.exposeImageUrl} alt={p.street} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl opacity-40">{"\uD83C\uDFE0"}</span>
                    )}
                  </div>

                  <ProgressBar value={p.score} label="Score" />

                  <div className="space-y-2 text-sm">
                    <Row label="Kaufpreis" value={`\u20AC${p.purchasePrice.toLocaleString()}`} />
                    <Row label="Kaltmiete" value={`\u20AC${p.monthlyRent.toLocaleString()}/Mon.`} />
                    <Row label="Rendite" value={`${((p.monthlyRent * 12) / p.purchasePrice * 100).toFixed(1)}%`} highlight />
                    <Row label="\u20AC/m\u00B2" value={`\u20AC${Math.round(p.purchasePrice / p.areaSqm).toLocaleString()}`} />
                    <Row label="Fl\u00E4che" value={`${p.areaSqm}\u00A0m\u00B2`} />
                    <Row label="Baujahr" value={String(p.baujahr)} />
                    <Row label="Energie" value={p.energyClass} />
                    <Row label="Lage" value={`Klasse\u00A0${p.locationGrade}`} />
                    <Row label="Sanierungen" value={`${Object.values(p.renovations).filter(Boolean).length}/6`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pairwise explanations */}
          {comparables.length >= 2 && (
            <div className="card p-6 space-y-4">
              <h3 className="section-title">Vergleichsanalyse</h3>
              {comparables.slice(0, -1).map((a, i) => {
                const b = comparables[i + 1];
                return (
                  <div key={`${a.id}-${b.id}`} className="text-sm text-[var(--muted)] border-l-2 border-[var(--accent)] pl-4">
                    <p className="font-semibold text-[var(--fg)]">
                      {a.street} vs. {b.street}
                    </p>
                    <p className="mt-0.5">{explain(a, b)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={highlight ? "font-bold text-[var(--accent)]" : "font-medium"}>{value}</span>
    </div>
  );
}
