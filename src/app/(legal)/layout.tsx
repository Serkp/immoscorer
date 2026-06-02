import { PublicHeader, PublicFooter } from "@/components/PublicChrome";
import { C } from "@/lib/theme";

/* Öffentliche Hülle für die Rechtsseiten (Impressum, Datenschutz, AGB, Widerruf). */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <PublicHeader />
      <main
        className="mx-auto px-4 md:px-5 py-10 md:py-14"
        style={{ maxWidth: 760 }}
      >
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
