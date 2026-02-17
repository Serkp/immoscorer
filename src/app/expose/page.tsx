export default function ExposePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exposé Analyzer</h1>
        <p className="text-sm text-[var(--muted)]">Paste an exposé URL or upload a PDF to auto-extract property data.</p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-semibold">Coming Soon</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
          Automatically extract purchase price, rent, area, energy class, and more from property listings on ImmoScout24, Immowelt, and other portals.
        </p>
      </div>
    </div>
  );
}
