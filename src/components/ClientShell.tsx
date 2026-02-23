"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/Navbar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Landing page — no shell
  if (pathname === "/") {
    return <>{children}</>;
  }

  // All pages — AuthProvider + Navbar, NO AuthGuard
  return (
    <AuthProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
    </AuthProvider>
  );
}
