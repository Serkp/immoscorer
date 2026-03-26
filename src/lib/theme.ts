export const C = {
  bg: "var(--c-bg)",
  bg2: "var(--c-bg2)",
  surface: "var(--c-surface)",
  surface2: "var(--c-surface2)",
  surface3: "var(--c-surface3)",
  border: "var(--c-border)",
  borderHover: "var(--c-border-hover)",
  text: "var(--c-text)",
  sub: "var(--c-sub)",
  dim: "var(--c-dim)",
  accent: "var(--c-accent)",
  accentMid: "var(--c-accent-mid)",
  accentDim: "var(--c-accent-dim)",
  blue: "var(--c-blue)",
  cyan: "var(--c-cyan)",
  green: "var(--c-green)",
  greenDim: "var(--c-green-dim)",
  greenBorder: "var(--c-green-border)",
  amber: "var(--c-amber)",
  amberDim: "var(--c-amber-dim)",
  amberBorder: "var(--c-amber-border)",
  red: "var(--c-red)",
  redDim: "var(--c-red-dim)",
  orange: "var(--c-orange)",
  orangeDim: "var(--c-orange-dim)",
  orangeBorder: "var(--c-orange-border)",
  darkRed: "var(--c-dark-red)",
  navBg: "var(--c-nav-bg)",
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
