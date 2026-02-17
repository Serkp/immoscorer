export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-sm text-[var(--muted)]">Ask questions about your properties and get data-driven advice.</p>
      </div>

      <div className="rounded-2xl bg-white border border-[var(--border)] shadow-sm p-12 text-center">
        <p className="text-4xl mb-3">🤖</p>
        <p className="font-semibold">Coming Soon</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-md mx-auto">
          The AI assistant will help you evaluate properties, suggest improvements, and answer questions about German real estate investing.
        </p>
      </div>
    </div>
  );
}
