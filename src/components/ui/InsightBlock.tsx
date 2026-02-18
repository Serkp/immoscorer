interface InsightBlockProps {
  icon?: string;
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
}

const trendConfig = {
  up: { icon: "\u2191", color: "text-emerald-600", bg: "bg-emerald-50" },
  down: { icon: "\u2193", color: "text-red-500", bg: "bg-red-50" },
  stable: { icon: "\u2192", color: "text-[var(--muted)]", bg: "bg-slate-50" },
};

export function InsightBlock({ icon, title, value, subtitle, trend }: InsightBlockProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {icon && <span className="text-xl mb-2 block">{icon}</span>}
          <p className="kpi-label">{title}</p>
          <p className="text-2xl font-bold tracking-tight mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{subtitle}</p>}
        </div>
        {trend && (
          <span className={`badge ${trendConfig[trend].bg} ${trendConfig[trend].color}`}>
            {trendConfig[trend].icon}
          </span>
        )}
      </div>
    </div>
  );
}
