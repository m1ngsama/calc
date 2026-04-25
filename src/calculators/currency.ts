export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const MAJOR_CURRENCIES = [
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
] as const;

export async function fetchRates(base: string): Promise<ExchangeRates> {
  const res = await fetch(`https://api.frankfurter.app/latest?base=${base}`);
  if (!res.ok) throw new Error("Failed to fetch rates");
  return res.json();
}

export function convert(amount: number, fromRate: number, toRate: number): number {
  return amount * (toRate / fromRate);
}
