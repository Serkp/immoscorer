"use client";

import { useEffect, useState } from "react";
import { getProperties, deleteProperty, toggleFavorite } from "@/lib/storage";
import { PropertyCard } from "@/components/ui/PropertyCard";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meine Immobilien</h1>
        <p className="text-sm text-[var(--muted)]">
          {properties.length} gespeicherte {properties.length === 1 ? "Immobilie" : "Immobilien"}
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">{"\uD83C\uDFE0"}</p>
          <p className="font-semibold">Noch keine Immobilien vorhanden</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Starten Sie eine <a href="/analysis" className="text-[var(--accent)] hover:underline">Analyse</a>, um Ihre erste Immobilie hinzuzuf\u00FCgen.
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
              />

              {/* Overlay actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleFavorite(p.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm border transition-colors ${
                    p.favorite
                      ? "bg-amber-50 border-amber-200 text-amber-500"
                      : "bg-white border-[var(--border)] text-[var(--muted)] hover:text-amber-500"
                  }`}
                  title={p.favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzuf\u00FCgen"}
                >
                  {p.favorite ? "\u2605" : "\u2606"}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-full bg-white border border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)] hover:text-red-500 shadow-sm transition-colors"
                  title="Immobilie l\u00F6schen"
                >
                  \u00D7
                </button>
              </div>

              {/* Bottom detail row */}
              <div className="mt-0 px-4 pb-3 -translate-y-1 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{p.areaSqm}\u00A0m\u00B2 \u00B7 {p.energyClass} \u00B7 Lage\u00A0{p.locationGrade}</span>
                <span>\u20AC{Math.round(p.monthlyRent).toLocaleString()}/Monat</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
