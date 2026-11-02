export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const money = (n) => usd.format(Number.isFinite(n) ? n : 0);
export const percent = (n, digits = 1) =>
  `${(Number.isFinite(n) ? n * 100 : 0).toFixed(digits)}%`;
export const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
