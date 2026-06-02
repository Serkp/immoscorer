import { ImageResponse } from "next/og";

/* Favicon + Organisations-Logo — dynamisch erzeugt in Markenfarben.
   256px, damit es auch als schema.org-Logo taugt (Google verlangt ≥112px). */
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7C6AFF, #4C9AFF)",
          borderRadius: 56,
          color: "#ffffff",
          fontSize: 150,
          fontWeight: 800,
        }}
      >
        IS
      </div>
    ),
    { ...size },
  );
}
