"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/Navbar";
import { C } from "@/lib/theme";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public pages — no shell, no auth required
  const publicPaths = ["/", "/auth/callback", "/auth/confirm", "/auth/reset-password", "/auth/error", "/reset-password"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // All other pages — AuthProvider + Navbar + AuthGuard
  return (
    <AuthProvider>
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 md:px-5 pb-16 pt-4 md:pt-6">{children}</main>
      </AuthGuard>
    </AuthProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [waited, setWaited] = useState(false);

  // Give auth a moment to resolve before showing login modal
  useEffect(() => {
    if (!loading && !user && !waited) {
      const t = setTimeout(() => setWaited(true), 1500);
      return () => clearTimeout(t);
    }
    if (user) {
      setShowAuthModal(false);
      setWaited(false);
    }
  }, [loading, user, waited]);

  useEffect(() => {
    if (waited && !user) {
      setShowAuthModal(true);
    }
  }, [waited, user]);

  if (loading || (!user && !waited)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm" style={{ color: C.sub }}>Laden...</div>
      </div>
    );
  }

  if (!user && waited) {
    return (
      <AuthModal
        open={showAuthModal}
        onClose={() => { window.location.href = "/"; }}
        onSuccess={() => setShowAuthModal(false)}
      />
    );
  }

  return <>{children}</>;
}
