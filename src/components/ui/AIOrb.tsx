"use client";

import { C } from "@/lib/theme";

interface AIOrbProps {
  size?: number;
  active?: boolean;
}

export function AIOrb({ size = 40, active = false }: AIOrbProps) {
  const ring = size;
  const dot = size * 0.35;
  const border = Math.max(2, size * 0.07);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: ring, height: ring }}>
      {/* Spinning conic gradient ring */}
      <div
        className={active ? "animate-spin-slow" : ""}
        style={{
          width: ring,
          height: ring,
          borderRadius: "50%",
          background: `conic-gradient(${C.accent}, ${C.blue}, ${C.cyan}, ${C.accent})`,
          padding: border,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: C.bg,
          }}
        />
      </div>

      {/* Pulsing center dot */}
      <div
        className={active ? "animate-pulse-dot" : ""}
        style={{
          position: "absolute",
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: C.accent,
          boxShadow: `0 0 ${size * 0.3}px ${C.accentMid}`,
        }}
      />
    </div>
  );
}
