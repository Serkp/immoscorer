"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "@/components/Navbar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page — no shell
  if (pathname === "/") {
    return <>{children}</>;
  }

  // Analysis page — AuthProvider + Navbar, but NO AuthGuard (login optional)
  if (pathname === "/analysis") {
    return (
      <AuthProvider>
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </AuthProvider>
    );
  }

  // All other pages — full auth required
  return (
    <AuthProvider>
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </AuthGuard>
    </AuthProvider>
  );
}
