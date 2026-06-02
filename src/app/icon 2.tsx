import { ImageResponse } from "next/og";

/* Favicon — dynamisch erzeugt in Markenfarben (kein Asset nötig). */
export const size = { width: 64, height: 64 };
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
          borderRadius: 14,
          color: "#ffffff",
          fontSize: 38,
          fontWeight: 800,
        }}
      >
        IS
      </div>
    ),
    { ...size },
  );
}
