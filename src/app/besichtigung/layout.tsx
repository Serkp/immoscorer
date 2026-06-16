import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";

/* Server-Layout nur für die Metadaten — die Seite ist eine Client-Component
   (Mikrofon, Sprachausgabe) und kann selbst kein `metadata` exportieren. */
export const metadata = pageMeta({
  title: "Besichtigungs-Begleiter: KI führt dich durch die Wohnung",
  description:
    "Hands-free bei der Wohnungs-Besichtigung: Der KI-Besichtigungs-Begleiter stellt dir die richtigen Fragen, du sprichst einfach — danach bekommst du Red Flags, Sanierungs-Hinweise und konkrete Verhandlungs-Hebel. Kostenlos, ohne Account.",
  path: "/besichtigung",
});

export default function BesichtigungLayout({ children }: { children: ReactNode }) {
  return children;
}
