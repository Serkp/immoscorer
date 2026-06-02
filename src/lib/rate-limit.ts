/* Einfacher In-Memory-Rate-Limiter (Fixed-Window, pro Serverless-Instanz).
   Drosselt anonymen Missbrauch teurer Endpunkte (KI, Google, PDF, Leads).
   Hinweis: nicht verteilt — für produktionsreifes, instanzübergreifendes
   Limiting später einen Store nutzen (z. B. Vercel KV / Upstash Redis).
   Die vollständige Absicherung ist zusätzlich eine Auth-Pflicht je Route. */

const buckets = new Map<string, { count: number; resetAt: number }>();

/** Gibt true zurück, wenn die Anfrage erlaubt ist (Limit nicht überschritten). */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Ermittelt die Client-IP aus den Proxy-Headern (Vercel setzt x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Standard-429-Antwort. */
export const TOO_MANY = {
  body: { error: "Zu viele Anfragen. Bitte warten Sie einen Moment." },
  status: 429 as const,
};
