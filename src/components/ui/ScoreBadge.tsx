interface ScoreBadgeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
}

function getColor(score: number) {
  if (score >= 75) return { stroke: "#059669", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" };
  if (score >= 50) return { stroke: "#D97706", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" };
  return { stroke: "#DC2626", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" };
}

const dims = {
  sm: { w: 36, r: 14, sw: 3, font: "text-xs", labelFont: "" },
  md: { w: 48, r: 18, sw: 3.5, font: "text-sm font-bold", labelFont: "" },
  lg: { w: 64, r: 25, sw: 4.5, font: "text-lg font-bold", labelFont: "" },
  xl: { w: 140, r: 56, sw: 9, font: "text-3xl font-extrabold tracking-tight", labelFont: "text-xs" },
};

export function ScoreBadge({ score, size = "md", label }: ScoreBadgeProps) {
  const c = getColor(score);
  const d = dims[size];
  const circumference = 2 * Math.PI * d.r;
  const offset = circumference - (score / 100) * circumference;

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center font-bold rounded-full ring-1 text-xs px-2.5 py-0.5 ${c.bg} ${c.text} ${c.ring}`}>
        {score}
      </span>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: d.w, height: d.w }}>
      <svg width={d.w} height={d.w} className="-rotate-90">
        <circle cx={d.w / 2} cy={d.w / 2} r={d.r} fill="none" stroke="#F3F4F6" strokeWidth={d.sw} />
        <circle
          cx={d.w / 2} cy={d.w / 2} r={d.r}
          fill="none"
          stroke={c.stroke}
          strokeWidth={d.sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-animated"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${d.font} ${c.text}`}>{score}</span>
        {label && size === "xl" && (
          <span className={`${d.labelFont} text-[var(--muted)] mt-0.5`}>{label}</span>
        )}
      </div>
    </div>
  );
}
