"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

/* Aufklappbares Inhaltsverzeichnis (Client-Insel — Anker-Links auf die
   server-gerenderten Abschnitte des Artikels). */
export function TableOfContents({
  sections,
  color,
}: {
  sections: { heading: string }[];
  color: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        style={{ background: open ? C.surface : "transparent" }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-xs font-bold" style={{ color: C.text }}>
          Inhaltsverzeichnis
        </span>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.dim}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1.5">
          <div className="h-px mb-2" style={{ background: C.border }} />
          {sections.map((s, idx) => (
            <a
              key={idx}
              href={`#section-${idx}`}
              className="flex items-center gap-2.5 py-1 text-xs transition-colors hover:underline"
              style={{ color: C.sub }}
            >
              <span
                className="w-5 h-5 shrink-0 flex items-center justify-center rounded text-[9px] font-bold"
                style={{ background: color + "18", color }}
              >
                {idx + 1}
              </span>
              {s.heading}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
