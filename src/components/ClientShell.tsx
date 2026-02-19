"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Navbar } from "@/components/Navbar";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </AuthGuard>
    </AuthProvider>
  );
}
