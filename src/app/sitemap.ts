import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { KNOWLEDGE_BASE } from "@/data/knowledge-base";
import { CITIES } from "@/data/german-cities";
import { citySlug } from "@/lib/city-pages";

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
      url: absoluteUrl("/besichtigung"),
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
    {
      url: absoluteUrl("/kapitalanlage"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/rendite-rechner"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: absoluteUrl(`/kapitalanlage/${citySlug(c.city)}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

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

  return [...staticPages, ...knowledgePages, ...cityPages];
}
