import type { ReactNode } from "react";
import type { Metadata } from "next";

/* /guide ist eine verwaiste Alt-Seite (nicht in der Sitemap, nicht verlinkt).
   Damit sie nicht versehentlich indexiert wird, falls Google sie doch entdeckt,
   wird sie serverseitig auf noindex gesetzt. */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  return children;
}
