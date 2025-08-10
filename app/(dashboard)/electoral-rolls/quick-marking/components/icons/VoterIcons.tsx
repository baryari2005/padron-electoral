"use client";
import * as React from "react";

type Props = { className?: string };

// Base: silueta de persona (rellena) + overlay a la derecha
function PersonBase({ className, children, fill }: React.PropsWithChildren<{ className?: string; fill: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {/* cabeza */}
      <circle cx="12" cy="7.5" r="4.5" fill={fill} />
      {/* torso */}
      <path d="M4 20c0-6.2 6.3-7 8-7s8 1.8 8 7" fill={fill} /> 
      
      {/* overlay (check / x / dot) */}
      {children}
    </svg>
  );
}

// ✅ VERDE (votó) — check
export const IconVerde: React.FC<Props> = ({ className }) => (
  <PersonBase className={className} fill="#007F0E">
    <path
      d="M18.5 12.5l1.8 1.8 3.2-3.2"
      fill="none"
      stroke="#007F0E"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </PersonBase>
);

// ❌ ROJO (no votó) — cruz
export const IconRojo: React.FC<Props> = ({ className }) => (
  <PersonBase className={className} fill="#8B1D1D">
    <path
      d="M19 11l3 3M22 11l-3 3"
      fill="none"
      stroke="#8B1D1D"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </PersonBase>
);

// 🔵 AZUL (pendiente local) — punto
export const IconAzul: React.FC<Props> = ({ className }) => (
  <PersonBase className={className} fill="#0B4A91">
    <circle cx="20.5" cy="12.5" r="2.2" fill="#0B4A91" />
  </PersonBase>
);
