"use client";

import { useEffect, useState } from "react";
import { getProperties, deleteProperty, toggleFavorite } from "@/lib/storage";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { Property } from "@/lib/types";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProperties(getProperties());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    deleteProperty(id);
    setProperties(getProperties());
  }

  function handleFavorite(id: string) {
    toggleFavorite(id);
    setProperties(getProperties());
  }

  if (!loaded) return null;

  const totalScore = properties.length
    ? Math.round(properties.reduce((sum, p) => sum + p.score, 0) / properties.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with portfolio summary */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meine Immobilien</h1>
          <p className="section-subtitle mt-0.5">
            {properties.length} gespeicherte {properties.length === 1 ? "Immobilie" : "Immobilien"}
          </p>
        </div>
        {properties.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="kpi-label">Durchschnitt</p>
            </div>
            <ScoreBadge score={totalScore} size="lg" />
          </div>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{"\uD83C\uDFE0"}</span>
          </div>
          <p className="font-bold text-lg">Noch keine Immobilien</p>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-sm mx-auto">
            Starten Sie eine <a href="/analysis" className="text-[var(--accent)] font-semibold hover:underline">Analyse</a>, um Ihre erste Immobilie hinzuzuf\u00FCgen.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="relative group">
              <PropertyCard
                street={p.street}
                city={p.city}
                price={`\u20AC${p.purchasePrice.toLocaleString()}`}
                trend={p.trend}
                score={p.score}
                imageUrl={p.exposeImageUrl}
                metrics={[
                  { label: "Rendite", value: `${((p.monthlyRent * 12) / p.purchasePrice * 100).toFixed(1)}%` },
                  { label: "Fl\u00E4che", value: `${p.areaSqm}\u2009m\u00B2` },
                  { label: "Energie", value: p.energyClass },
                ]}
              />

              {/* Overlay actions */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={() => handleFavorite(p.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    p.favorite
                      ? "bg-amber-50 border border-amber-200 text-amber-500"
                      : "bg-white/90 backdrop-blur-sm border border-[var(--border)] text-[var(--muted)] hover:text-amber-500"
                  }`}
                  style={{ boxShadow: "var(--shadow-sm)" }}
                  title={p.favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzuf\u00FCgen"}
                >
                  {p.favorite ? "\u2605" : "\u2606"}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)] hover:text-red-500 transition-all"
                  style={{ boxShadow: "var(--shadow-sm)" }}
                  title="Immobilie l\u00F6schen"
                >
                  \u00D7
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
