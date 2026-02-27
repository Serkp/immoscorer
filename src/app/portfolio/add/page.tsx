"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PillSelect } from "@/components/ui/PillSelect";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import type { PlaceResult } from "@/components/AddressAutocomplete";
import { useAuth } from "@/components/auth/AuthProvider";
import { savePortfolioProperty } from "@/lib/db";
import { estimateMarketValue } from "@/lib/portfolio-utils";
import { findCityData } from "@/data/german-cities";
import { C } from "@/lib/theme";

const ENERGY_OPTIONS = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"] as const;
const PROPERTY_TYPES = [
  { value: "etw", label: "ETW" },
  { value: "efh", label: "EFH" },
  { value: "mfh", label: "MFH" },
  { value: "dhh", label: "DHH" },
] as const;

interface PortfolioForm {
  // Step 1 — Basisdaten
  street: string;
  city: string;
  lat: number | null;
  lng: number | null;
  propertyType: string;
  rooms: string;
  area: string;
  buildYear: string;
  energyClass: string;
  purchaseMonth: string;
  purchaseYear: string;
  purchasePrice: string;
  // Step 2 — Finanzierung
  loanAmount: string;
  interestRate: string;
  fixedRateMonth: string;
  fixedRateYear: string;
  monthlyPayment: string;
  repaymentRate: string;
  specialRepaymentAllowed: boolean;
  specialRepaymentAmount: string;
  // Step 3 — Mieteinnahmen
  isRented: string; // "ja" | "nein" | "selbst"
  monthlyRent: string;
  hausgeld: string;
  rentalSince: string;
  unitCount: string;
  totalRent: string;
  unitsRented: string;
}

const INIT: PortfolioForm = {
  street: "", city: "", lat: null, lng: null,
  propertyType: "etw", rooms: "", area: "", buildYear: "", energyClass: "C",
  purchaseMonth: "", purchaseYear: "", purchasePrice: "",
  loanAmount: "", interestRate: "", fixedRateMonth: "", fixedRateYear: "",
  monthlyPayment: "", repaymentRate: "", specialRepaymentAllowed: false, specialRepaymentAmount: "",
  isRented: "ja", monthlyRent: "", hausgeld: "", rentalSince: "",
  unitCount: "", totalRent: "", unitsRented: "",
};

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];

export default function PortfolioAddPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PortfolioForm>(INIT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upd(patch: Partial<PortfolioForm>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function handleAddressSelect(place: PlaceResult) {
    upd({ street: place.street || place.formattedAddress, city: place.city, lat: place.lat, lng: place.lng });
  }

  function canNext(): boolean {
    if (step === 0) return !!form.street && !!form.area && !!form.purchasePrice;
    if (step === 1) return true; // financing is optional
    return true;
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const area = Number(form.area) || 0;
      const buildYear = Number(form.buildYear) || 2000;
      const purchasePrice = Number(form.purchasePrice) || 0;
      const rent = Number(form.monthlyRent) || Number(form.totalRent) || 0;
      const cityData = findCityData(form.city);

      const marketValue = estimateMarketValue({
        city: form.city,
        area,
        buildYear,
        energyClass: form.energyClass,
        locationGrade: cityData?.tier || "B",
      });

      const purchaseDate = form.purchaseMonth && form.purchaseYear
        ? `${form.purchaseMonth}/${form.purchaseYear}` : "";
      const fixedRateUntil = form.fixedRateMonth && form.fixedRateYear
        ? `${form.fixedRateMonth}/${form.fixedRateYear}` : "";

      await savePortfolioProperty(user.id, {
        address: form.street,
        city: form.city,
        purchasePrice,
        currentRent: rent,
        area,
        buildYear,
        energyClass: form.energyClass,
        houseMoney: Number(form.hausgeld) || undefined,
        locationGrade: cityData?.tier || undefined,
        lat: form.lat || undefined,
        lng: form.lng || undefined,
        propertyType: form.propertyType,
        rooms: Number(form.rooms) || undefined,
        purchaseDate,
        loanAmount: Number(form.loanAmount) || undefined,
        interestRate: Number(form.interestRate) || undefined,
        fixedRateUntil: fixedRateUntil || undefined,
        monthlyPayment: Number(form.monthlyPayment) || undefined,
        repaymentRate: Number(form.repaymentRate) || undefined,
        specialRepaymentAllowed: form.specialRepaymentAllowed,
        specialRepaymentAmount: Number(form.specialRepaymentAmount) || undefined,
        isRented: form.isRented,
        monthlyRent: Number(form.monthlyRent) || undefined,
        rentalSince: form.rentalSince || undefined,
        unitCount: Number(form.unitCount) || undefined,
        totalRent: Number(form.totalRent) || undefined,
        unitsRented: Number(form.unitsRented) || undefined,
        estimatedMarketValue: marketValue,
      });

      router.push("/portfolio");
    } catch (err) {
      console.error("[PortfolioAdd] save error:", err);
      setError("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[580px] space-y-6 animate-fade-up">
      <Link href="/portfolio" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Zurück zum Portfolio
      </Link>

      <div className="flex items-center gap-3">
        <AIOrb size={32} active />
        <h1 className="text-lg font-bold" style={{ color: C.text }}>Immobilie hinzufügen</h1>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.surface3 }}>
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: step > i ? "100%" : step === i ? "50%" : "0%",
              background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
            }} />
          </div>
        ))}
      </div>

      <p className="text-[11px] font-medium" style={{ color: C.dim }}>
        Schritt {step + 1} von 3 — {step === 0 ? "Basisdaten" : step === 1 ? "Finanzierung" : "Mieteinnahmen"}
      </p>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
          {error}
        </div>
      )}

      {/* ── Step 0: Basisdaten ── */}
      {step === 0 && (
        <div className="space-y-4">
          <AddressAutocomplete onSelect={handleAddressSelect} defaultValue={form.street ? `${form.street}, ${form.city}` : ""} />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: C.sub }}>Objektart</label>
            <div className="flex gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <button key={pt.value} type="button" onClick={() => upd({ propertyType: pt.value })}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: form.propertyType === pt.value ? C.accentMid : C.surface,
                    border: `1px solid ${form.propertyType === pt.value ? C.accent : C.border}`,
                    color: form.propertyType === pt.value ? C.accent : C.sub,
                  }}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Zimmer" value={form.rooms} onChange={(v) => upd({ rooms: v })} placeholder="3" type="number" />
            <Input label="Wohnfläche" value={form.area} onChange={(v) => upd({ area: v })} placeholder="80" suffix="m²" type="number" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Baujahr" value={form.buildYear} onChange={(v) => upd({ buildYear: v })} placeholder="1995" type="number" />
            <PillSelect label="Energieklasse" options={ENERGY_OPTIONS} value={form.energyClass} onChange={(v) => upd({ energyClass: v })} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: C.sub }}>Kaufdatum</label>
            <div className="flex gap-2">
              <select value={form.purchaseMonth} onChange={(e) => upd({ purchaseMonth: e.target.value })}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: form.purchaseMonth ? C.text : C.dim }}>
                <option value="">Monat</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" value={form.purchaseYear} onChange={(e) => upd({ purchaseYear: e.target.value })}
                placeholder="Jahr" className="flex-1 rounded-xl px-3 py-2.5 text-sm" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
            </div>
          </div>

          <Input label="Kaufpreis damals" value={form.purchasePrice} onChange={(v) => upd({ purchasePrice: v })} placeholder="180.000" suffix="€" type="number" large />
        </div>
      )}

      {/* ── Step 1: Finanzierung ── */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-4 space-y-1">
            <p className="text-xs font-semibold" style={{ color: C.sub }}>Finanzierungsdaten sind optional</p>
            <p className="text-[11px]" style={{ color: C.dim }}>Wenn vorhanden, erhalten Sie Zinsbindungs-Warnungen und Cashflow-Berechnungen.</p>
          </Card>

          <Input label="Aktueller Darlehensbetrag" value={form.loanAmount} onChange={(v) => upd({ loanAmount: v })} placeholder="140.000" suffix="€" type="number" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Zinssatz" value={form.interestRate} onChange={(v) => upd({ interestRate: v })} placeholder="1.8" suffix="%" type="number" />
            <Input label="Monatliche Rate" value={form.monthlyPayment} onChange={(v) => upd({ monthlyPayment: v })} placeholder="580" suffix="€" type="number" />
          </div>

          <Input label="Tilgungsrate" value={form.repaymentRate} onChange={(v) => upd({ repaymentRate: v })} placeholder="2.0" suffix="%" type="number" />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: C.sub }}>Zinsbindung bis</label>
            <div className="flex gap-2">
              <select value={form.fixedRateMonth} onChange={(e) => upd({ fixedRateMonth: e.target.value })}
                className="flex-1 rounded-xl px-3 py-2.5 text-sm" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: form.fixedRateMonth ? C.text : C.dim }}>
                <option value="">Monat</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" value={form.fixedRateYear} onChange={(e) => upd({ fixedRateYear: e.target.value })}
                placeholder="Jahr" className="flex-1 rounded-xl px-3 py-2.5 text-sm" style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium" style={{ color: C.sub }}>Sondertilgung möglich</label>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} type="button" onClick={() => upd({ specialRepaymentAllowed: v })}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: form.specialRepaymentAllowed === v ? C.accentMid : C.surface,
                    border: `1px solid ${form.specialRepaymentAllowed === v ? C.accent : C.border}`,
                    color: form.specialRepaymentAllowed === v ? C.accent : C.sub,
                  }}>
                  {v ? "Ja" : "Nein"}
                </button>
              ))}
            </div>
          </div>

          {form.specialRepaymentAllowed && (
            <Input label="Sondertilgung pro Jahr" value={form.specialRepaymentAmount} onChange={(v) => upd({ specialRepaymentAmount: v })} placeholder="5.000" suffix="€" type="number" />
          )}
        </div>
      )}

      {/* ── Step 2: Mieteinnahmen ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium" style={{ color: C.sub }}>Aktuell vermietet?</label>
            <div className="flex gap-2">
              {([["ja", "Ja"], ["nein", "Nein"], ["selbst", "Selbstgenutzt"]] as const).map(([val, label]) => (
                <button key={val} type="button" onClick={() => upd({ isRented: val })}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: form.isRented === val ? C.accentMid : C.surface,
                    border: `1px solid ${form.isRented === val ? C.accent : C.border}`,
                    color: form.isRented === val ? C.accent : C.sub,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.isRented === "ja" && (
            <>
              {form.propertyType === "mfh" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Anzahl Einheiten" value={form.unitCount} onChange={(v) => upd({ unitCount: v })} placeholder="6" type="number" />
                    <Input label="Davon vermietet" value={form.unitsRented} onChange={(v) => upd({ unitsRented: v })} placeholder="5" type="number" />
                  </div>
                  <Input label="Gesamtmiete" value={form.totalRent} onChange={(v) => upd({ totalRent: v })} placeholder="3.200" suffix="€/Mon." type="number" />
                </>
              ) : (
                <Input label="Aktuelle Kaltmiete" value={form.monthlyRent} onChange={(v) => upd({ monthlyRent: v })} placeholder="510" suffix="€/Mon." type="number" />
              )}
              <Input label="Hausgeld / NK" value={form.hausgeld} onChange={(v) => upd({ hausgeld: v })} placeholder="250" suffix="€/Mon." type="number" />
              <Input label="Mietvertrag seit" value={form.rentalSince} onChange={(v) => upd({ rentalSince: v })} placeholder="2019" type="number" />
            </>
          )}

          {form.isRented === "nein" && (
            <Card className="p-4">
              <p className="text-xs" style={{ color: C.sub }}>Leerstehend — keine Mieteinnahmen. Cashflow-Berechnungen basieren nur auf Kreditrate.</p>
            </Card>
          )}

          {form.isRented === "selbst" && (
            <>
              <Input label="Hausgeld / NK" value={form.hausgeld} onChange={(v) => upd({ hausgeld: v })} placeholder="350" suffix="€/Mon." type="number" />
              <Card className="p-4">
                <p className="text-xs" style={{ color: C.sub }}>Selbstgenutzt — keine Mieteinnahmen. Hausgeld fließt in die Kostenberechnung ein.</p>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{ border: `1px solid ${C.border}`, color: C.sub }}>
            Zurück
          </button>
        )}
        {step < 2 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
            className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
            Weiter
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving}
            className="flex-1 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`, color: "#fff" }}>
            {saving ? "Wird gespeichert..." : "Immobilie speichern"}
          </button>
        )}
      </div>
    </div>
  );
}
