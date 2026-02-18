import { ScoreBadge } from "./ScoreBadge";

interface PropertyCardProps {
  street: string;
  city: string;
  price: string;
  trend?: "up" | "down" | "stable";
  score: number;
  imageUrl?: string;
  metrics?: { label: string; value: string }[];
  onClick?: () => void;
}

const trendLabels = { up: "\u2191 Steigend", down: "\u2193 Fallend", stable: "\u2192 Stabil" };
const trendColors = {
  up: "text-emerald-600",
  down: "text-red-500",
  stable: "text-[var(--muted)]",
};

export function PropertyCard({
  street,
  city,
  price,
  trend = "stable",
  score,
  imageUrl,
  metrics,
  onClick,
}: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card overflow-hidden transition-all duration-200 hover:shadow-lg ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Image or placeholder */}
      <div className="h-32 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt={street} className="w-full h-full object-cover" />
        ) : (
          <div className="text-3xl opacity-40">{"\uD83C\uDFE0"}</div>
        )}
      </div>

      <div className="p-5 space-y-3">
        {/* Header with score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{street}</p>
            <p className="text-xs text-[var(--muted)]">{city}</p>
          </div>
          <ScoreBadge score={score} size="md" />
        </div>

        {/* Price + trend */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{price}</span>
          <span className={`text-xs font-medium ${trendColors[trend]}`}>
            {trendLabels[trend]}
          </span>
        </div>

        {/* Optional metric pills */}
        {metrics && metrics.length > 0 && (
          <div className="flex gap-2 pt-1">
            {metrics.map((m) => (
              <div key={m.label} className="flex-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-center">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{m.label}</p>
                <p className="text-xs font-semibold mt-0.5">{m.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
