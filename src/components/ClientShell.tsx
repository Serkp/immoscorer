"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "@/components/Navbar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </AuthGuard>
    </AuthProvider>
  );
}
