export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KI-Assistent</h1>
        <p className="text-sm text-[var(--muted)]">Stellen Sie Fragen zu Ihren Immobilien und erhalten Sie datenbasierte Empfehlungen.</p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">{"\uD83E\uDD16"}</p>
        <p className="font-semibold">In Entwicklung</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
          Der KI-Assistent wird Ihnen bei der Bewertung von Immobilien helfen, Optimierungsvorschl\u00E4ge liefern und Fragen rund um die Immobilienanlage in Deutschland beantworten.
        </p>
      </div>
    </div>
  );
}
