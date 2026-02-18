"use client";

import { useAuth } from "./AuthProvider";
import { LoginPage } from "./LoginPage";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: C.bg }}
      >
        <AIOrb size={56} active />
        <p className="text-sm font-medium" style={{ color: C.sub }}>
          Wird geladen...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
