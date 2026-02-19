"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

interface Prediction {
  placeId: string;
  main: string;
  secondary: string;
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
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCity, setConfirmedCity] = useState("");
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dummyDiv = useRef<HTMLDivElement>(null);

  // Load Google Maps and init services
  useEffect(() => {
    loadGoogleMaps().then(() => {
      if (!window.google?.maps?.places) return;
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      if (dummyDiv.current) {
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv.current);
      }
      setReady(true);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch predictions
  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        {
          input,
          types: ["address"],
          componentRestrictions: { country: "de" },
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.slice(0, 5).map((r) => ({
                placeId: r.place_id,
                main: r.structured_formatting.main_text,
                secondary: r.structured_formatting.secondary_text || "",
              }))
            );
            setShowDropdown(true);
            setActiveIndex(-1);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    },
    []
  );

  // Handle input change with debounce
  function handleChange(newValue: string) {
    setValue(newValue);
    if (confirmed) setConfirmed(false);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  }

  // Handle prediction selection
  function handleSelect(prediction: Prediction) {
    if (!placesService.current) return;

    placesService.current.getDetails(
      {
        placeId: prediction.placeId,
        fields: ["address_components", "geometry", "formatted_address"],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry) return;

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
        setPredictions([]);
        setShowDropdown(false);
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
      }
    );
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < predictions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : predictions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      {/* Hidden div for PlacesService */}
      <div ref={dummyDiv} style={{ display: "none" }} />

      <label className="text-xs font-medium block" style={{ color: C.sub }}>
        Adresse
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) setShowDropdown(true);
          }}
          placeholder={ready ? "Straße und Hausnummer eingeben..." : "Google Maps wird geladen..."}
          autoComplete="off"
          className="w-full rounded-xl px-4 py-3.5 text-sm transition-all"
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />

        {/* Custom Dropdown */}
        {showDropdown && predictions.length > 0 && (
          <div
            className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "#0D0F16",
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 10000,
            }}
          >
            {predictions.map((p, i) => (
              <button
                key={p.placeId}
                type="button"
                className="w-full text-left px-4 py-3 flex items-baseline gap-2 transition-colors"
                style={{
                  background: i === activeIndex ? "rgba(124,106,255,0.1)" : "transparent",
                  borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur
                  handleSelect(p);
                }}
              >
                <span className="text-sm font-medium" style={{ color: C.text }}>
                  {p.main}
                </span>
                <span className="text-xs" style={{ color: C.sub }}>
                  {p.secondary}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {confirmed && confirmedCity && (
        <p className="text-xs font-medium animate-fade-up" style={{ color: C.green }}>
          ✓ {confirmedCity} erkannt
        </p>
      )}
    </div>
  );
}
