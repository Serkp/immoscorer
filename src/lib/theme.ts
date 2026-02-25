export const C = {
  bg: "#08090E",
  bg2: "#0D0F16",
  surface: "rgba(255,255,255,0.04)",
  surface2: "rgba(255,255,255,0.06)",
  surface3: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text: "#EDEEF2",
  sub: "rgba(255,255,255,0.52)",
  dim: "rgba(255,255,255,0.28)",
  accent: "#7C6AFF",
  accentMid: "rgba(124,106,255,0.2)",
  accentDim: "rgba(124,106,255,0.1)",
  blue: "#4C9AFF",
  cyan: "#00D4FF",
  green: "#34D399",
  greenDim: "rgba(52,211,153,0.12)",
  greenBorder: "rgba(52,211,153,0.2)",
  amber: "#FBBF24",
  amberDim: "rgba(251,191,36,0.12)",
  amberBorder: "rgba(251,191,36,0.2)",
  red: "#F87171",
  redDim: "rgba(248,113,113,0.12)",
  orange: "#FB923C",
  darkRed: "#DC2626",
};

export const scoreColor = (v: number) =>
  v >= 80 ? C.green : v >= 65 ? C.blue : v >= 50 ? C.amber : v >= 35 ? C.orange : C.red;

export const scoreLabel = (v: number) =>
  v >= 80 ? "Sehr gut" :
  v >= 65 ? "Gut" :
  v >= 50 ? "Moderat" :
  v >= 35 ? "Unterdurchschnittlich" :
  v >= 20 ? "Kritisch" :
  "Nicht empfohlen";
