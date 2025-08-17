export const DEFAULT_MAX_LIMIT = 100;

export function parsePositiveInt(value: string | null | undefined, def: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export function getPagination(
  searchParams: URLSearchParams,
  defPage = 1,
  defLimit = 10,
  maxLimit = DEFAULT_MAX_LIMIT
) {
  const page = parsePositiveInt(searchParams.get("page"), defPage);
  const rawLimit = parsePositiveInt(searchParams.get("limit"), defLimit);
  const limit = Math.min(rawLimit, maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}