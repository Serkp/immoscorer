"use client";

import { C } from "@/lib/theme";
import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  glow?: boolean;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Card({ children, glow, hover, className = "", style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${hover ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: C.surface2,
        border: `1px solid ${C.border}`,
        boxShadow: glow ? `0 0 24px -4px ${C.accentDim}` : undefined,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) e.currentTarget.style.borderColor = C.borderHover;
      }}
      onMouseLeave={(e) => {
        if (hover) e.currentTarget.style.borderColor = C.border;
      }}
    >
      {children}
    </div>
  );
}
