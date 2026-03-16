"use client";

import { Suspense, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { Input } from "@/components/ui/Input";
import { PillSelect } from "@/components/ui/PillSelect";
import { ScoreRing, MiniRing } from "@/components/ui/ScoreRing";

import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { PlaceResult } from "@/components/AddressAutocomplete";
import { AIChat } from "@/components/AIChat";
import type { AIChatContext } from "@/components/AIChat";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { C, scoreColor, scoreLabel } from "@/lib/theme";
import { computeScore } from "@/lib/scoring";
import { getAnalysisById } from "@/lib/db";
import type { PropertyInput, ScoringResult } from "@/lib/scoring";

const ENERGY_OPTIONS = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"] as const;
const LOCATION_OPTIONS = ["A", "B", "C", "D"] as const;

const RENO_ITEMS = [
  { key: "dach", label: "Dach", desc: "Dacheindeckung, Dämmung, Dachstuhl", cost: "15.000–40.000 €" },
  { key: "fassade", label: "Fassade", desc: "Außendämmung, Putz, WDVS", cost: "20.000–50.000 €" },
  { key: "fenster", label: "Fenster", desc: "Verglasung, Rahmen, Dichtung", cost: "8.000–20.000 €" },
  { key: "bad", label: "Bad", desc: "Sanitär, Fliesen, Leitungen", cost: "10.000–25.000 €" },
  { key: "elektrik", label: "Elektrik", desc: "Leitungen, Sicherungskasten, FI", cost: "8.000–18.000 €" },
  { key: "heizung", label: "Heizung", desc: "Kessel, Rohre, Heizkörper", cost: "12.000–35.000 €" },
] as const;

const HG_ITEMS = [
  { key: "heizung", label: "Heizkosten / Fernwärme", umlagefaehig: true },
  { key: "warmwasser", label: "Warmwasser", umlagefaehig: true },
  { key: "kaltwasser", label: "Kaltwasser / Abwasser", umlagefaehig: true },
  { key: "muell", label: "Müllabfuhr", umlagefaehig: true },
  { key: "hausmeister", label: "Hausmeister / Treppenhausreinigung", umlagefaehig: true },
  { key: "aufzug", label: "Aufzug", umlagefaehig: true },
  { key: "versicherung", label: "Gebäudeversicherung", umlagefaehig: true },
  { key: "grundsteuer", label: "Grundsteuer", umlagefaehig: true },
  { key: "ruecklage", label: "Instandhaltungsrücklage", umlagefaehig: false },
  { key: "verwaltung", label: "Verwaltungskosten", umlagefaehig: false },
] as const;

const LOADING_STEPS = [
  { title: "Adresse verifizieren", sub: "Standort und Marktdaten abrufen" },
  { title: "Vergleichspreise ermitteln", sub: "Transaktionen analysieren" },
  { title: "Risikoprofil berechnen", sub: "Sanierung, Energie, Lage gewichten" },
  { title: "Finanzierbarkeit simulieren", sub: "Bankkriterien prüfen" },
  { title: "Empfehlungen ableiten", sub: "Strategische Maßnahmen generieren" },
];

type View = "input" | "loading" | "result";

type PropertyType = "" | "etw" | "efh" | "mfh" | "dhh";
type ApartmentType = "" | "erdgeschoss" | "obergeschoss" | "dachgeschoss" | "penthouse" | "souterrain";

interface FormData {
  street: string;
  city: string;
  price: string;
  rent: string;
  rentType: "kalt" | "warm";
  warmNK: string;
  hausgeld: string;
  hgItems: Record<string, string>;
  area: string;
  year: string;
  energyClass: string;
  locationGrade: string;
  renovations: string[];
  propertyType: PropertyType;
  apartmentType: ApartmentType;
  rooms: string;
  estimatedUtilities: string;
  unitCount: string;
}

interface LocationData {
  walkScore: number;
  transitScore: number;
  locationGrade: "A" | "B" | "C" | "D";
  rentGrowth: string;
  description: string;
  nearbyHighlights: string[];
}

const INIT: FormData = {
  street: "", city: "", price: "", rent: "", rentType: "kalt", warmNK: "",
  hausgeld: "", hgItems: {}, area: "", year: "",
  energyClass: "", locationGrade: "", renovations: [],
  propertyType: "", apartmentType: "", rooms: "", estimatedUtilities: "", unitCount: "",
};

const PROPERTY_TYPES = [
  { key: "etw", label: "Eigentumswohnung (ETW)" },
  { key: "efh", label: "Einfamilienhaus (EFH)" },
  { key: "mfh", label: "Mehrfamilienhaus (MFH)" },
  { key: "dhh", label: "Doppelhaushälfte (DHH)" },
] as const;

const APARTMENT_TYPES = [
  { key: "erdgeschoss", label: "Erdgeschoss" },
  { key: "obergeschoss", label: "Obergeschoss" },
  { key: "dachgeschoss", label: "Dachgeschoss" },
  { key: "penthouse", label: "Penthouse" },
  { key: "souterrain", label: "Souterrain" },
] as const;

/** Derive Kaltmiete from form (adjusts for Warmmiete if selected) */
function getKaltmiete(f: FormData): number {
  const rent = Number(f.rent);
  if (!rent) return 0;
  if (f.rentType === "kalt") return rent;
  const nk = Number(f.warmNK);
  return nk > 0 ? rent - nk : rent * 0.70;
}

/** Generate dynamic AI chat suggestions based on analysis results */
function getDynamicSuggestions(result: { totalScore: number; kpis: { grossYield: number; factor: number }; subscores: { key: string; value: number }[] }, form: FormData): string[] {
  const suggestions: string[] = [];
  const score = result.totalScore;
  const grossYield = result.kpis.grossYield * 100;
  const energy = result.subscores.find(s => s.key === "energy");
  const risk = result.subscores.find(s => s.key === "risk");

  if (score < 50) suggestions.push("Welche konkreten Risiken hat dieses Objekt?");
  else if (score >= 70) suggestions.push("Was macht dieses Objekt zu einem guten Investment?");
  else suggestions.push("Wie kann ich den Score dieses Objekts verbessern?");

  if (grossYield < 4) suggestions.push("Ist die Rendite hier ausreichend?");
  else suggestions.push("Wie kann ich die Rendite weiter optimieren?");

  if (energy && energy.value < 50) suggestions.push("Welche energetischen Sanierungen lohnen sich?");
  if (risk && risk.value < 50) suggestions.push("Wie kann ich das Risiko minimieren?");
  if (form.propertyType === "mfh") suggestions.push("Was muss ich bei einem MFH besonders beachten?");
  if (Number(form.year) < 1970) suggestions.push("Welche Sanierungen sind bei einem Altbau nötig?");

  return suggestions.slice(0, 4);
}

/** Compute HG breakdown: nicht-umlagefähig and umlagefähig portions */
function computeHGSplit(hausgeld: number, hgItems: Record<string, string>) {
  const entries = Object.entries(hgItems).filter(([, v]) => v && Number(v) > 0);
  const hasBreakdown = entries.length > 0;
  if (!hasBreakdown) {
    return { umlagefaehig: hausgeld * 0.60, nichtUmlagefaehig: hausgeld * 0.40, hasBreakdown: false };
  }
  let umlagefaehig = 0;
  let nichtUmlagefaehig = 0;
  for (const [key, val] of entries) {
    const amount = Number(val) || 0;
    const item = HG_ITEMS.find((i) => i.key === key);
    if (item?.umlagefaehig) umlagefaehig += amount;
    else nichtUmlagefaehig += amount;
  }
  return { umlagefaehig, nichtUmlagefaehig, hasBreakdown: true };
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><AIOrb size={48} active /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");
  const { user } = useAuth();
  const { refresh: refreshSub } = useSubscription();
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(!!analysisId);
  const [view, setView] = useState<View>("input");
  const [section, setSection] = useState(0);
  const [form, setForm] = useState<FormData>(INIT);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDone, setLocationDone] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingPct, setLoadingPct] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveChoice, setSaveChoice] = useState<"none" | "portfolio" | "compare">("none");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "neutral" } | null>(null);
  const [showFinanzierung, setShowFinanzierung] = useState(false);
  const [finanzForm, setFinanzForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "", consent: false });
  const [finanzSending, setFinanzSending] = useState(false);
  const [finanzSent, setFinanzSent] = useState(false);
  const [hgExpanded, setHgExpanded] = useState(false);
  const [fromCompare, setFromCompare] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);


  /* ── Load saved analysis from DB when ?id= is present ── */
  useEffect(() => {
    if (!analysisId || !user) { setIsLoadingAnalysis(false); return; }
    setIsLoadingAnalysis(true);
    setLoadError(null);
    (async () => {
      try {
        const row = await getAnalysisById(analysisId, user.id);
        if (!row) { setLoadError("Analyse nicht gefunden."); setIsLoadingAnalysis(false); return; }
        const inp = (row.inputs || {}) as Record<string, string | number | string[]>;

        // Reconstruct form from saved inputs
        const addr = String(inp.address || "");
        const parts = addr.split(",").map((s: string) => s.trim());
        const loadedForm: FormData = {
          street: parts[0] || String(inp.street || ""),
          city: parts[1] || String(inp.city || row.city || ""),
          price: String(inp.purchasePrice || inp.price || row.purchase_price || ""),
          rent: String(inp.monthlyRent || inp.rent || row.monthly_rent || ""),
          rentType: "kalt",
          warmNK: "",
          hausgeld: String(inp.managementFee || inp.hausgeld || row.management_fee || ""),
          hgItems: {},
          area: String(inp.areaSqm || inp.area || row.area_sqm || ""),
          year: String(inp.buildingYear || inp.year || row.building_year || ""),
          energyClass: String(inp.energyClass || row.energy_class || "C"),
          locationGrade: String(inp.locationGrade || row.location_grade || "B"),
          renovations: Array.isArray(inp.renovations) ? inp.renovations as string[] : [],
          propertyType: String(inp.propertyType || "") as FormData["propertyType"],
          apartmentType: String(inp.apartmentType || "") as FormData["apartmentType"],
          rooms: String(inp.rooms || ""),
          estimatedUtilities: String(inp.estimatedUtilities || ""),
          unitCount: String(inp.unitCount || ""),
        };
        setForm(loadedForm);

        // Always re-run scoring from saved inputs (stored result is flat, not full ScoringResult)
        const rent = Number(inp.monthlyRent || inp.rent || row.monthly_rent) || 0;
        const hausgeld = Number(inp.managementFee || inp.hausgeld || row.management_fee) || 0;
        const input: PropertyInput = {
          street: parts[0] || "",
          city: parts[1] || String(row.city || ""),
          price: Number(inp.purchasePrice || inp.price || row.purchase_price) || 0,
          rent,
          hausgeld,
          area: Number(inp.areaSqm || inp.area || row.area_sqm) || 0,
          year: Number(inp.buildingYear || inp.year || row.building_year) || 0,
          energyClass: String(inp.energyClass || row.energy_class || "C"),
          locationGrade: String(inp.locationGrade || row.location_grade || "B"),
          renovations: Array.isArray(inp.renovations) ? inp.renovations as string[] : [],
          ...(inp.propertyType ? { propertyType: String(inp.propertyType) } : {}),
          ...(inp.apartmentType ? { apartmentType: String(inp.apartmentType) } : {}),
          ...(inp.rooms ? { rooms: Number(inp.rooms) } : {}),
          ...(inp.unitCount ? { unitCount: Number(inp.unitCount) } : {}),
          ...(inp.estimatedUtilities ? { estimatedUtilities: Number(inp.estimatedUtilities) } : {}),
        };
        setResult(computeScore(input));

        setFromCompare(true);
        setSaveChoice("compare"); // Already saved
        setView("result");
      } catch (err) {
        console.error("[loadAnalysis] error:", err);
        setLoadError("Analyse konnte nicht geladen werden.");
      } finally {
        setIsLoadingAnalysis(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, user]);

  /* ── Restore from sessionStorage (Feature 2: Zwischenspeicher) ── */
  useEffect(() => {
    if (analysisId) return; // Skip restore when loading from DB
    // ?new=1 → fresh analysis (from "Objekt hinzufügen" on compare page)
    if (searchParams.get("new")) {
      sessionStorage.removeItem("immoscorer_analysis");
      sessionStorage.removeItem("immoscorer_step");
      sessionStorage.removeItem("immoscorer_result");
      setForm(INIT);
      setSection(0);
      setView("input");
      setResult(null);
      setFromCompare(false);
      return;
    }
    try {
      const savedForm = sessionStorage.getItem("immoscorer_analysis");
      if (savedForm) {
        const parsed = JSON.parse(savedForm) as FormData;
        setForm(parsed);
      }
      const savedStep = sessionStorage.getItem("immoscorer_step");
      if (savedStep) {
        setSection(Number(savedStep));
      }
      const savedResult = sessionStorage.getItem("immoscorer_result");
      if (savedResult) {
        const parsed = JSON.parse(savedResult) as ScoringResult;
        setResult(parsed);
        setView("result");
      }
    } catch { /* ignore parse errors */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, searchParams]);

  /* ── Persist form to sessionStorage on change ── */
  useEffect(() => {
    if (form.street || form.city || form.price || form.rent) {
      sessionStorage.setItem("immoscorer_analysis", JSON.stringify(form));
    }
  }, [form]);

  /* ── Persist step to sessionStorage ── */
  useEffect(() => {
    if (view === "input") {
      sessionStorage.setItem("immoscorer_step", String(section));
    }
  }, [section, view]);

  /* ── Checkout success/cancel handling ── */
  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      setToast({ text: "Willkommen bei ImmoScorer Pro! Alle Funktionen sind freigeschaltet.", type: "success" });
      refreshSub();
      setTimeout(() => setToast(null), 5000);
      window.history.replaceState({}, "", "/analysis");
    } else if (checkout === "cancel") {
      setToast({ text: "Bezahlung abgebrochen.", type: "neutral" });
      setTimeout(() => setToast(null), 4000);
      window.history.replaceState({}, "", "/analysis");
    }
  }, [searchParams, refreshSub]);

  const set = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const toggleReno = useCallback((key: string) => {
    setForm((f) => ({
      ...f,
      renovations: f.renovations.includes(key)
        ? f.renovations.filter((r) => r !== key)
        : [...f.renovations, key],
    }));
  }, []);

  /* ── Live-Metriken ── */
  const kaltmiete = getKaltmiete(form);

  const liveKPIs = useMemo(() => {
    const price = Number(form.price);
    const rent = getKaltmiete(form);
    if (!price || !rent) return null;
    const grossYield = (rent * 12) / price;
    const factor = price / (rent * 12);
    const annualRent = rent * 12;
    const isWarm = form.rentType === "warm";
    return { grossYield, factor, annualRent, isWarm };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.rent, form.rentType, form.warmNK]);

  const hgSplit = useMemo(
    () => computeHGSplit(Number(form.hausgeld), form.hgItems),
    [form.hausgeld, form.hgItems],
  );

  const liveKPIs2 = useMemo(() => {
    const price = Number(form.price);
    const rent = getKaltmiete(form);
    const area = Number(form.area);
    if (!price || !rent) return null;
    const ownerHG = hgSplit.nichtUmlagefaehig;
    const netCashflow = rent - ownerHG;
    const hausgeldRatio = ownerHG > 0 && rent ? ownerHG / rent : 0;
    const sqmPrice = area ? price / area : 0;
    return { netCashflow, hausgeldRatio, sqmPrice, ownerHG, hasBreakdown: hgSplit.hasBreakdown };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price, form.rent, form.rentType, form.warmNK, form.hausgeld, form.area, hgSplit]);

  /* ── Echte Lage-Analyse via Google Places ── */
  async function analyzeLocation(placeLat: number, placeLng: number, city: string) {
    setLocationLoading(true);
    try {
      const res = await fetch("/api/location/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: placeLat,
          lng: placeLng,
          city,
          price: Number(form.price) || undefined,
          rent: Number(form.rent) || undefined,
          area: Number(form.area) || undefined,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setLocationData(data);
        set("locationGrade", data.locationGrade);
        setLocationDone(true);
      }
    } catch (err) {
      console.error("Lage-Analyse fehlgeschlagen:", err);
    } finally {
      setLocationLoading(false);
    }
  }

  /* ── Address selected from Autocomplete ── */
  function handleAddressSelect(place: PlaceResult) {
    if (place.street) set("street", place.street);
    if (place.city) set("city", place.city);

    if (place.lat && place.lng) {
      setLat(place.lat);
      analyzeLocation(place.lat, place.lng, place.city);
    } else {
      setLat(null);
    }
  }

  /* ── Validierung ── */
  const priceNum = Number(form.price);
  const rentNum = Number(form.rent);
  const hausgeldNum = Number(form.hausgeld);
  const areaNum = Number(form.area);
  const yearNum = Number(form.year);
  const roomsNum = Number(form.rooms);
  const unitCountNum = Number(form.unitCount);

  const priceValid = !form.price || (priceNum >= 10000 && priceNum <= 50000000);
  const rentValid = !form.rent || (rentNum >= 50 && rentNum <= 50000);
  const hausgeldValid = !form.hausgeld || (hausgeldNum >= 0 && hausgeldNum <= 5000);
  const areaValid = !form.area || (areaNum >= 10 && areaNum <= 10000);
  const yearValid = !form.year || (yearNum >= 1800 && yearNum <= 2026 && form.year.length === 4);
  const hausgeldWarn = form.hausgeld && form.rent && hausgeldNum > rentNum;
  const roomsValid = !form.rooms || (roomsNum >= 1 && roomsNum <= 20 && Number.isInteger(roomsNum));
  const unitCountValid = !form.unitCount || (unitCountNum >= 2 && unitCountNum <= 100);

  const etwNeedsApartmentType = form.propertyType === "etw" && !form.apartmentType;
  const mfhNeedsUnits = form.propertyType === "mfh" && !form.unitCount;

  const canNext0 = !!(
    form.street && form.city && form.price && form.rent && form.propertyType &&
    priceValid && rentValid &&
    !etwNeedsApartmentType &&
    (!form.rooms || roomsValid)
  );
  const canNext1 = !!(
    (form.propertyType === "efh" || form.propertyType === "dhh" || form.hausgeld) &&
    form.area && form.year && form.energyClass &&
    hausgeldValid && areaValid && yearValid &&
    (!mfhNeedsUnits)
  );

  // NK auto-suggestion
  const nkSuggestion = areaNum > 0 ? Math.round(areaNum * 2.80) : 0;
  const warmmiete = kaltmiete + (Number(form.estimatedUtilities) || nkSuggestion);

  /* ── Analyse starten ── */
  function startAnalysis() {
    runAnalysis();
  }

  function runAnalysis() {
    setView("loading");
    setLoadingStep(0);
    setLoadingPct(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setLoadingStep(step);
      setLoadingPct(Math.min(100, step * 20));
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => {
          const rent = getKaltmiete(form);
          const hg = Number(form.hausgeld);
          const split = computeHGSplit(hg, form.hgItems);
          const input: PropertyInput = {
            street: form.street,
            city: form.city,
            price: Number(form.price),
            rent,
            hausgeld: hg,
            area: Number(form.area),
            year: Number(form.year),
            energyClass: form.energyClass,
            locationGrade: form.locationGrade || "B",
            renovations: form.renovations,
            ...(locationData ? { walkScore: locationData.walkScore, transitScore: locationData.transitScore } : {}),
            ...(split.hasBreakdown ? { hausgeldNichtUmlagefaehig: split.nichtUmlagefaehig, hasHGBreakdown: true } : {}),
            ...(form.propertyType ? { propertyType: form.propertyType } : {}),
            ...(form.apartmentType ? { apartmentType: form.apartmentType } : {}),
            ...(form.rooms ? { rooms: Number(form.rooms) } : {}),
            ...(form.unitCount ? { unitCount: Number(form.unitCount) } : {}),
            ...(form.estimatedUtilities ? { estimatedUtilities: Number(form.estimatedUtilities) } : {}),
          };
          const sr = computeScore(input);
          setResult(sr);
          sessionStorage.setItem("immoscorer_result", JSON.stringify(sr));
          setSaveChoice("none");
          setView("result");
        }, 600);
      }
    }, 600);
  }

  async function handleSaveCompare() {
    if (!result) return;
    if (!user) {
      setToast({ text: "Bitte melden Sie sich an, um zu speichern.", type: "neutral" });
      setTimeout(() => setToast(null), 5000);
      return;
    }
    if (saving || saveChoice !== "none") return;
    setSaving(true);
    try {
      const price = Number(form.price);
      const rent = getKaltmiete(form);
      const hausgeld = Number(form.hausgeld);
      const area = Number(form.area);
      const split = computeHGSplit(hausgeld, form.hgItems);
      const ownerHG = split.nichtUmlagefaehig;

      const getSub = (key: string) => result.subscores.find((s) => s.key === key)?.value || 0;

      const payload = {
        address: `${form.street}, ${form.city}`,
        city: form.city,
        purchase_price: price,
        monthly_rent: rent,
        area_sqm: area,
        building_year: Number(form.year),
        energy_class: form.energyClass,
        location_grade: form.locationGrade || "B",
        management_fee: hausgeld,
        renovation_count: form.renovations.length,
        property_type: form.propertyType || null,
        apartment_type: form.apartmentType || null,
        rooms: form.rooms ? Number(form.rooms) : null,
        estimated_utilities: form.estimatedUtilities ? Number(form.estimatedUtilities) : null,
        unit_count: form.unitCount ? Number(form.unitCount) : null,
        total_score: result.totalScore,
        investment_score: getSub("investment"),
        rentability_score: getSub("rentability"),
        risk_score: getSub("risk"),
        financing_score: getSub("financing"),
        future_score: getSub("projection"),
        energy_score: getSub("energy"),
        gross_yield: price > 0 ? ((rent * 12) / price) * 100 : 0,
        net_yield: price > 0 ? (((rent - ownerHG) * 12) / price) * 100 : 0,
        price_factor: rent > 0 ? price / (rent * 12) : 0,
        inputs: {
          address: `${form.street}, ${form.city}`,
          city: form.city,
          purchasePrice: price,
          monthlyRent: rent,
          areaSqm: area,
          buildingYear: Number(form.year),
          energyClass: form.energyClass,
          locationGrade: form.locationGrade || "B",
          managementFee: hausgeld,
          renovationCount: form.renovations.length,
        },
        result: {
          totalScore: result.totalScore,
          investmentScore: getSub("investment"),
          rentabilityScore: getSub("rentability"),
          riskScore: getSub("risk"),
          financingScore: getSub("financing"),
          futureScore: getSub("projection"),
          energyScore: getSub("energy"),
          grossYield: price > 0 ? ((rent * 12) / price) * 100 : 0,
          netYield: price > 0 ? (((rent - ownerHG) * 12) / price) * 100 : 0,
          priceFactor: rent > 0 ? price / (rent * 12) : 0,
        },
      };

      // Get the session token for the API route
      const { getSupabase } = await import("@/lib/supabase");
      const { data: sessionData } = await getSupabase().auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setToast({ text: "Sitzung abgelaufen. Bitte melden Sie sich erneut an.", type: "neutral" });
        setTimeout(() => setToast(null), 5000);
        setSaving(false);
        return;
      }

      const res = await fetch("/api/save-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      console.log("[handleSaveCompare] saved via API:", json.data?.id, json.fallback ? "(fallback)" : "");
      setSaveChoice("compare");
      setToast({ text: "Immobilie im Vergleich gespeichert", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[handleSaveCompare] error:", err);
      setToast({ text: `Fehler beim Speichern: ${msg}`, type: "neutral" });
      setTimeout(() => setToast(null), 8000);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinanzierung() {
    if (!user || !result || finanzSending) return;
    if (!finanzForm.firstName || !finanzForm.lastName || !finanzForm.phone || !finanzForm.consent) return;
    setFinanzSending(true);
    try {
      await fetch("/api/financing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          firstName: finanzForm.firstName,
          lastName: finanzForm.lastName,
          email: finanzForm.email || user.email,
          phone: finanzForm.phone,
          message: finanzForm.message,
          propertyAddress: `${form.street}, ${form.city}`,
          purchasePrice: Number(form.price),
          monthlyRent: Number(form.rent),
          score: result.totalScore,
        }),
      });
      setFinanzSent(true);
    } catch {
      // silent
    } finally {
      setFinanzSending(false);
    }
  }

  function reset() {
    setForm(INIT);
    setSection(0);
    setResult(null);
    setLocationDone(false);
    setLocationData(null);
    setLat(null);
    setView("input");
    setExpanded(null);
    setSaveChoice("none");
    setShowFinanzierung(false);
    setFinanzSent(false);
    setFinanzForm({ firstName: "", lastName: "", email: "", phone: "", message: "", consent: false });
    setHgExpanded(false);
    setFromCompare(false);
    sessionStorage.removeItem("immoscorer_analysis");
    sessionStorage.removeItem("immoscorer_step");
    sessionStorage.removeItem("immoscorer_result");
    window.history.replaceState({}, "", "/analysis");
  }


  /* ── Global checkout toast ── */
  const checkoutToast = toast ? (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
      style={{
        background: toast.type === "success" ? C.greenDim : C.surface3,
        color: toast.type === "success" ? C.green : C.sub,
        border: `1px solid ${toast.type === "success" ? C.greenBorder : C.border}`,
      }}
    >
      {toast.text}
    </div>
  ) : null;

  /* Grade color helpers */
  function gradeColor(grade: string) {
    if (grade === "A") return C.green;
    if (grade === "B") return C.blue;
    if (grade === "C") return C.amber;
    return C.red;
  }
  function gradeBg(grade: string) {
    if (grade === "A") return C.greenDim;
    if (grade === "B") return "rgba(76,154,255,0.12)";
    if (grade === "C") return C.amberDim;
    return C.redDim;
  }
  function gradeBorder(grade: string) {
    if (grade === "A") return C.greenBorder;
    if (grade === "B") return "rgba(76,154,255,0.2)";
    if (grade === "C") return C.amberBorder;
    return "rgba(248,113,113,0.2)";
  }

  /* ── Verhandlungsguide generator ── */
  function getVerhandlungsTipps(sr: ScoringResult) {
    const tipps: string[] = [];
    const score = sr.totalScore;
    const price = Number(form.price);
    const rent = Number(form.rent);
    const factor = price / (rent * 12);
    const grossYield = ((rent * 12) / price) * 100;

    if (factor > 25) {
      tipps.push(`Der Kaufpreisfaktor liegt bei ${factor.toFixed(1)}x — argumentieren Sie mit dem Marktdurchschnitt von 20–22x für vergleichbare Objekte.`);
    }
    if (grossYield < 4) {
      tipps.push(`Die Bruttorendite von ${grossYield.toFixed(1)} % liegt unter dem Marktdurchschnitt. Fordern Sie einen Preisnachlass von ${Math.round(price * 0.08).toLocaleString("de-DE")}–${Math.round(price * 0.12).toLocaleString("de-DE")} €.`);
    }
    if (form.renovations.length > 0) {
      const renoCost = form.renovations.length * 15000;
      tipps.push(`${form.renovations.length} Sanierungsgewerke identifiziert — geschätzte Kosten ca. ${renoCost.toLocaleString("de-DE")} €. Nutzen Sie dies als Verhandlungsbasis.`);
    }
    if (score < 50) {
      tipps.push("Der Gesamtscore unter 50 signalisiert erhöhtes Risiko — verlangen Sie mindestens 10–15 % Preisnachlass oder zusätzliche Garantien.");
    }
    if (score >= 70) {
      tipps.push("Starker Score — bei diesem Objekt haben Sie gute Chancen auf eine schnelle Bankzusage. Nutzen Sie das als Argument für schnellen Abschluss bei Preisnachlass.");
    }
    const energyIdx = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"].indexOf(form.energyClass);
    if (energyIdx >= 5) {
      tipps.push(`Energieklasse ${form.energyClass}: GEG-Nachrüstpflichten bei Eigentümerwechsel. Argumentieren Sie mit den anfallenden Sanierungskosten.`);
    }
    if (tipps.length === 0) {
      tipps.push("Das Objekt zeigt insgesamt solide Kennzahlen. Verhandeln Sie dennoch — 3–5 % Preisnachlass sind im Markt üblich.");
    }
    return tipps;
  }

  /* ── KI-Empfehlung generator ── */
  function getKIEmpfehlung(sr: ScoringResult): { text: string; variant: "good" | "info" | "warn" | "bad" } {
    const score = sr.totalScore;
    if (score >= 75) {
      return {
        text: `Klare Kaufempfehlung. Mit einem Score von ${score}/100 gehört dieses Objekt zu den Top-Investments. Sichern Sie sich zeitnah eine Finanzierungszusage und prüfen Sie Sondertilgungsoptionen.`,
        variant: "good",
      };
    }
    if (score >= 55) {
      return {
        text: `Solides Investment mit Optimierungspotenzial (${score}/100). Prüfen Sie die schwächeren Teilscores und verhandeln Sie gezielt auf Basis der identifizierten Schwächen.`,
        variant: "info",
      };
    }
    if (score >= 40) {
      return {
        text: `Erhöhte Vorsicht geboten (${score}/100). Mehrere Risikofaktoren identifiziert. Verhandeln Sie deutliche Preisabschläge oder prüfen Sie alternative Objekte.`,
        variant: "warn",
      };
    }
    return {
      text: `Von diesem Investment wird abgeraten (${score}/100). Die Risiken überwiegen deutlich. Suchen Sie nach Objekten mit besserem Rendite-Risiko-Profil.`,
      variant: "bad",
    };
  }

  /* ── Loading analysis from DB ── */
  if (isLoadingAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AIOrb size={48} active />
        <p className="text-sm font-medium" style={{ color: C.sub }}>Analyse wird geladen…</p>
      </div>
    );
  }

  /* ── Error loading analysis ── */
  if (loadError) {
    return (
      <div className="mx-auto max-w-[640px] py-24 text-center space-y-4">
        <p className="text-sm font-semibold" style={{ color: C.red }}>{loadError}</p>
        <Link href="/compare" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.accent }}>
          ← Zurück zum Vergleich
        </Link>
      </div>
    );
  }

  /* ══════════════════════════════════
     INPUT VIEW
     ══════════════════════════════════ */
  if (view === "input") {
    return (
      <div className="mx-auto max-w-[640px] space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
          ← Dashboard
        </Link>
        {checkoutToast}
        {/* Progress bars */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: section > i ? "100%" : section === i ? "50%" : "0%",
                  background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Section 0 ── */}
        {section === 0 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Was möchten Sie analysieren?</h2>
            </div>

            {/* GRUPPE 1 — Adresse */}
            <AddressAutocomplete
              onSelect={handleAddressSelect}
              defaultValue={form.street ? `${form.street}, ${form.city}` : ""}
            />

            {locationLoading && (
              <div className="flex items-center gap-3 rounded-xl p-4 animate-fade-up" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <AIOrb size={24} active />
                <span className="text-sm" style={{ color: C.sub }}>Lage wird analysiert...</span>
              </div>
            )}
            {locationDone && locationData && (
              <Card className="p-4 space-y-3 animate-fade-up">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg px-2.5 py-1 text-xs font-bold" style={{ background: gradeBg(locationData.locationGrade), color: gradeColor(locationData.locationGrade), border: `1px solid ${gradeBorder(locationData.locationGrade)}` }}>
                    Lageklasse {locationData.locationGrade}
                  </span>
                  <span className="text-xs" style={{ color: C.sub }}>{form.city}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric label="Walk-Score" value={String(locationData.walkScore)} />
                  <MiniMetric label="ÖPNV-Score" value={String(locationData.transitScore)} />
                  <MiniMetric label="Mietwachstum" value={locationData.rentGrowth} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.dim }}>{locationData.description}</p>
                {locationData.nearbyHighlights.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-semibold" style={{ color: C.sub }}>Umgebung (1 km Radius)</p>
                    {locationData.nearbyHighlights.map((h, i) => (
                      <p key={i} className="text-xs" style={{ color: C.dim }}><span style={{ color: C.accent }}>·</span> {h}</p>
                    ))}
                  </div>
                )}
              </Card>
            )}
            {!locationDone && !locationLoading && (form.street || form.city) && !lat && (
              <p className="text-xs" style={{ color: C.dim }}>Für eine automatische Lage-Analyse wählen Sie eine Adresse aus den Vorschlägen.</p>
            )}

            {/* GRUPPE 2 — Objektart */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: C.sub }}>Objektart *</label>
              <div className="grid grid-cols-2 gap-2">
                {PROPERTY_TYPES.map((pt) => (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, propertyType: pt.key as PropertyType, ...(pt.key !== "etw" ? { apartmentType: "" as ApartmentType } : {}), ...(pt.key !== "mfh" ? { unitCount: "" } : {}) }))}
                    className="rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all"
                    style={{
                      background: form.propertyType === pt.key ? C.accentDim : C.surface,
                      border: `1px solid ${form.propertyType === pt.key ? C.accent : C.border}`,
                      color: form.propertyType === pt.key ? C.accent : C.sub,
                    }}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wohnungstyp (nur bei ETW) */}
            {form.propertyType === "etw" && (
              <div className="space-y-2 animate-fade-up">
                <label className="text-xs font-medium" style={{ color: C.sub }}>Wohnungstyp *</label>
                <div className="flex flex-wrap gap-2">
                  {APARTMENT_TYPES.map((at) => (
                    <button
                      key={at.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, apartmentType: at.key as ApartmentType }))}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: form.apartmentType === at.key ? C.accentDim : C.surface,
                        border: `1px solid ${form.apartmentType === at.key ? C.accent : C.border}`,
                        color: form.apartmentType === at.key ? C.accent : C.sub,
                      }}
                    >
                      {at.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* GRUPPE 3 — Eckdaten */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input label="Kaufpreis" value={form.price} onChange={(v) => set("price", v)} placeholder="250000" type="number" suffix="€" large explain="Gesamtangebotspreis inkl. ausgewiesener Nebenkosten." />
                {form.price && !priceValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte Kaufpreis zwischen 10.000 und 50.000.000 € eingeben</p>}
              </div>
              <div>
                <Input label="Wohnfläche" value={form.area} onChange={(v) => set("area", v)} placeholder="72" type="number" suffix="m²" explain="Wohnfläche laut Grundriss oder Teilungserklärung." />
                {form.area && !areaValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte Wohnfläche zwischen 10 und 10.000 m² eingeben</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input label="Zimmer" value={form.rooms} onChange={(v) => set("rooms", v)} placeholder="3" type="number" explain="Anzahl Zimmer (ohne Küche/Bad)." />
                {form.rooms && !roomsValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte 1–20 Zimmer eingeben</p>}
              </div>
              <div>
                <Input label="Baujahr" value={form.year} onChange={(v) => set("year", v)} placeholder="1985" type="number" explain="Baujahr des Gebäudes." />
                {form.year && !yearValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte gültiges Baujahr eingeben (1800–2026)</p>}
              </div>
            </div>

            {/* GRUPPE 4 — Miete + NK */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label={form.propertyType === "mfh" ? "Gesamte Mieteinnahmen" : "Kaltmiete"}
                  value={form.rent}
                  onChange={(v) => set("rent", v)}
                  placeholder={form.propertyType === "mfh" ? "2800" : "950"}
                  type="number"
                  suffix="€/Mon."
                  large
                  explain={form.propertyType === "mfh" ? "Gesamtmiete aller Einheiten." : "Nettokaltmiete ohne Nebenkosten."}
                />
                {form.rent && !rentValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte Miete zwischen 50 und 50.000 € eingeben</p>}
              </div>
              <div>
                <Input
                  label="Nebenkosten (geschätzt)"
                  value={form.estimatedUtilities}
                  onChange={(v) => setForm((f) => ({ ...f, estimatedUtilities: v }))}
                  placeholder={nkSuggestion > 0 ? String(nkSuggestion) : "200"}
                  type="number"
                  suffix="€/Mon."
                  explain="Ca. 2,50–3,50 €/m² üblich."
                />
              </div>
            </div>
            {form.propertyType === "mfh" && (
              <p className="text-[11px]" style={{ color: C.dim }}>Bei MFH wird die Gesamtmiete aller Einheiten berücksichtigt.</p>
            )}
            {/* Live Warmmiete display */}
            {kaltmiete > 0 && (
              <p className="text-xs font-medium" style={{ color: C.blue }}>
                Warmmiete: {warmmiete.toLocaleString("de-DE")} €/Mon. ({Math.round(kaltmiete).toLocaleString("de-DE")} € Kalt + {(Number(form.estimatedUtilities) || nkSuggestion).toLocaleString("de-DE")} € NK)
              </p>
            )}

            {/* Live-Metriken */}
            {liveKPIs && (
              <div className="grid grid-cols-3 gap-2 animate-fade-up">
                <MetricBox label="Bruttorendite" value={`${(liveKPIs.grossYield * 100).toFixed(2)} %`} good={liveKPIs.grossYield >= 0.04} />
                <MetricBox label="Kaufpreisfaktor" value={`${liveKPIs.factor.toFixed(1)}x`} good={liveKPIs.factor <= 25} />
                <MetricBox label="Jahresmiete" value={`${liveKPIs.annualRent.toLocaleString("de-DE")} €`} good />
              </div>
            )}

            {liveKPIs && (
              <AIComment variant={liveKPIs.grossYield >= 0.05 ? "good" : liveKPIs.grossYield >= 0.04 ? "info" : liveKPIs.grossYield >= 0.03 ? "warn" : "bad"}>
                {liveKPIs.grossYield >= 0.05 ? "Starke Bruttorendite — ein solides Fundament für fremdfinanzierte Kapitalanlagen mit positivem Leverage." :
                 liveKPIs.grossYield >= 0.04 ? "Solide Basis — die Rendite deckt den Kapitaldienst bei marktüblichen Zinsen, lässt aber wenig Puffer." :
                 liveKPIs.grossYield >= 0.03 ? "Unter Beobachtung — die Rendite liegt unter dem Break-even für fremdfinanzierte Akquisitionen." :
                 "Vorsicht — bei dieser Rendite ist eine rentable Fremdfinanzierung bei aktuellen Zinsen kaum darstellbar."}
              </AIComment>
            )}

            <div className="flex justify-end">
              <button
                disabled={!canNext0}
                onClick={() => setSection(1)}
                className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-30"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {/* ── Section 1 ── */}
        {section === 1 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Wie sieht das Objekt im Detail aus?</h2>
            </div>

            {/* MFH: Anzahl Wohneinheiten */}
            {form.propertyType === "mfh" && (
              <div>
                <Input label="Anzahl Wohneinheiten *" value={form.unitCount} onChange={(v) => setForm((f) => ({ ...f, unitCount: v }))} placeholder="6" type="number" explain="Gesamtzahl der vermieteten Einheiten." />
                {form.unitCount && !unitCountValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Mindestens 2 Einheiten</p>}
              </div>
            )}

            {/* Hausgeld (ETW/MFH) or Rücklagen (EFH/DHH) */}
            {(form.propertyType === "etw" || form.propertyType === "mfh") ? (
              <div>
                <Input label="Hausgeld gesamt *" value={form.hausgeld} onChange={(v) => set("hausgeld", v)} placeholder="225" type="number" suffix="€/Mon." explain="Monatliches Hausgeld lt. WEG-Abrechnung." />
                {form.hausgeld && !hausgeldValid && <p className="text-[11px] mt-1" style={{ color: C.red }}>Bitte Hausgeld zwischen 0 und 5.000 € eingeben</p>}
                {hausgeldWarn && hausgeldValid && <p className="text-[11px] mt-1" style={{ color: C.amber }}>Hausgeld ist höher als Kaltmiete — Cashflow negativ!</p>}
              </div>
            ) : (
              <div>
                <Input label="Geschätzte monatliche Rücklagen" value={form.hausgeld} onChange={(v) => set("hausgeld", v)} placeholder={areaNum > 0 ? String(Math.round(areaNum * 1.5)) : "150"} type="number" suffix="€/Mon." explain="Empfehlung: 1–2 €/m² für Instandhaltung." />
                <p className="text-[11px] mt-1" style={{ color: C.dim }}>Bei EFH/DHH gibt es kein WEG-Hausgeld. Planen Sie eigene Rücklagen.</p>
              </div>
            )}

            {/* ── Hausgeld-Aufschlüsselung (optional) ── */}
            {form.hausgeld && hausgeldValid && (
              <div className="space-y-3 animate-fade-up">
                <button
                  type="button"
                  onClick={() => setHgExpanded((e) => !e)}
                  className="flex items-center gap-2 text-xs font-medium transition-all hover:opacity-80"
                  style={{ color: C.accent }}
                >
                  <svg width={12} height={12} viewBox="0 0 16 16" className={`transition-transform ${hgExpanded ? "rotate-180" : ""}`}>
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  {hgExpanded ? "Aufschlüsselung ausblenden" : "Hausgeld aufschlüsseln (für genauere Berechnung)"}
                </button>

                {hgExpanded && (
                  <div className="rounded-xl p-4 space-y-4 animate-fade-up" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div>
                      <p className="text-xs font-bold" style={{ color: C.text }}>Was ist im Hausgeld enthalten?</p>
                      <p className="text-[11px] mt-1" style={{ color: C.dim }}>
                        Je genauer Sie aufschlüsseln, desto präziser wird Ihre Analyse. Die Daten finden Sie in der letzten Hausgeldabrechnung.
                      </p>
                    </div>

                    {/* Umlagefähig section */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-wide" style={{ color: C.green }}>UMLAGEFÄHIG (zahlt Mieter über NK)</p>
                      {HG_ITEMS.filter((i) => i.umlagefaehig).map((item) => {
                        const val = form.hgItems[item.key] || "";
                        const isActive = val !== "" && Number(val) > 0;
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => {
                                setForm((f) => ({
                                  ...f,
                                  hgItems: { ...f.hgItems, [item.key]: e.target.checked ? (val || "0") : "" },
                                }));
                              }}
                              className="rounded accent-[#34D399] shrink-0"
                            />
                            <span className="text-xs flex-1 min-w-0 truncate" style={{ color: isActive ? C.text : C.sub }}>
                              {item.label}
                            </span>
                            {isActive && (
                              <input
                                type="number"
                                value={val}
                                onChange={(e) => {
                                  setForm((f) => ({ ...f, hgItems: { ...f.hgItems, [item.key]: e.target.value } }));
                                }}
                                placeholder="0"
                                className="w-20 rounded-lg px-2 py-1 text-xs text-right outline-none"
                                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                              />
                            )}
                            {isActive && <span className="text-[10px] shrink-0" style={{ color: C.dim }}>€</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Divider */}
                    <div className="h-px" style={{ background: `linear-gradient(90deg, ${C.border}, transparent)` }} />

                    {/* Nicht-umlagefähig section */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-wide" style={{ color: C.amber }}>NICHT UMLAGEFÄHIG (Ihre Kosten)</p>
                      {HG_ITEMS.filter((i) => !i.umlagefaehig).map((item) => {
                        const val = form.hgItems[item.key] || "";
                        const isActive = val !== "" && Number(val) > 0;
                        return (
                          <div key={item.key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => {
                                setForm((f) => ({
                                  ...f,
                                  hgItems: { ...f.hgItems, [item.key]: e.target.checked ? (val || "0") : "" },
                                }));
                              }}
                              className="rounded accent-[#FBBF24] shrink-0"
                            />
                            <span className="text-xs flex-1 min-w-0 truncate" style={{ color: isActive ? C.text : C.sub }}>
                              {item.label}
                            </span>
                            {isActive && (
                              <input
                                type="number"
                                value={val}
                                onChange={(e) => {
                                  setForm((f) => ({ ...f, hgItems: { ...f.hgItems, [item.key]: e.target.value } }));
                                }}
                                placeholder="0"
                                className="w-20 rounded-lg px-2 py-1 text-xs text-right outline-none"
                                style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                              />
                            )}
                            {isActive && <span className="text-[10px] shrink-0" style={{ color: C.dim }}>€</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary */}
                    {hgSplit.hasBreakdown && (
                      <div className="rounded-lg p-3 space-y-1.5" style={{ background: C.surface2, border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: C.green }}>Umlagefähig (zahlt Mieter)</span>
                          <span className="font-bold" style={{ color: C.green }}>{Math.round(hgSplit.umlagefaehig)} €/Mon.</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: C.amber }}>Nicht umlagefähig (Ihre Kosten)</span>
                          <span className="font-bold" style={{ color: C.amber }}>{Math.round(hgSplit.nichtUmlagefaehig)} €/Mon.</span>
                        </div>
                        <div className="h-px" style={{ background: C.border }} />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold" style={{ color: C.text }}>Ihre tatsächliche Belastung</span>
                          <span className="font-bold" style={{ color: C.text }}>{Math.round(hgSplit.nichtUmlagefaehig)} €/Mon.</span>
                        </div>
                        {(hgSplit.umlagefaehig + hgSplit.nichtUmlagefaehig) > hausgeldNum && (
                          <p className="text-[11px] mt-1" style={{ color: C.red }}>
                            Summe der Einzelposten ({Math.round(hgSplit.umlagefaehig + hgSplit.nichtUmlagefaehig)} €) übersteigt Gesamt-Hausgeld ({hausgeldNum} €).
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Estimation hint when no breakdown */}
                {!hgSplit.hasBreakdown && !hgExpanded && (
                  <p className="text-[11px]" style={{ color: C.dim }}>
                    Ohne Aufschlüsselung wird geschätzt: ~{Math.round(hausgeldNum * 0.40)} € nicht-umlagefähig (40 %), ~{Math.round(hausgeldNum * 0.60)} € umlagefähig (60 %).
                  </p>
                )}
              </div>
            )}

            <PillSelect label="Energieeffizienzklasse" options={ENERGY_OPTIONS} value={form.energyClass} onChange={(v) => set("energyClass", v)} explain="Laut Energieausweis. A+ ist die beste, H die schlechteste Klasse." />

            {!locationDone && (
              <PillSelect label="Lageklasse" options={LOCATION_OPTIONS} value={form.locationGrade} onChange={(v) => set("locationGrade", v)} explain="A = Top-Lage, B = gute Lage, C = durchschnittlich, D = Entwicklungslage." />
            )}

            {/* Live-Metriken Sektion 1 */}
            {liveKPIs2 && (form.hausgeld || form.area) && (
              <div className="grid grid-cols-3 gap-2 animate-fade-up">
                <MetricBox label={liveKPIs2.hasBreakdown ? "Netto-Cashflow (bereinigt)" : "Netto-Cashflow (gesch.)"} value={`${Math.round(liveKPIs2.netCashflow)} €/Mon.`} good={liveKPIs2.netCashflow > 0} />
                {liveKPIs2.hausgeldRatio > 0 && <MetricBox label={liveKPIs2.hasBreakdown ? "Bereinigte HG-Quote" : "HG-Quote (gesch.)"} value={`${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} %`} good={liveKPIs2.hausgeldRatio <= 0.3} />}
                {liveKPIs2.sqmPrice > 0 && <MetricBox label="€/m²" value={`${Math.round(liveKPIs2.sqmPrice).toLocaleString("de-DE")} €`} good={liveKPIs2.sqmPrice <= 3500} />}
              </div>
            )}

            {liveKPIs2 && liveKPIs2.hausgeldRatio > 0 && (
              <AIComment variant={liveKPIs2.hausgeldRatio <= 0.25 ? "good" : liveKPIs2.hausgeldRatio <= 0.35 ? "info" : "warn"}>
                {liveKPIs2.hausgeldRatio <= 0.25 ? `${liveKPIs2.hasBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % (${Math.round(liveKPIs2.ownerHG)} € nicht-umlagefähig) — innerhalb institutioneller Standards.` :
                 liveKPIs2.hausgeldRatio <= 0.35 ? `${liveKPIs2.hasBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % — akzeptabel, aber WEG-Wirtschaftsplan prüfen.` :
                 `${liveKPIs2.hasBreakdown ? "Bereinigte" : "Geschätzte"} HG-Quote ${(liveKPIs2.hausgeldRatio * 100).toFixed(0)} % — erhöht. Rücklagenstand und geplante Sonderumlagen hinterfragen.`}
              </AIComment>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSection(0)} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Zurück</button>
              <button disabled={!canNext1} onClick={() => setSection(2)} className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-30" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>Weiter</button>
            </div>
          </div>
        )}

        {/* ── Section 2 ── */}
        {section === 2 && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex items-center gap-3">
              <AIOrb size={32} active />
              <h2 className="text-lg font-bold">Gibt es Sanierungsbedarf?</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {RENO_ITEMS.map((r) => {
                const active = form.renovations.includes(r.key);
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => toggleReno(r.key)}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{
                      background: active ? C.amberDim : C.surface,
                      border: `1px solid ${active ? C.amberBorder : C.border}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: active ? C.amber : C.text }}>{r.label}</span>
                      <span className="text-[11px]" style={{ color: C.dim }}>{r.cost}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: C.dim }}>{r.desc}</p>
                  </button>
                );
              })}
            </div>

            <AIComment variant={form.renovations.length === 0 ? "good" : form.renovations.length <= 2 ? "info" : form.renovations.length <= 4 ? "warn" : "bad"}>
              {form.renovations.length === 0 ? "Kein Sanierungsbedarf erkannt — das Objekt ist stabilisiert und sofort cashflow-fähig." :
               form.renovations.length <= 2 ? `${form.renovations.length} Gewerk${form.renovations.length > 1 ? "e" : ""} mit Bedarf — überschaubares Capex-Risiko, in Kaufpreisverhandlung einbeziehen.` :
               form.renovations.length <= 4 ? `${form.renovations.length} Gewerke mit Bedarf — erhöhtes Capex-Risiko. Verbindliche Angebote vor Kaufvertrag einholen.` :
               `${form.renovations.length} Gewerke mit Bedarf — signifikantes Investitionsrisiko. Nur mit klarer Value-Add-Strategie fortfahren.`}
            </AIComment>

            <div className="flex gap-3">
              <button onClick={() => setSection(1)} className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Zurück</button>
              <button onClick={startAnalysis} className="flex-1 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all" style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>Analyse starten</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════
     LOADING VIEW
     ══════════════════════════════════ */
  if (view === "loading") {
    return (
      <div className="mx-auto max-w-md py-24 space-y-8">
        <div className="flex justify-center">
          <AIOrb size={72} active />
        </div>

        <div className="space-y-4">
          {LOADING_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 transition-all duration-300" style={{ opacity: loadingStep >= i ? 1 : 0.25 }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: loadingStep > i ? C.greenDim : loadingStep === i ? C.accentMid : C.surface, color: loadingStep > i ? C.green : loadingStep === i ? C.accent : C.dim, border: `1px solid ${loadingStep > i ? C.greenBorder : loadingStep === i ? C.accent : C.border}` }}>
                {loadingStep > i ? "\u2713" : i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: loadingStep >= i ? C.text : C.dim }}>{s.title}</p>
                <p className="text-xs" style={{ color: C.dim }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs" style={{ color: C.dim }}>
            <span>Analyse läuft</span>
            <span>{loadingPct} %</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${loadingPct}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})` }} />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     RESULT VIEW
     ══════════════════════════════════ */
  if (view === "result" && result) {
    const radarData = result.subscores.map((s) => ({
      subject: s.label.replace("-Score", "").replace("Investitions", "Invest.").replace("Vermietbarkeits", "Vermiet.").replace("Finanzierungs", "Finanz.").replace("Zukunfts", "Zukunft"),
      value: s.value,
      fullMark: 100,
    }));

    const kiEmpfehlung = getKIEmpfehlung(result);
    const verhandlungsTipps = getVerhandlungsTipps(result);

    return (
      <div className="mx-auto max-w-[1100px] space-y-6 animate-fade-up">
        {fromCompare ? (
          <Link href="/compare" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
            ← Zurück zum Vergleich
          </Link>
        ) : (
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
            ← Dashboard
          </Link>
        )}
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg animate-fade-up"
            style={{
              background: toast.type === "success" ? C.greenDim : C.redDim,
              color: toast.type === "success" ? C.green : C.red,
              border: `1px solid ${toast.type === "success" ? C.greenBorder : "rgba(248,113,113,0.2)"}`,
            }}
          >
            {toast.text}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Analyseergebnis</h1>
              <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: result.confidence === "Hohe Bewertungssicherheit" ? C.greenDim : result.confidence === "Mittlere Bewertungssicherheit" ? C.amberDim : C.redDim, color: result.confidence === "Hohe Bewertungssicherheit" ? C.green : result.confidence === "Mittlere Bewertungssicherheit" ? C.amber : C.red, border: `1px solid ${result.confidence === "Hohe Bewertungssicherheit" ? C.greenBorder : result.confidence === "Mittlere Bewertungssicherheit" ? C.amberBorder : "rgba(248,113,113,0.2)"}` }}>
                {result.confidence}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm" style={{ color: C.sub }}>
                {form.street}, {form.city} —{" "}
                {form.propertyType === "etw" ? `ETW ${form.apartmentType ? (form.apartmentType.charAt(0).toUpperCase() + form.apartmentType.slice(1)) : ""}` : form.propertyType === "efh" ? "EFH" : form.propertyType === "mfh" ? "MFH" : form.propertyType === "dhh" ? "DHH" : ""}
                {form.rooms ? `, ${form.rooms} Zi.` : ""}, {form.area} m², Bj. {form.year}, Klasse {form.energyClass}
              </p>
              {result.kpis.hasHGBreakdown && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}>
                  Detaillierte Hausgeld-Analyse
                </span>
              )}
              {form.rentType === "warm" && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.accentDim, color: C.accent, border: `1px solid rgba(124,106,255,0.2)` }}>
                  Warmmiete-Korrektur
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {saveChoice === "none" ? (
              <button
                onClick={handleSaveCompare}
                disabled={saving}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
              >
                {saving ? "Speichert..." : "Im Vergleich speichern"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/compare")}
                className="rounded-xl px-4 py-2 text-sm font-bold transition-all hover:opacity-90 flex items-center gap-1.5"
                style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Zum Vergleich
              </button>
            )}
            <button onClick={reset} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>Neue Analyse</button>
          </div>
        </div>

        {/* ── Plausibility Warnings ── */}
        {result.plausibility && result.plausibility.length > 0 && (
          <div className="space-y-2">
            {result.plausibility.some(c => c.level === "error") && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                Achtung: Die eingegebenen Daten erscheinen nicht plausibel. Bitte Kaufpreis und Mieteinnahmen prüfen.
              </div>
            )}
            {result.plausibility.map((c, i) => (
              <div key={i} className="rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2" style={{
                background: c.level === "error" ? C.redDim : c.level === "warning" ? C.orangeDim : C.greenDim,
                color: c.level === "error" ? C.red : c.level === "warning" ? C.orange : C.green,
                border: `1px solid ${c.level === "error" ? "rgba(248,113,113,0.2)" : c.level === "warning" ? C.orangeBorder : C.greenBorder}`,
              }}>
                {c.level === "error" ? "Fehler" : "Warnung"}: {c.message}
              </div>
            ))}
          </div>
        )}

        {/* ── Full Result View ── */}
          <>
            {/* Hero Row */}
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="p-6 flex flex-col items-center justify-center" glow>
                <ScoreRing value={result.totalScore} size={150} />
                <p className="text-sm font-bold mt-2" style={{ color: scoreColor(result.totalScore) }}>{scoreLabel(result.totalScore)}</p>
                <p className="text-xs mt-1" style={{ color: C.dim }}>Gesamtbewertung</p>
              </Card>
              <Card className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                    <PolarGrid stroke={C.border} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: C.sub, fontSize: 10 }} />
                    <Radar dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.08} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
              <div className="space-y-3">
                <KPIRow label="Warmmiete" value={`${warmmiete.toLocaleString("de-DE")} €/Mon.`} color={C.blue} />
                <KPIRow label={result.kpis.hasHGBreakdown ? "Nettorendite (bereinigt)" : "Nettorendite"} value={`${(result.kpis.netYield * 100).toFixed(2)} %`} color={result.kpis.netYield >= 0.03 ? C.green : result.kpis.netYield >= 0.01 ? C.amber : C.red} />
                <KPIRow label="Kaufpreisfaktor" value={`${result.kpis.factor.toFixed(1)}x`} color={result.kpis.factor <= 25 ? C.green : result.kpis.factor <= 30 ? C.amber : C.red} />
                <KPIRow label="Finanzierbarkeit" value={`${result.subscores.find(s => s.key === "financing")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "financing")?.value || 0)} />
                <KPIRow label="Risiko-Score" value={`${result.subscores.find(s => s.key === "risk")?.value || 0}/100`} color={scoreColor(result.subscores.find(s => s.key === "risk")?.value || 0)} />
              </div>
            </div>

            <AIComment variant={kiEmpfehlung.variant}>
              {kiEmpfehlung.text}
            </AIComment>

            {/* Subscore Cards */}
            <div className="space-y-2">
              <p className="text-xs" style={{ color: C.dim }}>Klicken für Begründung + Empfehlung</p>
              {result.subscores.map((sub) => {
                const isExpanded = expanded === sub.key;
                return (
                  <Card key={sub.key} className="overflow-hidden" hover onClick={() => setExpanded(isExpanded ? null : sub.key)}>
                    <div className="flex items-center gap-4 p-4">
                      <MiniRing value={sub.value} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{sub.label}</span>
                          <span className="text-[11px] rounded-full px-2 py-0.5" style={{ background: C.surface3, color: C.dim }}>{sub.weight} %</span>
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: C.sub }}>{sub.oneLiner}</p>
                      </div>
                      <svg width={16} height={16} viewBox="0 0 16 16" className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: C.dim }}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>

                    {isExpanded && (
                      <div className="grid md:grid-cols-2 gap-4 px-4 pb-4 border-t animate-fade-up" style={{ borderColor: C.border }}>
                        <div className="pt-4 space-y-2">
                          <h4 className="text-xs font-bold" style={{ color: C.blue }}>Warum dieser Wert?</h4>
                          <ul className="space-y-1.5">
                            {sub.reasons.map((r, i) => (
                              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.blue }} />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-4 space-y-2">
                          <h4 className="text-xs font-bold" style={{ color: C.green }}>Empfehlung</h4>
                          <ul className="space-y-1.5">
                            {sub.actions.map((a, i) => (
                              <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                                <span className="mt-0.5 shrink-0" style={{ color: C.green }}>{"\u2192"}</span>
                                {a}
                              </li>
                            ))}
                          </ul>
                          {sub.key === "financing" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowFinanzierung(true); }}
                              className="mt-3 rounded-lg px-4 py-2 text-xs font-semibold transition-all hover:opacity-90"
                              style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                            >
                              Jetzt kostenlose Finanzierungsberatung anfragen →
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Stärken + Risiken */}
            <div className="grid md:grid-cols-2 gap-5 mt-6">
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: C.green }} />
                  <h3 className="text-sm font-bold">Stärken</h3>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.green }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: C.amber }} />
                  <h3 className="text-sm font-bold">Risiken</h3>
                </div>
                <ul className="space-y-2">
                  {result.risks.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: C.amber }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* ── Geschätzte Sanierungskosten (TEIL 2) ── */}
            {result.renovationEstimate && result.renovationEstimate.total > 0 && (
              <Card className="p-5 space-y-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: C.amber }} />
                  <h3 className="text-sm font-bold" style={{ color: C.text }}>Geschätzte Sanierungskosten</h3>
                  {form.propertyType && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.surface3, color: C.dim }}>
                      {form.propertyType === "etw" ? "ETW" : form.propertyType === "efh" ? "EFH" : form.propertyType === "mfh" ? "MFH" : form.propertyType === "dhh" ? "DHH" : ""}-Kalkulation
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {Object.entries(result.renovationEstimate.breakdown).map(([key, cost]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span style={{ color: C.sub }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span className="font-bold" style={{ color: C.text }}>~{Math.round(cost).toLocaleString("de-DE")} €</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: C.border }}>
                    <span style={{ color: C.text }}>Geschätzte Gesamtkosten</span>
                    <span style={{ color: C.amber }}>~{Math.round(result.renovationEstimate.total).toLocaleString("de-DE")} €</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span style={{ color: C.sub }}>Effektiver Kaufpreis (inkl. Sanierung)</span>
                    <span className="font-bold" style={{ color: C.text }}>{Math.round(Number(form.price) + result.renovationEstimate.total).toLocaleString("de-DE")} €</span>
                  </div>
                </div>
                {result.renovationEstimate.hints.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {result.renovationEstimate.hints.map((h, i) => (
                      <p key={i} className="text-[11px] italic" style={{ color: C.dim }}>{h}</p>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* ── Wertschöpfungspotenzial (TEIL 3) ── */}
            {result.valuePotential && (
              <Card className="p-5 space-y-3 mt-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: result.valuePotential.scoreBonus > 0 ? C.green : result.valuePotential.scoreBonus < 0 ? C.red : C.blue }} />
                  <h3 className="text-sm font-bold" style={{ color: C.text }}>Wertschöpfungspotenzial</h3>
                  {result.valuePotential.scoreBonus !== 0 && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                      background: result.valuePotential.scoreBonus > 0 ? C.greenDim : C.redDim,
                      color: result.valuePotential.scoreBonus > 0 ? C.green : C.red,
                      border: `1px solid ${result.valuePotential.scoreBonus > 0 ? C.greenBorder : "rgba(248,113,113,0.2)"}`,
                    }}>
                      {result.valuePotential.scoreBonus > 0 ? "+" : ""}{result.valuePotential.scoreBonus} Punkte
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{result.valuePotential.message}</p>
              </Card>
            )}

            {/* ── Energieklasse Erklärung (TEIL 4) ── */}
            {result.energyExplanation && (
              <Card className="p-5 space-y-3 mt-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: scoreColor(result.subscores.find(s => s.key === "energy")?.value || 0) }} />
                  <h3 className="text-sm font-bold" style={{ color: C.text }}>Energieklasse {form.energyClass}</h3>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: C.surface3, color: C.dim }}>
                    {result.subscores.find(s => s.key === "energy")?.value || 0}/100
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.sub }}>{result.energyExplanation}</p>
              </Card>
            )}

            {/* ── Verhandlungsguide ── */}
            <Card className="p-5 space-y-4 mt-6">
              <div className="flex items-center gap-2">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
                </svg>
                <h3 className="text-sm font-bold" style={{ color: C.text }}>Verhandlungsguide</h3>
              </div>
              <p className="text-xs" style={{ color: C.dim }}>
                Basierend auf Ihren Analysedaten — nutzen Sie diese Argumente in der Preisverhandlung:
              </p>
              <ul className="space-y-2">
                {verhandlungsTipps.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.sub }}>
                    <span className="mt-0.5 shrink-0 font-bold" style={{ color: C.accent }}>{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            {/* ── Finanzierungs-CTA Box ── */}
            <div
              className="rounded-2xl p-6 mt-6"
              style={{
                background: C.surface2,
                border: `1px solid transparent`,
                backgroundClip: "padding-box",
                boxShadow: `inset 0 0 0 1px ${C.border}`,
                backgroundImage: `linear-gradient(${C.surface2}, ${C.surface2}), linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                backgroundOrigin: "border-box",
              }}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1 space-y-3">
                  <h3 className="text-base font-bold" style={{ color: C.text }}>Kostenlose Finanzierungsanfrage</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.sub }}>
                    Unsere Experten prüfen Ihre Finanzierungsmöglichkeiten — persönlich, unverbindlich, innerhalb von 24 Stunden.
                  </p>
                  <ul className="space-y-1.5">
                    <li className="flex gap-2 text-sm" style={{ color: C.sub }}>
                      <span style={{ color: C.green }}>✓</span> Über 500 Bankpartner im Vergleich
                    </li>
                    <li className="flex gap-2 text-sm" style={{ color: C.sub }}>
                      <span style={{ color: C.green }}>✓</span> Persönliche Beratung statt Algorithmus
                    </li>
                    <li className="flex gap-2 text-sm" style={{ color: C.sub }}>
                      <span style={{ color: C.green }}>✓</span> Auch für Objekte mit Sanierungsbedarf
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowFinanzierung(true)}
                    className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                  >
                    Finanzierung anfragen
                  </button>
                  <span className="text-[11px]" style={{ color: C.dim }}>100% kostenlos · Antwort in 24h</span>
                </div>
              </div>
            </div>

            {/* ── Finanzierungs-Modal Overlay ── */}
            {showFinanzierung && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
                <div
                  className="relative w-full max-w-lg rounded-2xl p-6 space-y-5 animate-fade-up"
                  style={{ background: C.bg2, border: `1px solid ${C.border}` }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowFinanzierung(false)}
                    className="absolute top-4 right-4 rounded-lg p-1 transition-all hover:opacity-70"
                    style={{ color: C.dim }}
                  >
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>

                  {finanzSent ? (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: C.greenDim, border: `1px solid ${C.greenBorder}` }}>
                        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold" style={{ color: C.text }}>Vielen Dank!</h3>
                      <p className="text-sm" style={{ color: C.sub }}>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                      <button
                        onClick={() => setShowFinanzierung(false)}
                        className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold"
                        style={{ border: `1px solid ${C.border}`, color: C.sub }}
                      >
                        Schließen
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: C.text }}>Finanzierungsanfrage</h3>
                        <p className="text-xs mt-1" style={{ color: C.dim }}>
                          Objekt: {form.street}, {form.city} — {Number(form.price).toLocaleString("de-DE")} €
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Vorname *</label>
                          <input
                            type="text"
                            value={finanzForm.firstName}
                            onChange={(e) => setFinanzForm((f) => ({ ...f, firstName: e.target.value }))}
                            placeholder="Max"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1"
                            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachname *</label>
                          <input
                            type="text"
                            value={finanzForm.lastName}
                            onChange={(e) => setFinanzForm((f) => ({ ...f, lastName: e.target.value }))}
                            placeholder="Mustermann"
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1"
                            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>E-Mail</label>
                        <input
                          type="email"
                          value={finanzForm.email || user?.email || ""}
                          onChange={(e) => setFinanzForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="email@beispiel.de"
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1"
                          style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Telefon *</label>
                        <input
                          type="tel"
                          value={finanzForm.phone}
                          onChange={(e) => setFinanzForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="+49 170 1234567"
                          className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1"
                          style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium mb-1 block" style={{ color: C.sub }}>Nachricht (optional)</label>
                        <textarea
                          value={finanzForm.message}
                          onChange={(e) => setFinanzForm((f) => ({ ...f, message: e.target.value }))}
                          placeholder="Besondere Wünsche oder Fragen..."
                          rows={2}
                          className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-1"
                          style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}
                        />
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={finanzForm.consent}
                          onChange={(e) => setFinanzForm((f) => ({ ...f, consent: e.target.checked }))}
                          className="mt-0.5 rounded"
                        />
                        <span className="text-xs leading-relaxed" style={{ color: C.sub }}>
                          Ich stimme der Kontaktaufnahme per Telefon/E-Mail zu. *
                        </span>
                      </label>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowFinanzierung(false)}
                          className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                          style={{ border: `1px solid ${C.border}`, color: C.sub }}
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={handleFinanzierung}
                          disabled={finanzSending || !finanzForm.firstName || !finanzForm.lastName || !finanzForm.phone || !finanzForm.consent}
                          className="flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-40"
                          style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                        >
                          {finanzSending ? "Wird gesendet..." : "Anfrage absenden"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── KI-Investitionsberater ── */}
            {result && (() => {
              const analysisContext: AIChatContext = {
                type: "analysis",
                data: {
                  address: `${form.street}, ${form.city}`,
                  city: form.city,
                  propertyType: form.propertyType || "etw",
                  area: Number(form.area),
                  buildingYear: Number(form.year),
                  energyClass: form.energyClass,
                  purchasePrice: Number(form.price),
                  monthlyRent: getKaltmiete(form),
                  managementFee: Number(form.hausgeld),
                  renovations: form.renovations,
                  totalScore: result.totalScore,
                  grossYield: (result.kpis.grossYield * 100).toFixed(1),
                  netYield: (result.kpis.netYield * 100).toFixed(1),
                  priceFactor: result.kpis.factor.toFixed(1),
                  locationGrade: form.locationGrade,
                  subscores: Object.fromEntries(result.subscores.map(s => [s.key, s.value])),
                },
              };
              const suggestions = getDynamicSuggestions(result, form);
              return (
                <AIChat
                  context={analysisContext}
                  suggestedQuestions={suggestions}
                  defaultOpen={false}
                />
              );
            })()}

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {saveChoice === "none" ? (
                <button
                  onClick={handleSaveCompare}
                  disabled={saving}
                  className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}
                >
                  {saving ? "Wird gespeichert..." : "Im Vergleich speichern"}
                </button>
              ) : (
                <button
                  onClick={() => router.push("/compare")}
                  className="rounded-xl px-6 py-3 text-sm font-bold transition-all hover:opacity-90 flex items-center gap-2"
                  style={{ background: C.greenDim, color: C.green, border: `1px solid ${C.greenBorder}` }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Zum Vergleich →
                </button>
              )}
              <button
                onClick={reset}
                className="rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                style={{ border: `1px solid ${C.border}`, color: C.sub }}
              >
                Neue Analyse starten
              </button>
            </div>

          </>
      </div>
    );
  }

  return null;
}

/* ─── Hilfskomponenten ─── */

function MetricBox({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: good ? C.greenDim : C.amberDim, border: `1px solid ${good ? C.greenBorder : C.amberBorder}` }}>
      <p className="text-sm font-bold" style={{ color: good ? C.green : C.amber }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5 text-center" style={{ background: C.surface }}>
      <p className="text-xs font-bold" style={{ color: C.text }}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: C.dim }}>{label}</p>
    </div>
  );
}

function KPIRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card className="flex items-center justify-between px-4 py-3">
      <span className="text-xs font-medium" style={{ color: C.sub }}>{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </Card>
  );
}

