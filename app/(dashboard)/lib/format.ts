// lib/format.ts
export const fmtAR = new Intl.NumberFormat("es-AR");
export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
