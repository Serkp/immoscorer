import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { KNOWLEDGE_BASE } from "@/data/knowledge-base";

/* Dynamische Sitemap: öffentliche Marketing-Seiten + der komplette
   Wissens-Bereich (Kategorien und Artikel werden automatisch aus
   knowledge-base.ts erzeugt — neue Artikel landen ohne Mehraufwand drin). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/check"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/wissen"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const knowledgePages: MetadataRoute.Sitemap = KNOWLEDGE_BASE.flatMap(
    (category) => [
      {
        url: absoluteUrl(`/wissen/${category.slug}`),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      ...category.articles.map((article) => ({
        url: absoluteUrl(`/wissen/${category.slug}/${article.slug}`),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ],
  );

  return [...staticPages, ...knowledgePages];
}
