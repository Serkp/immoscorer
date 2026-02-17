"use client";

import { useState } from "react";

interface InlineHelpProps {
  text: string;
}

export function InlineHelp({ text }: InlineHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-[10px] font-bold text-[var(--muted)] hover:bg-slate-200 transition-colors"
        aria-label="Help"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-[var(--fg)] text-white text-xs leading-relaxed w-56 shadow-lg z-50 pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[var(--fg)]" />
        </div>
      )}
    </span>
  );
}
