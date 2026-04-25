export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatNumber(
  num: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(num);
}
