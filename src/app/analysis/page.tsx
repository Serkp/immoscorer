"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InlineHelp } from "@/components/ui";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { addProperty } from "@/lib/storage";
import { computeScore, scoreTrend } from "@/lib/scoring";
import type { ScoringResult } from "@/lib/scoring";
import type { EnergyClass, LocationGrade, Renovations, Property } from "@/lib/types";

const ENERGY_CLASSES: EnergyClass[] = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"];
const LOCATION_GRADES: LocationGrade[] = ["A", "B", "C", "D"];

const RENOVATION_ITEMS: { key: keyof Renovations; label: string; help: string }[] = [
  { key: "roof", label: "Dach", help: "Muss das Dach erneuert oder grundlegend saniert werden?" },
  { key: "facade", label: "Fassade", help: "Ist die Fassadend\u00E4mmung veraltet oder besch\u00E4digt?" },
  { key: "windows", label: "Fenster", help: "Sind die Fenster einfach verglast oder \u00E4lter als 20 Jahre?" },
  { key: "bathroom", label: "Bad", help: "Muss das Badezimmer komplett saniert werden?" },
  { key: "electrical", label: "Elektrik", help: "Ist die Elektroinstallation veraltet (vor 1990)?" },
  { key: "heating", label: "Heizung", help: "Muss die Heizungsanlage erneuert werden?" },
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
  const [scoring, setScoring] = useState<ScoringResult | null>(null);

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
      const sr = computeScore({
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
        street: form.street || "Unbekannte Stra\u00DFe",
        city: form.city || "Unbekannte Stadt",
        purchasePrice: Number(form.purchasePrice),
        monthlyRent: Number(form.monthlyRent),
        housegeld: Number(form.housegeld),
        baujahr: Number(form.baujahr),
        energyClass: form.energyClass as EnergyClass,
        areaSqm: Number(form.areaSqm),
        locationGrade: form.locationGrade as LocationGrade,
        renovations: form.renovations,
        exposeImageUrl: form.exposeImageUrl || undefined,
        score: sr.totalScore,
        scoringResult: sr,
        trend: scoreTrend(),
        favorite: false,
        createdAt: new Date().toISOString(),
      };

      setScoring(sr);
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
              {s < step ? "\u2713" : s}
            </span>
            <span className="hidden sm:inline">
              {s === 1 ? "Basisdaten" : s === 2 ? "Sanierung" : "Ergebnis"}
            </span>
          </button>
        ))}
        <div className="flex-1" />
        {gross && step === 1 && (
          <span className="text-xs text-[var(--muted)]">
            Bruttorendite: <strong className="text-[var(--fg)]">{gross}%</strong>
          </span>
        )}
      </div>

      {/* ─── Step 1: Basics ─── */}
      {step === 1 && (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Objektdaten</h2>
            <p className="text-sm text-[var(--muted)]">Finanzielle Eckdaten und Lageangaben.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Stra\u00DFe" value={form.street} onChange={(v) => set("street", v)} placeholder="Berliner Str. 42" />
            <Field label="Stadt" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Kaufpreis"
              value={form.purchasePrice}
              onChange={(v) => set("purchasePrice", v)}
              placeholder="250000"
              type="number"
              prefix="\u20AC"
              help="Gesamtangebotspreis inkl. ggf. ausgewiesener Nebenkosten."
            />
            <Field
              label="Monatliche Kaltmiete"
              value={form.monthlyRent}
              onChange={(v) => set("monthlyRent", v)}
              placeholder="950"
              type="number"
              prefix="\u20AC"
              help="Nettokaltmiete ohne Nebenkosten."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Hausgeld"
              value={form.housegeld}
              onChange={(v) => set("housegeld", v)}
              placeholder="350"
              type="number"
              prefix="\u20AC"
              help="Monatliches Hausgeld (Verwaltung + Instandhaltungsr\u00FCcklage)."
            />
            <Field
              label="Wohnfl\u00E4che"
              value={form.areaSqm}
              onChange={(v) => set("areaSqm", v)}
              placeholder="72"
              type="number"
              suffix="m\u00B2"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Baujahr"
              value={form.baujahr}
              onChange={(v) => set("baujahr", v)}
              placeholder="1985"
              type="number"
            />
            <SelectField
              label="Energieeffizienzklasse"
              value={form.energyClass}
              onChange={(v) => set("energyClass", v)}
              options={ENERGY_CLASSES}
              placeholder="Ausw\u00E4hlen"
            />
            <SelectField
              label="Lageklasse"
              value={form.locationGrade}
              onChange={(v) => set("locationGrade", v)}
              options={LOCATION_GRADES}
              placeholder="Ausw\u00E4hlen"
              help="A = Top-Lage, D = Entwicklungslage."
            />
          </div>

          <Field
            label="Expos\u00E9-Bild-URL (optional)"
            value={form.exposeImageUrl}
            onChange={(v) => set("exposeImageUrl", v)}
            placeholder="https://example.com/photo.jpg"
          />

          <button
            disabled={!canProceed1()}
            onClick={handleNext}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter zu Sanierung \u2192
          </button>
        </div>
      )}

      {/* ─── Step 2: Renovations ─── */}
      {step === 2 && (
        <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Sanierungsbedarf</h2>
            <p className="text-sm text-[var(--muted)]">Markieren Sie Gewerke mit Sanierungsbedarf. Jedes reduziert den Score.</p>
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
              \u2190 Zur\u00FCck
            </button>
            <button
              onClick={handleNext}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              Score berechnen \u2192
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Result ─── */}
      {step === 3 && result && scoring && (
        <div className="space-y-6">
          {/* Total score + confidence + explanation */}
          <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Analyseergebnis</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-[var(--muted)]">Gewichteter Score \u00FCber 6 Dimensionen</p>
                  <ConfidenceBadge level={scoring.confidenceLevel} />
                </div>
              </div>
              <ScoreBadge score={scoring.totalScore} size="lg" />
            </div>

            <ProgressBar value={scoring.totalScore} label="Gesamtscore" />

            <p className="text-sm text-[var(--muted)] leading-relaxed">{scoring.explanation}</p>
          </div>

          {/* Subscores */}
          <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold">Teilscores</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(scoring.subscores).map((sub) => (
                <div key={sub.label} className="rounded-xl bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sub.label}</span>
                    <ScoreBadge score={sub.value} size="sm" />
                  </div>
                  <ProgressBar value={sub.value} />
                  <p className="text-xs text-[var(--muted)]">Gewichtung: {Math.round(sub.weight * 100)}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison metrics */}
          <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6">
            <h3 className="font-semibold mb-3">Vergleichskennzahlen</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <MetricCard label="Bruttorendite" value={`${(scoring.comparisonMetrics.yield * 100).toFixed(2)}%`} />
              <MetricCard label="Kaufpreisfaktor" value={`${scoring.comparisonMetrics.factor.toFixed(1)}x`} />
              <MetricCard label="Sanierungen" value={`${scoring.comparisonMetrics.renovationCount}/6`} />
              <MetricCard label="Energie-Rang" value={`${scoring.comparisonMetrics.energyRank}/100`} />
              <MetricCard label="Bank-Score" value={`${scoring.comparisonMetrics.bankScore}/100`} />
              <MetricCard label="Risiko-Stufe" value={`${scoring.comparisonMetrics.riskLevel}/100`} />
            </div>
          </div>

          {/* Strengths + risks */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ListCard title="St\u00E4rken" items={scoring.strengths} icon="\u2705" />
            <ListCard title="Risiken" items={scoring.risks} icon="\u26A0\uFE0F" />
          </div>

          {/* Categorized recommendations */}
          <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6 space-y-5">
            <h3 className="font-semibold">Handlungsempfehlungen</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <RecoSection tag="Finanzierung" items={scoring.recommendations.financing} icon="\uD83C\uDFE6" />
              <RecoSection tag="Technik" items={scoring.recommendations.technical} icon="\uD83D\uDD27" />
              <RecoSection tag="Recht" items={scoring.recommendations.legal} icon="\u2696\uFE0F" />
              <RecoSection tag="Strategie" items={scoring.recommendations.strategy} icon="\uD83C\uDFAF" />
            </div>
          </div>

          {/* Property preview card */}
          <div className="max-w-xs">
            <PropertyCard
              street={result.street}
              city={result.city}
              price={`\u20AC${result.purchasePrice.toLocaleString()}`}
              trend={result.trend}
              score={result.score}
              imageUrl={result.exposeImageUrl}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setResult(null); setScoring(null); }}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
            >
              \u2190 Neue Analyse
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              Im Portfolio speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small helper components ─── */

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
        <option value="">{placeholder || "Ausw\u00E4hlen\u2026"}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function ListCard({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-5 space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--muted)] leading-relaxed">
            <span className="shrink-0 mt-0.5">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: import("@/lib/scoring").ConfidenceLevel }) {
  const styles = {
    high: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    low: "bg-red-50 text-red-700 ring-red-200",
  };
  const labels = { high: "Hohe Bewertungssicherheit", medium: "Mittlere Bewertungssicherheit", low: "Geringe Bewertungssicherheit" };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function RecoSection({ tag, items, icon }: { tag: string; items: string[]; icon: string }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">{icon}</span>
        <h4 className="text-sm font-semibold">{tag}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-[var(--muted)] leading-relaxed pl-5">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
