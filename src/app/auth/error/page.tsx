"use client";

import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

export default function AuthErrorPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: C.bg }}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl p-6 space-y-6 text-center"
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          boxShadow: `0 0 60px ${C.accentDim}`,
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <AIOrb size={40} active />
          <h2 className="text-lg font-bold" style={{ color: C.text }}>
            Ein Fehler ist aufgetreten
          </h2>
          <p className="text-sm" style={{ color: C.sub }}>
            Der Link ist möglicherweise abgelaufen oder ungültig. Bitte fordern
            Sie einen neuen Link an.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/"
            className="block w-full rounded-xl py-3 text-sm font-bold text-center transition-all hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            Zurück zur Anmeldung
          </a>
          <p className="text-[11px]" style={{ color: C.dim }}>
            Falls das Problem weiterhin besteht, kontaktieren Sie unseren
            Support.
          </p>
        </div>
      </div>
    </div>
  );
}
