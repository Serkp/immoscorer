"use client";

import { C } from "@/lib/theme";

interface PillSelectProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  explain?: string;
}

export function PillSelect({ label, options, value, onChange, explain }: PillSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium" style={{ color: C.sub }}>
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: active ? C.accentMid : C.surface,
                border: `1px solid ${active ? C.accent : C.border}`,
                color: active ? C.accent : C.sub,
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
      {explain && (
        <p className="text-xs leading-relaxed" style={{ color: C.dim }}>
          {explain}
        </p>
      )}
    </div>
  );
}
