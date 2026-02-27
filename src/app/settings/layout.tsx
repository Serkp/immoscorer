"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { C } from "@/lib/theme";

const TABS = [
  { href: "/settings/profile", label: "Profil" },
  { href: "/settings", label: "Benachrichtigungen" },
  { href: "/settings/security", label: "Sicherheit" },
  { href: "/settings/data", label: "Daten & Export" },
] as const;

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-80" style={{ color: C.dim }}>
        ← Dashboard
      </Link>
      <h1 className="text-xl font-bold" style={{ color: C.text }}>Einstellungen</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const finalActive = t.href === "/settings" ? pathname === "/settings" : pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link key={t.href + t.label} href={t.href}
                  className="rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: finalActive ? C.accentMid : "transparent",
                    color: finalActive ? C.accent : C.sub,
                    border: `1px solid ${finalActive ? C.accent : "transparent"}`,
                  }}>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
