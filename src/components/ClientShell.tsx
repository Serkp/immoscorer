"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/Navbar";
import { C } from "@/lib/theme";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page — no shell, no auth required
  if (pathname === "/") {
    return <>{children}</>;
  }

  // All other pages — AuthProvider + Navbar + AuthGuard
  return (
    <AuthProvider>
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </AuthGuard>
    </AuthProvider>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm" style={{ color: C.sub }}>Laden...</div>
      </div>
    );
  }

  if (!user) {
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
