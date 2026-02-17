"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InlineHelp } from "@/components/ui";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { addProperty } from "@/lib/storage";
import { computeScore, scoreTrend } from "@/lib/scoring";
import type { EnergyClass, LocationGrade, Renovations, Property } from "@/lib/types";

const ENERGY_CLASSES: EnergyClass[] = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"];
const LOCATION_GRADES: LocationGrade[] = ["A", "B", "C", "D"];

const RENOVATION_ITEMS: { key: keyof Renovations; label: string; help: string }[] = [
  { key: "roof", label: "Roof", help: "Does the roof need replacement or major repairs?" },
  { key: "facade", label: "Facade", help: "Is the facade insulation outdated or damaged?" },
  { key: "windows", label: "Windows", help: "Are windows single-glazed or older than 20 years?" },
  { key: "bathroom", label: "Bathroom", help: "Does the bathroom need a full renovation?" },
  { key: "electrical", label: "Electrical", help: "Is the electrical system outdated (pre-1990)?" },
  { key: "heating", label: "Heating", help: "Does the heating system need replacement?" },
];

interface FormState {
  street: string;
  city: string;
  purchasePrice: string;
  monthlyRent: string;
  housegeld: string;
  baujahr: string;
  energyClass: EnergyClass | "";
  areaSqm: string;
  locationGrade: LocationGrade | "";
  exposeImageUrl: string;
  renovations: Renovations;
}

const INITIAL: FormState = {
  street: "",
  city: "",
  purchasePrice: "",
  monthlyRent: "",
  housegeld: "",
  baujahr: "",
  energyClass: "",
  areaSqm: "",
  locationGrade: "",
  exposeImageUrl: "",
  renovations: { roof: false, facade: false, windows: false, bathroom: false, electrical: false, heating: false },
};

export default function AnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [result, setResult] = useState<Property | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleReno(key: keyof Renovations) {
    setForm((f) => ({
      ...f,
      renovations: { ...f.renovations, [key]: !f.renovations[key] },
    }));
  }

  function canProceed1() {
    return (
      form.purchasePrice && form.monthlyRent && form.housegeld &&
      form.baujahr && form.energyClass && form.areaSqm && form.locationGrade
    );
  }

  function handleNext() {
    if (step === 1) setStep(2);
    else if (step === 2) {
      const score = computeScore({
        purchasePrice: Number(form.purchasePrice),
        monthlyRent: Number(form.monthlyRent),
        housegeld: Number(form.housegeld),
        baujahr: Number(form.baujahr),
        energyClass: form.energyClass as EnergyClass,
        areaSqm: Number(form.areaSqm),
        locationGrade: form.locationGrade as LocationGrade,
        renovations: form.renovations,
      });

      const property: Property = {
        id: crypto.randomUUID(),
        street: form.street || "Unknown Street",
        city: form.city || "Unknown City",
        purchasePrice: Number(form.purchasePrice),
        monthlyRent: Number(form.monthlyRent),
        housegeld: Number(form.housegeld),
        baujahr: Number(form.baujahr),
        energyClass: form.energyClass as EnergyClass,
        areaSqm: Number(form.areaSqm),
        locationGrade: form.locationGrade as LocationGrade,
        renovations: form.renovations,
        exposeImageUrl: form.exposeImageUrl || undefined,
        score,
        trend: scoreTrend(),
        favorite: false,
        createdAt: new Date().toISOString(),
      };

      setResult(property);
      setStep(3);
    }
  }

  function handleSave() {
    if (!result) return;
    addProperty(result);
    router.push("/properties");
  }

  const gross = form.purchasePrice && form.monthlyRent
    ? ((Number(form.monthlyRent) * 12) / Number(form.purchasePrice) * 100).toFixed(2)
    : null;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => { if (s < step) setStep(s); }}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              s === step ? "text-[var(--accent)]" : s < step ? "text-[var(--fg)] cursor-pointer" : "text-[var(--muted)]"
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s === step
                  ? "bg-[var(--accent)] text-white"
                  : s < step
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-[var(--muted)]"
              }`}
            >
              {s < step ? "✓" : s}
            </span>
            <span className="hidden sm:inline">
              {s === 1 ? "Basics" : s === 2 ? "Renovations" : "Result"}
            </span>
          </button>
        ))}
        <div className="flex-1" />
        {gross && step === 1 && (
          <span className="text-xs text-[var(--muted)]">
            Gross yield: <strong className="text-[var(--fg)]">{gross}%</strong>
          </span>
        )}
      </div>

      {/* ─── Step 1: Basics ─── */}
      {step === 1 && (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Property Basics</h2>
            <p className="text-sm text-[var(--muted)]">Core financial and location details.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Street" value={form.street} onChange={(v) => set("street", v)} placeholder="Berliner Str. 42" />
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Purchase Price"
              value={form.purchasePrice}
              onChange={(v) => set("purchasePrice", v)}
              placeholder="250000"
              type="number"
              prefix="€"
              help="Total asking price including any listed Nebenkosten."
            />
            <Field
              label="Monthly Rent (Kaltmiete)"
              value={form.monthlyRent}
              onChange={(v) => set("monthlyRent", v)}
              placeholder="950"
              type="number"
              prefix="€"
              help="Net cold rent, excluding utilities."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Hausgeld"
              value={form.housegeld}
              onChange={(v) => set("housegeld", v)}
              placeholder="350"
              type="number"
              prefix="€"
              help="Monthly management fee for the property."
            />
            <Field
              label="Living Area"
              value={form.areaSqm}
              onChange={(v) => set("areaSqm", v)}
              placeholder="72"
              type="number"
              suffix="m²"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Baujahr (Year Built)"
              value={form.baujahr}
              onChange={(v) => set("baujahr", v)}
              placeholder="1985"
              type="number"
            />
            <SelectField
              label="Energy Class"
              value={form.energyClass}
              onChange={(v) => set("energyClass", v)}
              options={ENERGY_CLASSES}
              placeholder="Select"
            />
            <SelectField
              label="Location Grade"
              value={form.locationGrade}
              onChange={(v) => set("locationGrade", v)}
              options={LOCATION_GRADES}
              placeholder="Select"
              help="A = prime, D = developing area."
            />
          </div>

          <Field
            label="Exposé Image URL (optional)"
            value={form.exposeImageUrl}
            onChange={(v) => set("exposeImageUrl", v)}
            placeholder="https://example.com/photo.jpg"
          />

          <button
            disabled={!canProceed1()}
            onClick={handleNext}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Renovations →
          </button>
        </div>
      )}

      {/* ─── Step 2: Renovations ─── */}
      {step === 2 && (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Renovation Needs</h2>
            <p className="text-sm text-[var(--muted)]">Toggle items that need renovation. Each reduces the score.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {RENOVATION_ITEMS.map(({ key, label, help }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form.renovations[key]
                    ? "border-amber-300 bg-amber-50"
                    : "border-[var(--border)] hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.renovations[key]}
                  onChange={() => toggleReno(key)}
                  className="w-4 h-4 rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm font-medium">{label}</span>
                <InlineHelp text={help} />
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              Calculate Score →
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Result ─── */}
      {step === 3 && result && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Analysis Result</h2>
                <p className="text-sm text-[var(--muted)]">Score calculated from all provided data.</p>
              </div>
              <ScoreBadge score={result.score} size="lg" />
            </div>

            <ProgressBar value={result.score} label="Investment Score" />

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <Stat label="Gross Yield" value={`${((result.monthlyRent * 12) / result.purchasePrice * 100).toFixed(2)}%`} />
              <Stat label="Price / m²" value={`€${Math.round(result.purchasePrice / result.areaSqm).toLocaleString()}`} />
              <Stat label="Rent Multiplier" value={`${(result.purchasePrice / (result.monthlyRent * 12)).toFixed(1)}x`} />
            </div>
          </div>

          <div className="max-w-xs">
            <PropertyCard
              street={result.street}
              city={result.city}
              price={`€${result.purchasePrice.toLocaleString()}`}
              trend={result.trend}
              score={result.score}
              imageUrl={result.exposeImageUrl}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setResult(null); }}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
            >
              ← Analyze Another
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              Save to Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field helpers ─── */

function Field({
  label, value, onChange, placeholder, type = "text", prefix, suffix, help,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; prefix?: string; suffix?: string; help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--muted)]">
        {label}
        {help && <InlineHelp text={help} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted)] text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 ${
            prefix ? "pl-8" : ""
          } ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted)] text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder, help,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string; help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--muted)]">
        {label}
        {help && <InlineHelp text={help} />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none"
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-semibold mt-0.5">{value}</p>
    </div>
  );
}
