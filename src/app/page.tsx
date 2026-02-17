"use client";

import { useState } from "react";

const ENERGY_CLASSES = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"] as const;

export default function Dashboard() {
  const [form, setForm] = useState({
    purchasePrice: "",
    monthlyRent: "",
    housegeld: "",
    baujahr: "",
    energyClass: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: hook up scoring logic
    console.log("Submitted:", form);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* ─── Main area (2/3) ─── */}
      <section className="lg:w-2/3 space-y-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-white mb-1">
            Property Analysis
          </h2>
          <p className="text-sm text-[var(--muted)] mb-6">
            Enter the details of a property to calculate its investment score.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Purchase price */}
            <FormField label="Purchase Price" htmlFor="purchasePrice">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted)] text-sm">
                  &euro;
                </span>
                <input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  min={0}
                  placeholder="250000"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  className="input-field pl-8"
                />
              </div>
            </FormField>

            {/* Monthly rent */}
            <FormField label="Monthly Rent (Kaltmiete)" htmlFor="monthlyRent">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted)] text-sm">
                  &euro;
                </span>
                <input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  min={0}
                  placeholder="950"
                  value={form.monthlyRent}
                  onChange={handleChange}
                  className="input-field pl-8"
                />
              </div>
            </FormField>

            {/* Housegeld */}
            <FormField label="Hausgeld (monthly)" htmlFor="housegeld">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--muted)] text-sm">
                  &euro;
                </span>
                <input
                  id="housegeld"
                  name="housegeld"
                  type="number"
                  min={0}
                  placeholder="350"
                  value={form.housegeld}
                  onChange={handleChange}
                  className="input-field pl-8"
                />
              </div>
            </FormField>

            {/* Baujahr */}
            <FormField label="Baujahr (Year Built)" htmlFor="baujahr">
              <input
                id="baujahr"
                name="baujahr"
                type="number"
                min={1800}
                max={2026}
                placeholder="1985"
                value={form.baujahr}
                onChange={handleChange}
                className="input-field"
              />
            </FormField>

            {/* Energy class */}
            <FormField label="Energy Class" htmlFor="energyClass">
              <select
                id="energyClass"
                name="energyClass"
                value={form.energyClass}
                onChange={handleChange}
                className="input-field appearance-none"
              >
                <option value="">Select energy class</option>
                {ENERGY_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </FormField>

            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
            >
              Analyze Property
            </button>
          </form>
        </div>
      </section>

      {/* ─── Sidebar (1/3) ─── */}
      <aside className="lg:w-1/3 space-y-6">
        {/* Portfolio summary */}
        <SidebarCard title="Portfolio Summary">
          <StatRow label="Properties" value="--" />
          <StatRow label="Total Value" value="-- \u20AC" />
          <StatRow label="Avg. Yield" value="-- %" />
          <StatRow label="Monthly Cash-flow" value="-- \u20AC" />
        </SidebarCard>

        {/* Quick metrics */}
        <SidebarCard title="Quick Metrics">
          <StatRow label="Gross Yield" value="-- %" />
          <StatRow label="Price / m\u00B2" value="-- \u20AC" />
          <StatRow label="Rent Multiplier" value="--" />
        </SidebarCard>

        {/* Recent activity */}
        <SidebarCard title="Recent Activity">
          <p className="text-sm text-[var(--muted)]">
            No recent activity yet. Analyze a property to get started.
          </p>
        </SidebarCard>
      </aside>

      {/* Shared input styles */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field::placeholder {
          color: var(--muted);
        }
        .input-field:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }
      `}</style>
    </div>
  );
}

/* ─── Helper components ─── */

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[var(--muted)]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
