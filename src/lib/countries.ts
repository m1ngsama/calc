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
  germany: {
    id: "germany",
    currency: "EUR",
    currencySymbol: "€",
    fiscalYearStart: "01-01",
    locale: "de-DE",
    flag: "🇩🇪",
    calculators: ["income-tax", "salary", "mortgage", "vat", "pension", "currency"],
  },
  brazil: {
    id: "brazil",
    currency: "BRL",
    currencySymbol: "R$",
    fiscalYearStart: "01-01",
    locale: "pt-BR",
    flag: "🇧🇷",
    calculators: ["income-tax", "salary", "mortgage", "vat", "pension", "currency"],
  },
  india: {
    id: "india",
    currency: "INR",
    currencySymbol: "₹",
    fiscalYearStart: "04-01",
    locale: "en-IN",
    flag: "🇮🇳",
    calculators: ["income-tax", "salary", "mortgage", "vat", "pension", "currency"],
  },
};

export const countryIds = Object.keys(countries);

export function getCountry(id: string): CountryMeta | undefined {
  return countries[id];
}
