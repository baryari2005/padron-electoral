export function mergeAndWhere<T extends { AND?: any }>(
  base: T,
  extra: { AND?: any }
): T {
  const baseAnd = Array.isArray(base.AND) ? base.AND : base.AND ? [base.AND] : [];
  const extraAnd = Array.isArray(extra.AND) ? extra.AND : extra.AND ? [extra.AND] : [];
  return { ...base, AND: [...baseAnd, ...extraAnd] };
}