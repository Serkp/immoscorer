"use client";

import { useEffect, useRef, useState } from "react";
import { C } from "@/lib/theme";

export interface PlaceResult {
  street: string;
  city: string;
  postalCode: string;
  state: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface Props {
  onSelect: (place: PlaceResult) => void;
  defaultValue?: string;
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=de&region=DE`;
    script.async = true;
    script.defer = true;
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

export function AddressAutocomplete({ onSelect, defaultValue = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCity, setConfirmedCity] = useState("");

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current) return;
      if (!window.google?.maps?.places) return;

      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "de" },
        fields: ["address_components", "geometry", "formatted_address"],
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry) return;

        let street = "";
        let streetNumber = "";
        let city = "";
        let postalCode = "";
        let state = "";

        for (const comp of place.address_components || []) {
          const types = comp.types;
          if (types.includes("route")) street = comp.long_name;
          if (types.includes("street_number")) streetNumber = comp.long_name;
          if (types.includes("locality")) city = comp.long_name;
          if (types.includes("postal_code")) postalCode = comp.long_name;
          if (types.includes("administrative_area_level_1")) state = comp.long_name;
        }

        const fullStreet = streetNumber ? `${street} ${streetNumber}` : street;
        const formatted = place.formatted_address || fullStreet;

        setValue(formatted);
        setConfirmed(true);
        setConfirmedCity(city);

        onSelect({
          street: fullStreet,
          city,
          postalCode,
          state,
          lat: place.geometry.location?.lat() ?? 0,
          lng: place.geometry.location?.lng() ?? 0,
          formattedAddress: formatted,
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

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium block" style={{ color: C.sub }}>
        Adresse
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (confirmed) setConfirmed(false);
          }}
          placeholder="Straße und Hausnummer eingeben..."
          className="w-full rounded-xl px-4 py-3.5 text-sm transition-all"
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />
      </div>
      {confirmed && confirmedCity && (
        <p className="text-xs font-medium animate-fade-up" style={{ color: C.green }}>
          ✓ {confirmedCity} erkannt
        </p>
      )}
    </div>
  );
}
