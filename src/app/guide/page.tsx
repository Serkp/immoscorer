"use client";

import { AIOrb } from "@/components/ui/AIOrb";
import { Card } from "@/components/ui/Card";
import { C } from "@/lib/theme";

export default function GuidePage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <AIOrb size={56} active />
      <p className="text-sm font-medium" style={{ color: C.sub }}>
        Wissensbereich wird vorbereitet
      </p>
      <Card className="px-6 py-4">
        <p className="text-xs" style={{ color: C.dim }}>
          Hier finden Sie Ratgeber, Leitfäden und Erklärungen rund um die Immobilienanalyse.
        </p>
      </Card>
    </div>
  );
}
