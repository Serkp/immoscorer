import { AIOrb } from "./AIOrb";
import { C } from "@/lib/theme";
import type { ReactNode } from "react";

type Variant = "info" | "good" | "warn" | "bad";

interface AICommentProps {
  children: ReactNode;
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, { bg: string; border: string }> = {
  info: { bg: C.surface, border: C.border },
  good: { bg: C.greenDim, border: C.greenBorder },
  warn: { bg: C.amberDim, border: C.amberBorder },
  bad: { bg: C.redDim, border: "rgba(248,113,113,0.2)" },
};

export function AIComment({ children, variant = "info" }: AICommentProps) {
  const s = VARIANT_STYLES[variant];

  return (
    <div
      className="flex gap-3 rounded-xl p-4"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="shrink-0 mt-0.5">
        <AIOrb size={20} active />
      </div>
      <div className="text-sm leading-relaxed" style={{ color: C.sub }}>
        {children}
      </div>
    </div>
  );
}
