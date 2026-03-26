import type { Metadata } from "next";
import { ClientShell } from "@/components/ClientShell";
import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmoScorer — KI-gestützte Immobilienanalyse",
  description:
    "Professionelle Bewertung von Anlageimmobilien mit KI-gestütztem Scoring, Risikoanalyse und Handlungsempfehlungen für den deutschen Markt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="antialiased">
        <ThemeProvider>
          <ClientShell>{children}</ClientShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
