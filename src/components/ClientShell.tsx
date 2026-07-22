"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { C } from "@/lib/theme";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Öffentliche Seiten — keine App-Chrome.
  // /wissen = SEO-Wissensbasis; /check, /besichtigung, /kapitalanlage = Gratis-Tools/SEO;
  // Rechtsseiten müssen öffentlich erreichbar sein (§5 DDG).
  const publicPaths = [
    "/wissen",
    "/check",
    "/besichtigung",
    "/kapitalanlage",
    "/rendite-rechner",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/widerruf",
    "/auth/callback",
    "/auth/confirm",
    "/auth/reset-password",
    "/auth/error",
  ];
  if (pathname === "/" || publicPaths.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Login wurde entfernt — alles ist kostenlos und ohne Account nutzbar.
  // Frühere Account-/Login-Seiten gibt es nicht mehr → auf das Tool umleiten.
  const redirectPaths = ["/dashboard", "/portfolio", "/compare", "/strategies", "/financing", "/settings", "/auth"];
  if (redirectPaths.some((p) => pathname.startsWith(p))) {
    return <RedirectTo to="/analysis" />;
  }

  // Alle übrigen Seiten (Tools) — offen, kostenlos, kein Login-Zwang.
  return (
    <AuthProvider>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 md:px-5 pb-16 pt-4 md:pt-6">{children}</main>
    </AuthProvider>
  );
}

function RedirectTo({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [to, router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm" style={{ color: C.sub }}>Weiterleitung…</div>
    </div>
  );
}
