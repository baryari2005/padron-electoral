export const DEFAULT_ORDER = ["", ""] as const;
const norm = (s: string) => (s ?? "").trim().toUpperCase();

export type CategoriaOrdenMap = Record<string, number>;
export type CategoriaItem = { nombre: string; orden?: number | null } | string;

export function buildCategoriaOrderMap(items: CategoriaItem[] = []): CategoriaOrdenMap {
  if (!items.length) return Object.fromEntries(DEFAULT_ORDER.map((n, i) => [norm(n), i]));
  const arr = items.map((it) => (typeof it === "string" ? { nombre: it, orden: undefined } : it));
  arr.sort((a, b) => {
    const ao = a.orden ?? Number.MAX_SAFE_INTEGER;
    const bo = b.orden ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return norm(a.nombre).localeCompare(norm(b.nombre), "es", { sensitivity: "base" });
  });
  const map: CategoriaOrdenMap = {};
  arr.forEach((it, i) => (map[norm(it.nombre)] = i));
  return map;
}

export function byCategoriaOrderFactory(map: CategoriaOrdenMap) {
  return (a: string, b: string) => {
    const ia = map[norm(a)], ib = map[norm(b)];
    const aKnown = ia !== undefined, bKnown = ib !== undefined;
    if (aKnown && bKnown) return ia - ib;
    if (aKnown) return -1;
    if (bKnown) return 1;
    return norm(a).localeCompare(norm(b), "es", { sensitivity: "base" });
  };
}
