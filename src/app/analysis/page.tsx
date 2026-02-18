"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { InlineHelp } from "@/components/ui";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
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

const STEPS = [
  { num: 1, label: "Basisdaten" },
  { num: 2, label: "Sanierung" },
  { num: 3, label: "Ergebnis" },
];

const SUBSCORE_COLORS = ["#4F46E5", "#6366F1", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD"];

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

  const liveMetrics = useMemo(() => {
    if (!form.purchasePrice || !form.monthlyRent) return null;
    const price = Number(form.purchasePrice);
    const rent = Number(form.monthlyRent);
    const hg = Number(form.housegeld) || 0;
    if (!price || !rent) return null;
    const grossYield = ((rent * 12) / price * 100).toFixed(2);
    const factor = (price / (rent * 12)).toFixed(1);
    const netRent = rent - hg;
    const pricePerSqm = form.areaSqm ? Math.round(price / Number(form.areaSqm)) : null;
    return { grossYield, factor, netRent, pricePerSqm };
  }, [form.purchasePrice, form.monthlyRent, form.housegeld, form.areaSqm]);

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

  return (
    <div className="space-y-6">
      {/* ─── Horizontal Stepper ─── */}
      <div className="card px-6 py-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => { if (s.num < step) setStep(s.num); }}
                className={`flex items-center gap-2.5 transition-all ${
                  s.num < step ? "cursor-pointer" : s.num === step ? "" : "opacity-40"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.num === step
                      ? "accent-gradient text-white shadow-sm"
                      : s.num < step
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-[var(--border-light)] text-[var(--muted)]"
                  }`}
                >
                  {s.num < step ? "\u2713" : s.num}
                </span>
                <span className={`text-sm font-semibold hidden sm:inline ${
                  s.num === step ? "text-[var(--fg)]" : "text-[var(--muted)]"
                }`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`stepper-connector mx-4 ${
                  s.num < step ? "bg-emerald-300" : "bg-[var(--border)]"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Step 1: Two columns with live preview ─── */}
      {step === 1 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 space-y-5">
            <div>
              <h2 className="section-title">Objektdaten</h2>
              <p className="section-subtitle mt-0.5">Finanzielle Eckdaten und Lageangaben.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Stra\u00DFe" value={form.street} onChange={(v) => set("street", v)} placeholder="Berliner Str. 42" />
              <Field label="Stadt" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Kaufpreis" value={form.purchasePrice} onChange={(v) => set("purchasePrice", v)} placeholder="250000" type="number" prefix="\u20AC" help="Gesamtangebotspreis inkl. ggf. ausgewiesener Nebenkosten." />
              <Field label="Monatliche Kaltmiete" value={form.monthlyRent} onChange={(v) => set("monthlyRent", v)} placeholder="950" type="number" prefix="\u20AC" help="Nettokaltmiete ohne Nebenkosten." />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Hausgeld" value={form.housegeld} onChange={(v) => set("housegeld", v)} placeholder="350" type="number" prefix="\u20AC" help="Monatliches Hausgeld (Verwaltung + Instandhaltungsr\u00FCcklage)." />
              <Field label="Wohnfl\u00E4che" value={form.areaSqm} onChange={(v) => set("areaSqm", v)} placeholder="72" type="number" suffix="m\u00B2" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Baujahr" value={form.baujahr} onChange={(v) => set("baujahr", v)} placeholder="1985" type="number" />
              <SelectField label="Energieklasse" value={form.energyClass} onChange={(v) => set("energyClass", v)} options={ENERGY_CLASSES} placeholder="Ausw\u00E4hlen" />
              <SelectField label="Lageklasse" value={form.locationGrade} onChange={(v) => set("locationGrade", v)} options={LOCATION_GRADES} placeholder="Ausw\u00E4hlen" help="A = Top-Lage, D = Entwicklungslage." />
            </div>

            <Field label="Expos\u00E9-Bild-URL (optional)" value={form.exposeImageUrl} onChange={(v) => set("exposeImageUrl", v)} placeholder="https://example.com/photo.jpg" />

            <button
              disabled={!canProceed1()}
              onClick={handleNext}
              className="w-full rounded-xl accent-gradient px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Weiter zu Sanierung \u2192
            </button>
          </div>

          {/* Live Preview sidebar */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="kpi-label">Live-Vorschau</h3>
              {liveMetrics ? (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <p className="kpi-value">{liveMetrics.grossYield}%</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Bruttorendite</p>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="grid grid-cols-2 gap-3">
                    <MiniKPI label="Faktor" value={`${liveMetrics.factor}x`} />
                    <MiniKPI label="Nettomiete" value={`\u20AC${Math.round(liveMetrics.netRent)}`} />
                    {liveMetrics.pricePerSqm && (
                      <MiniKPI label="\u20AC/m\u00B2" value={`\u20AC${liveMetrics.pricePerSqm.toLocaleString()}`} />
                    )}
                    {form.baujahr && (
                      <MiniKPI label="Alter" value={`${new Date().getFullYear() - Number(form.baujahr)} J.`} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--muted-light)] text-sm">Geben Sie Kaufpreis und Miete ein</p>
                </div>
              )}
            </div>

            {form.street && (
              <div className="animate-fade-up">
                <PropertyCard
                  street={form.street || "Stra\u00DFe"}
                  city={form.city || "Stadt"}
                  price={form.purchasePrice ? `\u20AC${Number(form.purchasePrice).toLocaleString()}` : "\u20AC\u2013"}
                  score={0}
                  trend="stable"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Step 2: Renovations with summary sidebar ─── */}
      {step === 2 && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 space-y-5">
            <div>
              <h2 className="section-title">Sanierungsbedarf</h2>
              <p className="section-subtitle mt-0.5">Markieren Sie Gewerke mit Sanierungsbedarf.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {RENOVATION_ITEMS.map(({ key, label, help }) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    form.renovations[key]
                      ? "border-amber-300 bg-[var(--warning-light)]"
                      : "border-[var(--border)] hover:border-[var(--accent-subtle)] hover:bg-[var(--accent-light)]"
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
                className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--border-light)]"
              >
                \u2190 Zur\u00FCck
              </button>
              <button
                onClick={handleNext}
                className="flex-1 rounded-xl accent-gradient px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                Score berechnen \u2192
              </button>
            </div>
          </div>

          <div className="card p-5 h-fit">
            <h3 className="kpi-label mb-3">Sanierungsstatus</h3>
            <div className="space-y-2">
              {RENOVATION_ITEMS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className={`badge ${form.renovations[key] ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {form.renovations[key] ? "Bedarf" : "OK"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Gesamt</span>
                <span className="font-bold">{Object.values(form.renovations).filter(Boolean).length}/6</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3: Dashboard Results ─── */}
      {step === 3 && result && scoring && (
        <div className="space-y-6 animate-fade-up">

          {/* Row 1: Large central Donut + 4 KPI Cards */}
          <div className="grid lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 card p-6 flex flex-col items-center justify-center">
              <DonutChart
                data={Object.values(scoring.subscores).map((sub, i) => ({
                  name: sub.label,
                  value: Math.round(sub.value * sub.weight * 100),
                  color: SUBSCORE_COLORS[i],
                }))}
                innerValue={String(scoring.totalScore)}
                innerLabel="Gesamtscore"
              />
              <ConfidenceBadge level={scoring.confidenceLevel} />
            </div>

            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              <KPICard label="Bruttorendite" value={`${(scoring.comparisonMetrics.yield * 100).toFixed(1)}%`} sub={`Faktor ${scoring.comparisonMetrics.factor.toFixed(1)}x`} color="text-[var(--accent)]" />
              <KPICard label="Risiko-Score" value={`${scoring.subscores.riskScore.value}`} sub={scoring.subscores.riskScore.value >= 65 ? "Geringes Risiko" : "Erh\u00F6htes Risiko"} color={scoring.subscores.riskScore.value >= 65 ? "text-emerald-600" : "text-amber-600"} />
              <KPICard label="Finanzierbarkeit" value={`${scoring.subscores.bankabilityScore.value}`} sub={scoring.subscores.bankabilityScore.value >= 65 ? "Bankf\u00E4hig" : "Einschr\u00E4nkungen"} color={scoring.subscores.bankabilityScore.value >= 65 ? "text-emerald-600" : "text-amber-600"} />
              <KPICard label="Energieeffizienz" value={result.energyClass} sub={`Rang ${scoring.comparisonMetrics.energyRank}/100`} color="text-[var(--chart-3)]" />
            </div>
          </div>

          {/* Row 2: Subscore bar chart */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Teilscores im \u00DCberblick</h3>
            <BarChartComponent
              data={Object.values(scoring.subscores).map((sub) => ({
                name: sub.label.replace("-Score", "").replace("Investitions", "Invest.").replace("Vermietbarkeits", "Vermiet.").replace("Finanzierungs", "Finanz.").replace("Zukunfts", "Zukunft"),
                value: sub.value,
              }))}
            />
          </div>

          {/* Row 3: 3 Cards — Strengths | Risks | Recommendations */}
          <div className="grid lg:grid-cols-3 gap-5">
            <ListCard title="St\u00E4rken" items={scoring.strengths} accent="emerald" />
            <ListCard title="Risiken" items={scoring.risks} accent="amber" />
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-bold">Handlungsempfehlungen</h3>
              <div className="space-y-3">
                <RecoSection tag="Finanzierung" items={scoring.recommendations.financing} />
                <RecoSection tag="Technik" items={scoring.recommendations.technical} />
                <RecoSection tag="Recht" items={scoring.recommendations.legal} />
                <RecoSection tag="Strategie" items={scoring.recommendations.strategy} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setResult(null); setScoring(null); }}
              className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold transition-all hover:bg-[var(--border-light)]"
            >
              \u2190 Neue Analyse
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl accent-gradient px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Im Portfolio speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper components ─── */

function Field({
  label, value, onChange, placeholder, type = "text", prefix, suffix, help,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; prefix?: string; suffix?: string; help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-[var(--muted)]">
        {label}
        {help && <InlineHelp text={help} />}
      </label>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted)] text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[var(--accent)] ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--muted)] text-sm">{suffix}</span>}
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
      <label className="flex items-center gap-1 text-sm font-medium text-[var(--muted)]">
        {label}
        {help && <InlineHelp text={help} />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[var(--accent)] appearance-none"
      >
        <option value="">{placeholder || "Ausw\u00E4hlen\u2026"}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card p-5">
      <p className="kpi-label">{label}</p>
      <p className={`text-3xl font-extrabold tracking-tight mt-1.5 ${color}`}>{value}</p>
      <p className="text-xs text-[var(--muted)] mt-1">{sub}</p>
    </div>
  );
}

function ListCard({ title, items, accent }: { title: string; items: string[]; accent: "emerald" | "amber" }) {
  const dot = accent === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[var(--muted)] leading-relaxed">
            <span className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${dot}`} />
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
  const labels = { high: "Hohe Sicherheit", medium: "Mittlere Sicherheit", low: "Geringe Sicherheit" };
  return (
    <span className={`mt-3 badge ring-1 ${styles[level]}`}>{labels[level]}</span>
  );
}

function RecoSection({ tag, items }: { tag: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">{tag}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-[var(--muted)] leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
}
