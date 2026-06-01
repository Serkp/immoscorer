import { ImageResponse } from "next/og";

/* Social-Media-Vorschaubild (beim Teilen auf WhatsApp, LinkedIn, X, Facebook).
   Dynamisch erzeugt — kein Bild-Asset im Repo nötig. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ImmoScorer — Immobilien als Kapitalanlage bewerten";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090E",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 76,
              height: 76,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7C6AFF, #4C9AFF)",
              borderRadius: 20,
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            IS
          </div>
          <div style={{ color: "#ffffff", fontSize: 42, fontWeight: 800 }}>
            ImmoScorer
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 66,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 940,
            }}
          >
            Immobilien in Sekunden bewerten.
          </div>
          <div style={{ color: "#A0A4B8", fontSize: 32, maxWidth: 940 }}>
            KI-Score aus Rendite, Risiko, Finanzierbarkeit, Lage & Energie — mit
            Verhandlungs-Tipps.
          </div>
        </div>

        <div style={{ display: "flex", color: "#7C6AFF", fontSize: 30, fontWeight: 700 }}>
          immoscorer.de
        </div>
      </div>
    ),
    { ...size },
  );
}
