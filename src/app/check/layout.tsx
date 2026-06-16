import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";

/* Server-Layout nur für die Metadaten — die Seite selbst ist eine
   Client-Component (Mikrofon/Recorder) und kann daher kein `metadata` exportieren. */
export const metadata = pageMeta({
  title: "Sprach-Check: Immobilie einsprechen, sofort Urteil",
  description:
    "Sprich die Eckdaten einer Wohnung ein — ImmoScorer liefert in Sekunden Score, klare Kauf-Entscheidung (Kaufen / Verhandeln / Finger weg) und ein fertiges Verhandlungs-Skript. Kostenlos, ohne Account.",
  path: "/check",
});

export default function CheckLayout({ children }: { children: ReactNode }) {
  return children;
}
