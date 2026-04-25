import type { CountryMeta } from "./types";

export const countries: Record<string, CountryMeta> = {
  japan: {
    id: "japan",
    currency: "JPY",
    currencySymbol: "¥",
    fiscalYearStart: "01-01",
    locale: "ja-JP",
    flag: "🇯🇵",
    calculators: ["income-tax", "salary", "mortgage", "vat", "pension", "currency"],
  },
};

export const countryIds = Object.keys(countries);

export function getCountry(id: string): CountryMeta | undefined {
  return countries[id];
}
