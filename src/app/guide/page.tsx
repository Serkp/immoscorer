export default function GuidePage() {
  const sections = [
    {
      title: "Understanding the Score",
      body: "The ImmoScorer score (0-100) weighs gross yield, price per m², building age, energy efficiency, location grade, and needed renovations. A score above 75 is excellent, 50-75 is moderate, and below 50 needs careful evaluation.",
    },
    {
      title: "Key Metrics Explained",
      body: "Gross yield is annual rent divided by purchase price. The rent multiplier shows how many years of rent equal the price. Hausgeld covers management fees — keep it below 30% of rent for healthy cash-flow.",
    },
    {
      title: "Renovation Impact",
      body: "Each needed renovation reduces the score by 3 points. Prioritize roof, facade, and heating — they have the highest cost impact. Windows and electrical are often required for older buildings (pre-1990).",
    },
    {
      title: "Location Grades",
      body: "Grade A locations are prime urban areas with high demand and low vacancy. Grade D locations are developing — higher yield potential but more risk. B and C offer a balance of growth and stability.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Guide</h1>
        <p className="text-sm text-[var(--muted)]">How to read and use ImmoScorer results.</p>
      </div>

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-6">
            <h3 className="font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
