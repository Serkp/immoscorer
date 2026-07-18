import type { ReactNode } from "react";
import type { Metadata } from "next";

/* /analysis ist das interaktive Analyse-Tool (Client-Component, kann daher kein
   `metadata` exportieren). Es soll NICHT in den Suchindex — die SEO-Landingpages
   sind /check und /besichtigung. Da /analysis aus der Navbar und allen Stadtseiten
   verlinkt ist, wird der Ausschluss über serverseitig gerendertes noindex gelöst
   (nicht über robots.txt-Disallow, das Google das noindex nicht sehen ließe). */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return children;
}
