import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmoScorer — KI-gestützte Immobilienanalyse",
  description:
    "Professionelle Bewertung von Anlageimmobilien mit KI-gestütztem Scoring, Risikoanalyse und Handlungsempfehlungen für den deutschen Markt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[#08090E] text-[#EDEEF2] antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6">{children}</main>
      </body>
    </html>
  );
}
