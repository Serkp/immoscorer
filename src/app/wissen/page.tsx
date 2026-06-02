import type { Metadata } from "next";
import { AIOrb } from "@/components/ui/AIOrb";
import { JsonLd } from "@/components/JsonLd";
import { KnowledgeIndex } from "@/components/wissen/KnowledgeIndex";
import { KNOWLEDGE_BASE } from "@/data/knowledge-base";
import { C } from "@/lib/theme";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

const DESCRIPTION =
  "Fundiertes Wissen für erfolgreiche Immobilien-Investments: Rendite berechnen, Finanzierung strukturieren, Steuern sparen, Lage bewerten und Strategien entwickeln — kompakt und verständlich erklärt.";

export const metadata: Metadata = {
  title: "Immobilien-Wissen: Ratgeber für Kapitalanleger",
  description: DESCRIPTION,
  alternates: { canonical: "/wissen" },
  openGraph: {
    title: "Immobilien-Wissen: Ratgeber für Kapitalanleger | ImmoScorer",
    description: DESCRIPTION,
    url: absoluteUrl("/wissen"),
    type: "website",
  },
};

/* Server-gerenderte, öffentliche Wissens-Übersicht. Der Inhalt liegt im
   initialen HTML (crawlbar); nur die Suche ist eine Client-Insel. */
export default function WissenPage() {
  const indexCategories = KNOWLEDGE_BASE.map((cat) => ({
    slug: cat.slug,
    title: cat.title,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    articles: cat.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      summary: a.summary,
      readMinutes: a.readMinutes,
    })),
  }));

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Start", path: "/" },
      { name: "Wissen", path: "/wissen" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ImmoScorer Wissensbereich",
      description: DESCRIPTION,
      url: absoluteUrl("/wissen"),
      inLanguage: "de-DE",
      hasPart: indexCategories.map((cat) => ({
        "@type": "WebPage",
        name: cat.title,
        url: absoluteUrl(`/wissen/${cat.slug}`),
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px]">
      <JsonLd data={jsonLd} />

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
          <AIOrb size={30} active />
          <span className="text-xs font-semibold" style={{ color: C.accent }}>
            Wissensbereich
          </span>
        </div>
        <h1
          className="text-2xl md:text-3xl font-extrabold leading-tight"
          style={{ color: C.text }}
        >
          Immobilien-Wissen für Kapitalanleger
        </h1>
        <p
          className="text-sm md:text-base mt-3"
          style={{ color: C.sub, maxWidth: 640, lineHeight: 1.7 }}
        >
          Von den Grundlagen der Renditeberechnung über Finanzierung und Steuern
          bis zu konkreten Investment-Strategien — alles, was Sie für fundierte
          Immobilien-Entscheidungen brauchen.
        </p>
      </header>

      <KnowledgeIndex categories={indexCategories} />
    </div>
  );
}
