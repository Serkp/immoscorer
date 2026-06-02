import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { AIComment } from "@/components/ui/AIComment";
import { JsonLd } from "@/components/JsonLd";
import { TableOfContents } from "@/components/wissen/TableOfContents";
import { C } from "@/lib/theme";
import {
  KNOWLEDGE_BASE,
  getArticle,
  type KnowledgeTable,
} from "@/data/knowledge-base";
import { articleJsonLd, breadcrumbJsonLd, pageMeta } from "@/lib/seo";

/* Statisch vorgerenderte Artikel; unbekannte Slugs → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return KNOWLEDGE_BASE.flatMap((cat) =>
    cat.articles.map((a) => ({ category: cat.slug, article: a.slug })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { category: string; article: string };
}): Metadata {
  const result = getArticle(params.category, params.article);
  if (!result) return {};
  const { category, article } = result;
  return pageMeta({
    title: article.seoTitle ?? article.title,
    description: article.metaDescription ?? article.summary,
    path: `/wissen/${category.slug}/${article.slug}`,
    type: "article",
  });
}

/* Rendert einen Body-Absatz mit **fett**-Markierungen. */
function renderParagraph(paragraph: string, key: number) {
  const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p
      key={key}
      className="text-sm whitespace-pre-line"
      style={{ color: C.sub, lineHeight: 1.7 }}
    >
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} style={{ color: C.text, fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/* Rendert eine Tabelle (z. B. Rechenbeispiel) innerhalb eines Abschnitts. */
function TableBlock({ table, color }: { table: KnowledgeTable; color: string }) {
  return (
    <figure className="mt-4 -mx-1 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="text-left text-xs font-bold px-3 py-2"
                style={{
                  color: C.text,
                  background: color + "14",
                  borderBottom: `1px solid ${color}55`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 text-xs"
                  style={{
                    color: ci === 0 ? C.text : C.sub,
                    fontWeight: ci === 0 ? 600 : 400,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.caption && (
        <figcaption className="text-[11px] mt-2" style={{ color: C.dim }}>
          {table.caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function ArticlePage({
  params,
}: {
  params: { category: string; article: string };
}) {
  const result = getArticle(params.category, params.article);
  if (!result) notFound();

  const { category, article } = result;
  const path = `/wissen/${category.slug}/${article.slug}`;

  const artIdx = category.articles.findIndex((a) => a.slug === params.article);
  const prev = artIdx > 0 ? category.articles[artIdx - 1] : null;
  const next =
    artIdx < category.articles.length - 1
      ? category.articles[artIdx + 1]
      : null;
  const similar = category.articles
    .filter((a) => a.slug !== params.article)
    .slice(0, 3);

  const jsonLd = [
    articleJsonLd({
      title: article.title,
      description: article.metaDescription ?? article.summary,
      path,
      section: category.title,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: "Start", path: "/" },
      { name: "Wissen", path: "/wissen" },
      { name: category.title, path: `/wissen/${category.slug}` },
      { name: article.title, path },
    ]),
    ...(article.faq && article.faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          },
        ]
      : []),
  ];

  return (
    <article className="mx-auto max-w-[720px] space-y-8">
      <JsonLd data={jsonLd} />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-xs flex-wrap"
        style={{ color: C.dim }}
        aria-label="Brotkrumen"
      >
        <Link href="/wissen" className="hover:opacity-80 transition-opacity">
          Wissen
        </Link>
        <span>/</span>
        <Link
          href={`/wissen/${category.slug}`}
          className="hover:opacity-80 transition-opacity"
        >
          {category.title}
        </Link>
        <span>/</span>
        <span style={{ color: C.sub }} className="truncate">
          {article.title}
        </span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-3">
          <span
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: category.color + "18", color: category.color }}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={category.icon} />
            </svg>
          </span>
          <Link
            href={`/wissen/${category.slug}`}
            className="text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: C.dim }}
          >
            {category.title}
          </Link>
        </div>
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: C.text }}>
          {article.title}
        </h1>
        <p className="text-sm mt-2" style={{ color: C.sub, lineHeight: 1.7 }}>
          {article.summary}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[11px]" style={{ color: C.dim }}>
            {article.readMinutes} Min. Lesezeit
          </span>
          <span className="text-[11px]" style={{ color: C.dim }}>
            · {article.sections.length} Abschnitte
          </span>
        </div>
      </header>

      {/* Table of Contents (client island) */}
      <TableOfContents sections={article.sections} color={category.color} />

      {/* Sections */}
      <div className="space-y-8">
        {article.sections.map((section, idx) => (
          <section key={idx} id={`section-${idx}`}>
            <Card className="p-6">
              <h2 className="text-base font-bold mb-3" style={{ color: C.text }}>
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold mr-2 align-middle"
                  style={{
                    background: category.color + "18",
                    color: category.color,
                  }}
                >
                  {idx + 1}
                </span>
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.body.split("\n\n").map((p, pIdx) => renderParagraph(p, pIdx))}
              </div>
              {section.table && (
                <TableBlock table={section.table} color={category.color} />
              )}
            </Card>
          </section>
        ))}
      </div>

      {/* Tip */}
      {article.tip && (
        <AIComment variant="good">
          <p className="text-xs font-semibold mb-1" style={{ color: C.green }}>
            Praxis-Tipp
          </p>
          <p className="text-xs" style={{ lineHeight: 1.7 }}>
            {article.tip}
          </p>
        </AIComment>
      )}

      {/* FAQ */}
      {article.faq && article.faq.length > 0 && (
        <section>
          <h2 className="text-base font-bold mb-4" style={{ color: C.text }}>
            Häufige Fragen
          </h2>
          <div className="space-y-3">
            {article.faq.map((f, i) => (
              <Card key={i} className="p-5">
                <h3 className="text-sm font-bold mb-2" style={{ color: C.text }}>
                  {f.question}
                </h3>
                <p className="text-sm" style={{ color: C.sub, lineHeight: 1.7 }}>
                  {f.answer}
                </p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <Card
        className="p-6 text-center"
        style={{
          background: `linear-gradient(135deg, ${C.accentDim}, ${C.surface2})`,
          border: `1px solid ${C.accentMid}`,
        }}
      >
        <p className="text-sm font-bold mb-1" style={{ color: C.text }}>
          Bereit für die Praxis?
        </p>
        <p className="text-xs mb-4" style={{ color: C.sub }}>
          Bewerten Sie jetzt eine konkrete Immobilie — kostenlos, mit KI-Score
          und Finanzierungs-Check.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
            color: "#fff",
          }}
        >
          Jetzt kostenlos analysieren →
        </Link>
      </Card>

      {/* Similar articles */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3" style={{ color: C.text }}>
            Ähnliche Artikel
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {similar.map((a) => (
              <Link key={a.slug} href={`/wissen/${category.slug}/${a.slug}`}>
                <Card className="p-3 h-full group" hover>
                  <p
                    className="text-xs font-semibold group-hover:underline line-clamp-2"
                    style={{ color: C.text }}
                  >
                    {a.title}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: C.dim }}>
                    {a.readMinutes} Min.
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Prev / Next */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {prev ? (
          <Link href={`/wissen/${category.slug}/${prev.slug}`}>
            <Card className="p-4 h-full group" hover>
              <p className="text-[10px] mb-1" style={{ color: C.dim }}>
                ← Vorheriger Artikel
              </p>
              <p
                className="text-xs font-semibold group-hover:underline"
                style={{ color: C.text }}
              >
                {prev.title}
              </p>
            </Card>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link href={`/wissen/${category.slug}/${next.slug}`}>
            <Card className="p-4 h-full group text-right" hover>
              <p className="text-[10px] mb-1" style={{ color: C.dim }}>
                Nächster Artikel →
              </p>
              <p
                className="text-xs font-semibold group-hover:underline"
                style={{ color: C.text }}
              >
                {next.title}
              </p>
            </Card>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Back to category */}
      <div className="text-center pb-4">
        <Link
          href={`/wissen/${category.slug}`}
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
          Zurück zu {category.title}
        </Link>
      </div>
    </article>
  );
}
