# ImmoScorer — Projektkontext für Claude

> Diese Datei gibt Claude (lokal **und** in Cloud-Routinen / GitHub Actions) den
> nötigen Kontext. Cloud-Agenten sehen **nur**, was im Repo liegt — also hier.

## Was ist ImmoScorer?
Web-App, in der eingeloggte Nutzer eine Anlageimmobilie bewerten lassen: ein
**Score** (0–100) aus Rendite, Risiko, Finanzierbarkeit, Lage, Energie, plus
**Finanzierungs-Score** und Verhandlungs-Tipps. Funktionen: Analyse, **Vergleichen**,
**Portfolio**, **Strategie** (Fragebogen → PDF), **KI-Berater**, **Wissens-Bereich**
(öffentlich, SEO). Ziel: Deutschlands bestes Tool dieser Art; perspektivisch unter
einer KI-Firma des Inhabers. Sprache durchgehend **Deutsch** (Tonalität: „Sie").

## Stack
- **Next.js 14** (App Router, TypeScript) · **Tailwind**
- **Supabase**: Auth (E-Mail/Passwort + Bestätigung + Reset), Postgres + RLS
- **Stripe**: Abo (Free + Pro 9,99 €/Monat)
- **Anthropic + OpenAI**: KI-Funktionen · **jsPDF** · **recharts** · Google Places

## Deployment & Hosting
- **Vercel** deployt automatisch. **Produktions-Branch: `claude/nextjs-saas-dashboard-3Jump`** (de-facto `main`; Push darauf = Produktion).
- **Live-Host: `https://www.immoscorer.de`** (Apex `immoscorer.de` → 308 → www).
- Secrets ausschließlich in **Vercel-Env** (nie im Repo). Lokaler Build braucht eine gitignorierte `.env.local` mit Dummy-Werten (Stripe wird sonst beim Build instanziiert).
- `gh` ist evtl. nicht eingeloggt; `git push` läuft über den macOS-Schlüsselbund.

## Befehle
- `npm run dev` · `npm run build` · `npm run start` · `npm run lint`
- Verifizieren: Build muss grün sein; danach `npm run start` + die betroffenen Routen per `curl` prüfen.

## Architektur / Konventionen
- **Farben/Theme:** `src/lib/theme.ts` (`C`) auf CSS-Variablen (`globals.css`); Dark default, `.light`-Klasse via localStorage.
- **Öffentlich vs. eingeloggt:** `src/components/ClientShell.tsx` rendert `publicPaths` (`/`, `/wissen`, Rechtsseiten, `/auth/*`) ohne Auth; alle anderen Seiten hinter `AuthGuard`. Auth-Logik clientseitig — **API-Routen müssen sich selbst absichern** (Token prüfen), nicht auf den AuthGuard verlassen.
- **SEO:** zentral in `src/lib/seo.ts` (`pageMeta`, JSON-LD-Helfer); `sitemap.ts`/`robots.ts`/`manifest.ts`; dynamische OG-/Icon-Bilder via `next/og`.
- **Wissens-Inhalte:** Daten in `src/data/knowledge-base.ts` (server-gerendert unter `src/app/wissen/**`; Tabellen + FAQ + `FAQPage`-Markup unterstützt).
- **Rechtsseiten:** `src/app/(legal)/**` (öffentlich, noindex).
- **Auth-Vorbild für geschützte API-Routen:** `src/app/api/save-analysis/route.ts` (Bearer-Token prüfen → `user_id` aus dem Token, nie aus dem Body).
- **Rate-Limiting:** `src/lib/rate-limit.ts` (in-memory, pro Instanz) auf teuren Endpunkten.

## Gotchas
- **iCloud:** Arbeitskopie liegt in iCloud Drive → erzeugt manchmal „ 2"-Duplikate (per `.gitignore` abgefangen). GitHub ist die Quelle der Wahrheit.
- Keine automatisierten Tests vorhanden.
- Eingeloggte Flows (Login, KI, Analyse) lassen sich ohne echte Zugangsdaten nicht end-to-end testen → bei Auth-Änderungen muss ein Mensch gegentesten.

## Arbeitsweise
- Auf einem Branch arbeiten, sauber bauen, dann erst Produktions-Push (nur nach Freigabe des Inhabers).
- Commit-Messages auf Englisch; Co-Authored-By-Trailer setzen.
