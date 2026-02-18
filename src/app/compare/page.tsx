"use client";

import { useRouter } from "next/navigation";
import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { useSubscription } from "@/hooks/useSubscription";
import { C } from "@/lib/theme";

export default function ComparePage() {
  const router = useRouter();
  const { isPro, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <AIOrb size={48} active />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <AIOrb size={56} active />
        <h2 className="text-lg font-bold" style={{ color: C.text }}>
          Vergleichstool freischalten
        </h2>
        <p className="text-sm text-center max-w-sm" style={{ color: C.sub }}>
          Upgrade auf ImmoScorer Pro, um Immobilien nebeneinander zu vergleichen.
        </p>
        <button
          onClick={() => router.push("/analysis")}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
            color: "#fff",
          }}
        >
          Upgrade auf Pro
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <AIOrb size={56} active />
      <p className="text-sm font-medium" style={{ color: C.sub }}>
        Vergleich wird vorbereitet
      </p>
      <Card className="px-6 py-4">
        <p className="text-xs" style={{ color: C.dim }}>
          Hier können Immobilien nebeneinander verglichen werden.
        </p>
      </Card>
    </div>
  );
}
