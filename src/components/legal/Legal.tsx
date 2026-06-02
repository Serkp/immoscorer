import type { ReactNode } from "react";
import { C } from "@/lib/theme";

/* Geteilte, einheitlich gestylte Bausteine für die Rechtstexte. */

export function LegalH1({ children }: { children: ReactNode }) {
  return (
    <h1
      className="text-2xl md:text-3xl font-extrabold mb-6"
      style={{ color: C.text }}
    >
      {children}
    </h1>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: C.text }}>
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm mb-3" style={{ color: C.sub, lineHeight: 1.75 }}>
      {children}
    </p>
  );
}

export function LegalUL({ children }: { children: ReactNode }) {
  return (
    <ul
      className="text-sm mb-3 pl-5 space-y-1 list-disc"
      style={{ color: C.sub, lineHeight: 1.75 }}
    >
      {children}
    </ul>
  );
}

/* Gelber Platzhalter-Hinweis für noch auszufüllende / anwaltlich zu prüfende Stellen. */
export function LegalNote({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-6 text-xs"
      style={{
        background: C.amberDim,
        border: `1px solid ${C.amberBorder}`,
        color: C.amber,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

/* Inline-Platzhalter, z. B. [Straße Hausnr.] — visuell hervorgehoben. */
export function PH({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        color: C.amber,
        background: C.amberDim,
        padding: "0 4px",
        borderRadius: 4,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
