export const norm = (s: unknown) => String(s ?? "").trim();
export const toInt = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
};
