export default function ExposePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expos\u00E9-Analyse</h1>
        <p className="section-subtitle mt-0.5">F\u00FCgen Sie eine Expos\u00E9-URL ein oder laden Sie ein PDF hoch, um Objektdaten automatisch zu extrahieren.</p>
      </div>

      <div className="card p-16 text-center">
        <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">{"\uD83D\uDCC4"}</span>
        </div>
        <p className="font-bold text-lg">In Entwicklung</p>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
          Kaufpreis, Miete, Wohnfl\u00E4che, Energieeffizienzklasse und weitere Daten werden automatisch aus Inseraten auf ImmoScout24, Immowelt und anderen Portalen extrahiert.
        </p>
      </div>
    </div>
  );
}
