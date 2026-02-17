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
  if (yieldA > yieldB) reasons.push("higher gross yield");
  else if (yieldB > yieldA) reasons.push("lower gross yield");

  const psmA = a.purchasePrice / a.areaSqm;
  const psmB = b.purchasePrice / b.areaSqm;
  if (psmA < psmB) reasons.push("lower price per m²");
  else if (psmB < psmA) reasons.push("higher price per m²");

  const renoA = Object.values(a.renovations).filter(Boolean).length;
  const renoB = Object.values(b.renovations).filter(Boolean).length;
  if (renoA < renoB) reasons.push("fewer renovations needed");
  else if (renoB < renoA) reasons.push("more renovations needed");

  if (a.locationGrade < b.locationGrade) reasons.push("better location grade");
  if (a.energyClass < b.energyClass) reasons.push("better energy efficiency");

  if (a.score > b.score) {
    return `${a.street} scores higher because of ${reasons.slice(0, 3).join(", ") || "overall better metrics"}.`;
  } else if (b.score > a.score) {
    const bReasons: string[] = [];
    if (yieldB > yieldA) bReasons.push("higher gross yield");
    if (psmB < psmA) bReasons.push("lower price per m²");
    if (renoB < renoA) bReasons.push("fewer renovations needed");
    if (b.locationGrade < a.locationGrade) bReasons.push("better location grade");
    return `${b.street} scores higher because of ${bReasons.slice(0, 3).join(", ") || "overall better metrics"}.`;
  }
  return "Both properties score equally — review the details to find nuanced differences.";
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
        <h1 className="text-2xl font-bold">Compare Properties</h1>
        <p className="text-sm text-[var(--muted)]">
          {favorites.length >= 2
            ? `Comparing ${favorites.length} favorited properties.`
            : "Favorite at least 2 properties to compare them. Showing all saved properties for now."}
        </p>
      </div>

      {comparables.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="font-semibold">No properties to compare</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Save properties from <a href="/analysis" className="text-[var(--accent)] hover:underline">Analysis</a> first.
          </p>
        </div>
      ) : (
        <>
          {/* Comparison grid */}
          <div className="overflow-x-auto">
            <div className="inline-flex gap-4 min-w-full pb-2">
              {comparables.map((p) => (
                <div
                  key={p.id}
                  className="w-72 flex-shrink-0 rounded-2xl bg-white border border-[var(--border)] shadow-sm p-5 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{p.street}</p>
                      <p className="text-xs text-[var(--muted)]">{p.city}</p>
                    </div>
                    <ScoreBadge score={p.score} />
                  </div>

                  {/* Image or icon */}
                  <div className="h-28 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                    {p.exposeImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.exposeImageUrl} alt={p.street} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl">🏠</span>
                    )}
                  </div>

                  <ProgressBar value={p.score} label="Score" />

                  <div className="space-y-2 text-sm">
                    <Row label="Price" value={`€${p.purchasePrice.toLocaleString()}`} />
                    <Row label="Rent" value={`€${p.monthlyRent.toLocaleString()}/mo`} />
                    <Row label="Yield" value={`${((p.monthlyRent * 12) / p.purchasePrice * 100).toFixed(1)}%`} />
                    <Row label="€/m²" value={`€${Math.round(p.purchasePrice / p.areaSqm).toLocaleString()}`} />
                    <Row label="Area" value={`${p.areaSqm} m²`} />
                    <Row label="Year" value={String(p.baujahr)} />
                    <Row label="Energy" value={p.energyClass} />
                    <Row label="Location" value={`Grade ${p.locationGrade}`} />
                    <Row label="Renovations" value={`${Object.values(p.renovations).filter(Boolean).length}/6`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pairwise explanations */}
          {comparables.length >= 2 && (
            <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-4">
              <h3 className="font-semibold">Comparison Insights</h3>
              {comparables.slice(0, -1).map((a, i) => {
                const b = comparables[i + 1];
                return (
                  <div key={`${a.id}-${b.id}`} className="text-sm text-[var(--muted)] border-l-2 border-[var(--accent)] pl-4">
                    <p className="font-medium text-[var(--fg)]">
                      {a.street} vs {b.street}
                    </p>
                    <p>{explain(a, b)}</p>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
