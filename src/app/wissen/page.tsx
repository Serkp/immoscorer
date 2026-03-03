"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";
import { AIChat } from "@/components/AIChat";
import { KNOWLEDGE_BASE, getAllArticlesFlat } from "@/data/knowledge-base";

export default function WissenPage() {
  const [search, setSearch] = useState("");
  const allArticles = getAllArticlesFlat();

  const filtered = search.trim()
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.summary.toLowerCase().includes(search.toLowerCase()) ||
          a.category.title.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="mx-auto max-w-[1000px] space-y-10">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
        style={{ color: C.dim }}
      >
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <AIOrb size={28} active />
            <h1 className="text-xl font-bold" style={{ color: C.text }}>
              Wissensbereich
            </h1>
          </div>
          <p className="text-sm" style={{ color: C.sub }}>
            Fundiertes Wissen für erfolgreiche Immobilien-Investments – von
            Grundlagen bis Expertenwissen.
          </p>
        </div>

        {/* Search */}
        <div className="relative shrink-0 w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.dim}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Artikel suchen…"
            className="w-full rounded-xl py-2 pl-9 pr-3 text-sm outline-none transition-colors"
            style={{
              background: C.surface2,
              border: `1px solid ${C.border}`,
              color: C.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.accent;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.border;
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      {filtered !== null ? (
        <div className="space-y-3">
          <p className="text-xs font-medium" style={{ color: C.dim }}>
            {filtered.length} Ergebnis{filtered.length !== 1 ? "se" : ""} für
            &quot;{search}&quot;
          </p>
          {filtered.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm" style={{ color: C.sub }}>
                Keine Artikel gefunden. Versuchen Sie einen anderen Suchbegriff.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((a) => (
                <Link
                  key={`${a.category.slug}-${a.slug}`}
                  href={`/wissen/${a.category.slug}/${a.slug}`}
                >
                  <Card className="p-4 group" hover>
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{
                          background: a.category.color + "18",
                          color: a.category.color,
                        }}
                      >
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={a.category.icon} />
                        </svg>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold group-hover:underline"
                          style={{ color: C.text }}
                        >
                          {a.title}
                        </p>
                        <p
                          className="text-xs mt-0.5 line-clamp-1"
                          style={{ color: C.sub }}
                        >
                          {a.summary}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: C.dim }}>
                          {a.category.title} · {a.readMinutes} Min. Lesezeit
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Category Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {KNOWLEDGE_BASE.map((cat) => (
            <Link key={cat.slug} href={`/wissen/${cat.slug}`}>
              <Card className="p-5 h-full group" hover>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <span
                    className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl transition-transform group-hover:scale-105"
                    style={{
                      background: cat.color + "18",
                      color: cat.color,
                    }}
                  >
                    <svg
                      width={22}
                      height={22}
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

                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-sm font-bold group-hover:underline"
                      style={{ color: C.text }}
                    >
                      {cat.title}
                    </h2>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: C.sub }}
                    >
                      {cat.description}
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: C.dim }}>
                      {cat.articles.length} Artikel
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className="shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
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

                {/* Article previews */}
                <div
                  className="mt-4 pt-3 space-y-1.5"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  {cat.articles.map((a) => (
                    <div key={a.slug} className="flex items-center gap-2">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ background: cat.color }}
                      />
                      <span
                        className="text-xs truncate"
                        style={{ color: C.sub }}
                      >
                        {a.title}
                      </span>
                      <span
                        className="text-[10px] shrink-0 ml-auto"
                        style={{ color: C.dim }}
                      >
                        {a.readMinutes} Min.
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* KI-Berater */}
      <AIChat
        context={{ type: "general", data: null }}
        suggestedQuestions={[
          "Was ist eine gute Bruttorendite?",
          "Wie funktioniert die AfA bei Immobilien?",
          "Was sind Kaufnebenkosten und wie hoch sind sie?",
          "Immobilien-GmbH: Wann lohnt sie sich?",
        ]}
        title="KI-Wissensberater"
        subtitle="Stellen Sie Fragen zu Immobilien-Investment, Steuern, Recht und mehr."
      />

      {/* Stats */}
      <div
        className="flex flex-wrap justify-center gap-6 md:gap-8 py-6 rounded-xl"
        style={{ background: C.surface }}
      >
        <Stat value={KNOWLEDGE_BASE.length.toString()} label="Kategorien" />
        <Stat value={allArticles.length.toString()} label="Artikel" />
        <Stat
          value={allArticles.reduce((s, a) => s + a.readMinutes, 0).toString()}
          label="Min. Lesezeit"
        />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color: C.accent }}>
        {value}
      </p>
      <p className="text-[11px]" style={{ color: C.dim }}>
        {label}
      </p>
    </div>
  );
}
