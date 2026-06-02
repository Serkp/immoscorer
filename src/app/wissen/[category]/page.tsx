import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/JsonLd";
import { C } from "@/lib/theme";
import { KNOWLEDGE_BASE, getCategoryBySlug } from "@/data/knowledge-base";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";

/* Statisch vorgerenderte Kategorie-Seiten; unbekannte Slugs → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return KNOWLEDGE_BASE.map((cat) => ({ category: cat.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};
  const title = `${cat.title} — Immobilien-Wissen`;
  return {
    title,
    description: cat.description,
    alternates: { canonical: `/wissen/${cat.slug}` },
    openGraph: {
      title: `${title} | ImmoScorer`,
      description: cat.description,
      url: absoluteUrl(`/wissen/${cat.slug}`),
      type: "website",
    },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const totalMinutes = cat.articles.reduce((s, a) => s + a.readMinutes, 0);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Start", path: "/" },
      { name: "Wissen", path: "/wissen" },
      { name: cat.title, path: `/wissen/${cat.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: cat.title,
      description: cat.description,
      url: absoluteUrl(`/wissen/${cat.slug}`),
      inLanguage: "de-DE",
      hasPart: cat.articles.map((a) => ({
        "@type": "Article",
        headline: a.title,
        description: a.summary,
        url: absoluteUrl(`/wissen/${cat.slug}/${a.slug}`),
      })),
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-xs"
        style={{ color: C.dim }}
        aria-label="Brotkrumen"
      >
        <Link href="/wissen" className="hover:opacity-80 transition-opacity">
          Wissen
        </Link>
        <span>/</span>
        <span style={{ color: C.sub }}>{cat.title}</span>
      </nav>

      {/* Header */}
      <header className="flex items-start gap-4">
        <span
          className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: cat.color + "18", color: cat.color }}
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={cat.icon} />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: C.text }}>
            {cat.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: C.sub }}>
            {cat.description}
          </p>
          <p className="text-xs mt-1" style={{ color: C.dim }}>
            {cat.articles.length} Artikel · {totalMinutes} Min. Gesamtlesezeit
          </p>
        </div>
      </header>

      {/* Articles */}
      <div className="space-y-3">
        {cat.articles.map((article, idx) => (
          <Link key={article.slug} href={`/wissen/${cat.slug}/${article.slug}`}>
            <Card className="p-5 group mb-3" hover>
              <div className="flex items-start gap-4">
                <span
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold"
                  style={{ background: cat.color + "18", color: cat.color }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-sm font-bold group-hover:underline"
                    style={{ color: C.text }}
                  >
                    {article.title}
                  </h2>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: C.sub }}>
                    {article.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {article.sections.map((s) => (
                      <span
                        key={s.heading}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          background: C.surface2,
                          color: C.dim,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {s.heading}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[11px]" style={{ color: C.dim }}>
                    {article.readMinutes} Min.
                  </span>
                  <svg
                    className="transition-transform group-hover:translate-x-0.5"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.dim}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Back to overview */}
      <div className="text-center pt-4">
        <Link
          href="/wissen"
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: C.accent }}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Alle Kategorien anzeigen
        </Link>
      </div>
    </div>
  );
}
