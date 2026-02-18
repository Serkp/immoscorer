export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KI-Assistent</h1>
        <p className="section-subtitle mt-0.5">Stellen Sie Fragen zu Ihren Immobilien und erhalten Sie datenbasierte Empfehlungen.</p>
      </div>

      <div className="card p-16 text-center">
        <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">{"\uD83E\uDD16"}</span>
        </div>
        <p className="font-bold text-lg">In Entwicklung</p>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
          Der KI-Assistent wird Ihnen bei der Bewertung von Immobilien helfen, Optimierungsvorschl\u00E4ge liefern und Fragen rund um die Immobilienanlage in Deutschland beantworten.
        </p>
      </div>
    </div>
  );
}
