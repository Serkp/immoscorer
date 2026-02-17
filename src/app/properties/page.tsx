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
        <h1 className="text-2xl font-bold">Properties</h1>
        <p className="text-sm text-[var(--muted)]">
          {properties.length} saved {properties.length === 1 ? "property" : "properties"}
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-semibold">No properties yet</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Go to <a href="/analysis" className="text-[var(--accent)] hover:underline">Analysis</a> to add your first property.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => (
            <div key={p.id} className="relative group">
              <PropertyCard
                street={p.street}
                city={p.city}
                price={`€${p.purchasePrice.toLocaleString()}`}
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
                  title={p.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {p.favorite ? "★" : "☆"}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-full bg-white border border-[var(--border)] flex items-center justify-center text-sm text-[var(--muted)] hover:text-red-500 shadow-sm transition-colors"
                  title="Delete property"
                >
                  ×
                </button>
              </div>

              {/* Bottom detail row */}
              <div className="mt-0 px-4 pb-3 -translate-y-1 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>{p.areaSqm} m² · {p.energyClass} · {p.locationGrade}-location</span>
                <span>€{Math.round(p.monthlyRent).toLocaleString()}/mo</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
