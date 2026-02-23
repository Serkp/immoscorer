"use client";

import { Card } from "@/components/ui/Card";
import { MiniRing } from "@/components/ui/ScoreRing";
import { C, scoreColor } from "@/lib/theme";

/* ── SVGs ── */
const HouseIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const StarIcon = ({ filled, size = 16 }: { filled: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? C.amber : "none"}
      stroke={filled ? C.amber : C.dim}
    />
  </svg>
);

const TrashIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
  </svg>
);

/* ── Types ── */
export interface PropertyCardData {
  id: string;
  address: string;
  city: string;
  score: number;
  price: number;
  rent: number;
  area?: number;
  locationGrade?: string;
  purchaseDate?: string;
  isFavorite?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface PropertyCardProps extends PropertyCardData {
  onFavoriteToggle?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  showDelete?: boolean;
  confirmingDelete?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
}

export function PropertyCard({
  address, city, score, price, rent, locationGrade,
  purchaseDate, isFavorite, badge, badgeColor,
  onFavoriteToggle, onDelete, onClick,
  showDelete, confirmingDelete, onConfirmDelete, onCancelDelete,
}: PropertyCardProps) {
  const grossYield = price > 0 ? ((rent * 12) / price) * 100 : 0;
  const factor = rent > 0 ? price / (rent * 12) : 0;

  return (
    <Card className="overflow-hidden group" hover>
      {/* House icon header + actions */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.accentDim}, rgba(76,154,255,0.08))` }}>
          <HouseIcon size={24} color={C.accent} />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Delete */}
          {showDelete && (
            confirmingDelete ? (
              <div className="flex items-center gap-1">
                <button onClick={onConfirmDelete} className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ background: C.redDim, color: C.red }}>
                  Ja
                </button>
                <button onClick={onCancelDelete} className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ background: C.surface3, color: C.sub }}>
                  Nein
                </button>
              </div>
            ) : (
              <button onClick={onDelete} className="p-1.5 rounded-lg transition-all hover:opacity-70" title="Löschen">
                <TrashIcon />
              </button>
            )
          )}
          {/* Favorite */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
              className="p-1.5 rounded-lg transition-all hover:opacity-70"
              title={isFavorite ? "Favorit entfernen" : "Als Favorit markieren"}
            >
              <StarIcon filled={!!isFavorite} />
            </button>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="px-4 pt-3 cursor-pointer" onClick={onClick}>
        <p className="text-sm font-bold truncate" style={{ color: C.text }}>{address}</p>
        <p className="text-xs" style={{ color: C.sub }}>{city}</p>
      </div>

      {/* Score + Metrics */}
      <div className="flex items-center gap-4 px-4 pt-3" onClick={onClick} style={{ cursor: onClick ? "pointer" : undefined }}>
        <MiniRing value={score} size={44} />
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1">
          <MetricLine label="Kaufpreis" value={`${price.toLocaleString("de-DE")} €`} />
          <MetricLine label="Miete" value={`${rent.toLocaleString("de-DE")} €/Mon.`} />
          <MetricLine label="Rendite" value={`${grossYield.toFixed(2)} %`} color={grossYield >= 4 ? C.green : grossYield >= 3 ? C.amber : C.red} />
          <MetricLine label="Faktor" value={`${factor.toFixed(1)}x`} color={factor <= 25 ? C.green : factor <= 30 ? C.amber : C.red} />
        </div>
      </div>

      {/* Footer: date + badge + grade */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 mt-2 border-t" style={{ borderColor: C.border }}>
        {locationGrade && (
          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: gradeBackground(locationGrade), color: gradeTextColor(locationGrade), border: `1px solid ${gradeBorderColor(locationGrade)}` }}>
            Lageklasse {locationGrade}
          </span>
        )}
        {badge && (
          <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: badgeColor ? `${badgeColor}20` : C.greenDim, color: badgeColor || C.green }}>
            {badge}
          </span>
        )}
        {purchaseDate && (
          <span className="text-[10px] ml-auto" style={{ color: C.dim }}>
            {purchaseDate}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ── Helpers ── */
function MetricLine({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px]" style={{ color: C.dim }}>{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: color || C.text }}>{value}</span>
    </div>
  );
}

function gradeBackground(g: string) {
  if (g === "A") return C.greenDim;
  if (g === "B") return "rgba(76,154,255,0.12)";
  if (g === "C") return C.amberDim;
  return C.redDim;
}
function gradeTextColor(g: string) {
  if (g === "A") return C.green;
  if (g === "B") return C.blue;
  if (g === "C") return C.amber;
  return C.red;
}
function gradeBorderColor(g: string) {
  if (g === "A") return C.greenBorder;
  if (g === "B") return "rgba(76,154,255,0.2)";
  if (g === "C") return C.amberBorder;
  return "rgba(248,113,113,0.2)";
}

export { scoreColor };
