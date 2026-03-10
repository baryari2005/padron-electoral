export const pct = (n: number, d: number) =>
    (d > 0 ? +((n / d) * 100).toFixed(1) : 0);