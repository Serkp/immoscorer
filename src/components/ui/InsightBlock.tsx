interface InsightBlockProps {
  icon?: string;
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
}

const trendIcons = {
  up: "↑",
  down: "↓",
  stable: "→",
};

const trendColors = {
  up: "text-emerald-600",
  down: "text-red-500",
  stable: "text-[var(--muted)]",
};

export function InsightBlock({ icon, title, value, subtitle, trend }: InsightBlockProps) {
  return (
    <div className="rounded-2xl bg-white border border-[var(--border)] p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          {icon && <span className="text-lg mb-1 block">{icon}</span>}
          <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">{title}</p>
          <p className="text-xl font-semibold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}
