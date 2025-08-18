// src/features/electoral-rolls/utils/rowGet.ts
export const norm = (s: unknown) => String(s ?? "").trim();
export const toInt = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};

/** Toma el primer valor no vacío entre varios nombres de columna */
export function getField(row: Record<string, any>, keys: string[]) {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return v;
  }
  return "";
}
