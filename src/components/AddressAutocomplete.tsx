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

export function AddressAutocomplete({ onSelect, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCity, setConfirmedCity] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Fetch predictions via our own API route (server-side Google call)
  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions);
        setShowDropdown(true);
        setActiveIndex(-1);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
      setPredictions([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  function handleChange(newValue: string) {
    setValue(newValue);
    if (confirmed) setConfirmed(false);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(newValue);
    }, 300);
  }

  // Handle prediction selection — fetch details via our API route
  async function handleSelect(prediction: Prediction) {
    setShowDropdown(false);
    setPredictions([]);
    setValue(prediction.main + (prediction.secondary ? `, ${prediction.secondary}` : ""));

    try {
      const res = await fetch(`/api/places/details?placeId=${encodeURIComponent(prediction.placeId)}`);
      const data = await res.json();

      if (data.error) {
        console.error("Details fetch error:", data.error);
        return;
      }

      const formatted = data.formattedAddress || prediction.main;
      setValue(formatted);
      setConfirmed(true);
      setConfirmedCity(data.city || "");

      onSelect({
        street: data.street || "",
        city: data.city || "",
        postalCode: data.postalCode || "",
        state: data.state || "",
        lat: data.lat || 0,
        lng: data.lng || 0,
        formattedAddress: formatted,
      });
    } catch (err) {
      console.error("Details fetch error:", err);
    }
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
          placeholder="Straße und Hausnummer eingeben..."
          autoComplete="off"
          className="w-full rounded-xl px-4 py-3.5 text-sm transition-all"
          style={{
            background: C.surface2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />

        {/* Loading indicator */}
        {loading && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: C.dim }}
          >
            Suche...
          </span>
        )}

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
                  e.preventDefault();
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
