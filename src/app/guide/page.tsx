export default function GuidePage() {
  const sections = [
    {
      title: "Den Score verstehen",
      icon: "01",
      body: "Der ImmoScorer-Score (0\u2013100) gewichtet Bruttomietrendite, Quadratmeterpreis, Geb\u00E4udealter, Energieeffizienz, Lageklasse und Sanierungsbedarf. Ein Score \u00FCber 75 ist hervorragend, 50\u201375 moderat und unter 50 erfordert eine sorgf\u00E4ltige Pr\u00FCfung.",
    },
    {
      title: "Wichtige Kennzahlen erkl\u00E4rt",
      icon: "02",
      body: "Die Bruttomietrendite ergibt sich aus der Jahresmiete geteilt durch den Kaufpreis. Der Kaufpreisfaktor zeigt, wie viele Jahreskaltmieten dem Kaufpreis entsprechen. Das Hausgeld umfasst Verwaltungskosten und R\u00FCcklagen \u2013 halten Sie es unter 30\u00A0% der Miete f\u00FCr einen gesunden Cashflow.",
    },
    {
      title: "Einfluss von Sanierungen",
      icon: "03",
      body: "Jedes sanierungsbed\u00FCrftige Gewerk reduziert den Score. Priorisieren Sie Dach, Fassade und Heizung \u2013 diese haben den h\u00F6chsten Kosteneinfluss. Fenster und Elektrik sind bei \u00E4lteren Geb\u00E4uden (vor 1990) h\u00E4ufig erneuerungsbed\u00FCrftig.",
    },
    {
      title: "Lageklassen im \u00DCberblick",
      icon: "04",
      body: "Lageklasse A bezeichnet urbane Top-Lagen mit hoher Nachfrage und geringem Leerstand. Lageklasse D steht f\u00FCr Entwicklungslagen \u2013 h\u00F6heres Renditepotenzial, aber mehr Risiko. B und C bieten eine ausgewogene Mischung aus Wachstum und Stabilit\u00E4t.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wissensbereich</h1>
        <p className="section-subtitle mt-0.5">So lesen und nutzen Sie die ImmoScorer-Ergebnisse.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {sections.map((s) => (
          <div key={s.title} className="card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center text-white text-xs font-extrabold">
                {s.icon}
              </span>
              <h3 className="font-bold text-sm">{s.title}</h3>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
