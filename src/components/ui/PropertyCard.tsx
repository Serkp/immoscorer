import { ScoreBadge } from "./ScoreBadge";

interface PropertyCardProps {
  street: string;
  city: string;
  price: string;
  trend?: "up" | "down" | "stable";
  score: number;
  imageUrl?: string;
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
  onClick,
}: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white border border-[var(--border)] shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Image or icon area */}
      <div className="h-36 bg-slate-50 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt={street} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🏠</span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{street}</p>
            <p className="text-xs text-[var(--muted)]">{city}</p>
          </div>
          <ScoreBadge score={score} size="sm" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{price}</span>
          <span className={`text-xs font-medium ${trendColors[trend]}`}>
            {trendLabels[trend]}
          </span>
        </div>
      </div>
    </div>
  );
}
