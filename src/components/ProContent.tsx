"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/components/auth/AuthProvider";
import { C } from "@/lib/theme";
import { useState } from "react";

interface ProContentProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDesc?: string;
}

export function ProContent({ children, fallbackTitle, fallbackDesc }: ProContentProps) {
  const { isPro } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (isPro) return <>{children}</>;

  async function handleCheckout() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div
        className="select-none pointer-events-none"
        style={{ filter: "blur(8px)", opacity: 0.5 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div
          className="rounded-2xl p-6 text-center max-w-xs shadow-xl"
          style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            boxShadow: `0 0 40px ${C.accentDim}`,
          }}
        >
          <div
            className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
            style={{ background: C.accentDim }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 className="text-sm font-bold mb-1" style={{ color: C.text }}>
            {fallbackTitle || "PRO-Feature"}
          </h3>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: C.sub }}>
            {fallbackDesc || "Schalten Sie diesen Bereich mit ImmoScorer Pro frei."}
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
              color: "#fff",
            }}
          >
            {loading ? "..." : "Pro freischalten — 9,99 €/Mon."}
          </button>
        </div>
      </div>
    </div>
  );
}
