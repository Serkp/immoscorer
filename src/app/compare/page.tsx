"use client";

import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

export default function ComparePage() {
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
