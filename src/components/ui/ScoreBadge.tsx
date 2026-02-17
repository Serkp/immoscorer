interface ScoreBadgeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

function getColor(score: number) {
  if (score >= 75) return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" };
  if (score >= 50) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" };
  return { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" };
}

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const c = getColor(score);
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ring-1 ${c.bg} ${c.text} ${c.ring} ${sizes[size]}`}
    >
      {score}
    </span>
  );
}
