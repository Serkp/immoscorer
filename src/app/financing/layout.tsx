import type { ReactNode } from "react";
import type { Metadata } from "next";

/* /financing ist eine Alt-/Tool-Route (Client-Component, leitet auf /analysis
   um). Nicht als eigenständige Suchergebnis-Seite gedacht -> serverseitig noindex,
   damit sie bei einer Entdeckung durch Google nicht als Dünn-/Duplikat-Seite
   indexiert wird. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function FinancingLayout({ children }: { children: ReactNode }) {
  return children;
}
