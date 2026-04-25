import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { countries } from "@/lib/countries";

export const dynamic = "force-static";

const BASE_URL = "https://calc.m1ng.space";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });

    for (const [countryId, country] of Object.entries(countries)) {
      entries.push({
        url: `${BASE_URL}/${locale}/${countryId}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });

      for (const calc of country.calculators) {
        entries.push({
          url: `${BASE_URL}/${locale}/${countryId}/${calc}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.9,
        });
      }
    }
  }

  return entries;
}
