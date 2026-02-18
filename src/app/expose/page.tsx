export default function ExposePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expos\u00E9-Analyse</h1>
        <p className="text-sm text-[var(--muted)]">F\u00FCgen Sie eine Expos\u00E9-URL ein oder laden Sie ein PDF hoch, um Objektdaten automatisch zu extrahieren.</p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">{"\uD83D\uDCC4"}</p>
        <p className="font-semibold">In Entwicklung</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
          Kaufpreis, Miete, Wohnfl\u00E4che, Energieeffizienzklasse und weitere Daten werden automatisch aus Inseraten auf ImmoScout24, Immowelt und anderen Portalen extrahiert.
        </p>
      </div>
    </div>
  );
}
