import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ImmoScorer – Real Estate Analysis",
  description: "Analyze and score real estate investments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* Top navigation bar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Immo<span className="text-[var(--accent)]">Scorer</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <span>Dashboard</span>
            <span className="h-5 w-5 rounded-full bg-[var(--accent)] inline-flex items-center justify-center text-xs text-white font-medium">
              S
            </span>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
