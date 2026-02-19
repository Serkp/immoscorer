"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "@/lib/theme";

interface PlaceResult {
  street: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  formatted: string;
}

interface Props {
  onSelect: (place: PlaceResult) => void;
  defaultStreet?: string;
  defaultCity?: string;
}

declare global {
  interface Window {
    __googleMapsLoading?: boolean;
    __googleMapsLoaded?: boolean;
    __googleMapsCallbacks?: (() => void)[];
  }
}

function loadGoogleMaps(): Promise<void> {
  if (window.__googleMapsLoaded) return Promise.resolve();

  return new Promise((resolve) => {
    if (window.__googleMapsLoading) {
      window.__googleMapsCallbacks = window.__googleMapsCallbacks || [];
      window.__googleMapsCallbacks.push(resolve);
      return;
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!key) {
      resolve();
      return;
    }

    window.__googleMapsLoading = true;
    window.__googleMapsCallbacks = [resolve];

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=de`;
    script.async = true;
    script.onload = () => {
      window.__googleMapsLoaded = true;
      window.__googleMapsLoading = false;
      window.__googleMapsCallbacks?.forEach((cb) => cb());
      window.__googleMapsCallbacks = [];
    };
    script.onerror = () => {
      window.__googleMapsLoading = false;
      window.__googleMapsCallbacks?.forEach((cb) => cb());
      window.__googleMapsCallbacks = [];
    };
    document.head.appendChild(script);
  });
}

export function AddressAutocomplete({ onSelect, defaultStreet = "", defaultCity = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [street, setStreet] = useState(defaultStreet);
  const [city, setCity] = useState(defaultCity);
  const [confirmed, setConfirmed] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current) return;
      if (!window.google?.maps?.places) return;

      setAvailable(true);

      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address"],
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.address_components) return;

        let route = "";
        let streetNumber = "";
        let locality = "";
        let postal = "";

        for (const comp of place.address_components) {
          const t = comp.types[0];
          if (t === "route") route = comp.long_name;
          else if (t === "street_number") streetNumber = comp.long_name;
          else if (t === "locality") locality = comp.long_name;
          else if (t === "postal_code") postal = comp.long_name;
        }

        const fullStreet = streetNumber ? `${route} ${streetNumber}` : route;
        const lat = place.geometry?.location?.lat() ?? 0;
        const lng = place.geometry?.location?.lng() ?? 0;

        setStreet(fullStreet);
        setCity(locality);
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 3000);

        onSelect({
          street: fullStreet,
          city: locality,
          postalCode: postal,
          lat,
          lng,
          formatted: place.formatted_address || "",
        });
      });

      autocompleteRef.current = ac;
    });

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: manual input syncing
  function handleStreetChange(v: string) {
    setStreet(v);
    onSelect({ street: v, city, postalCode: "", lat: 0, lng: 0, formatted: "" });
  }

  function handleCityChange(v: string) {
    setCity(v);
    onSelect({ street, city: v, postalCode: "", lat: 0, lng: 0, formatted: "" });
  }

  const inputStyle = {
    background: C.surface2,
    border: `1px solid ${C.border}`,
    color: C.text,
  };

  return (
    <div className="space-y-3">
      {/* Autocomplete input (combined address) */}
      {available && (
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>
            Adresse suchen
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Straße und Hausnummer eingeben..."
              className="w-full rounded-xl px-4 py-3 text-sm transition-all"
              style={inputStyle}
            />
            {confirmed && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium animate-fade-up"
                style={{ color: C.green }}
              >
                Adresse erkannt
              </span>
            )}
          </div>
        </div>
      )}

      {/* Manual fallback fields — always visible for editing */}
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>
            Straße
            {available && (
              <span className="ml-1 font-normal" style={{ color: C.dim }}>(wird automatisch gefüllt)</span>
            )}
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => handleStreetChange(e.target.value)}
            placeholder="Berliner Str. 42"
            className="w-full rounded-xl px-4 py-3 text-sm transition-all"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: C.sub }}>
            Stadt
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Berlin"
            className="w-full rounded-xl px-4 py-3 text-sm transition-all"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
