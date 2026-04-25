import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { alternateLanguages } from "@/lib/seo";
import type { Metadata } from "next";

const calculatorIcons: Record<string, string> = {
  "income-tax": "📊",
  salary: "💰",
  mortgage: "🏠",
  vat: "🧾",
  pension: "🏦",
  currency: "💱",
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds.map((country) => ({ locale, country }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}): Promise<Metadata> {
  const { locale, country: countryId } = await params;
  const tc = await getTranslations({ locale, namespace: "country" });
  const th = await getTranslations({ locale, namespace: "home" });
  const countryName = tc(countryId);
  return {
    title: th("countryTitle", { country: countryName }),
    description: th("countryDescription", { country: countryName }),
    alternates: alternateLanguages(`/${locale}/${countryId}`),
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country) notFound();

  setRequestLocale(locale);
  const tc = await getTranslations({ locale, namespace: "country" });
  const tcalc = await getTranslations({ locale, namespace: "calculator" });
  const th = await getTranslations({ locale, namespace: "home" });

  const calculatorLabels: Record<string, string> = {
    "income-tax": tcalc("incometax"),
    salary: tcalc("salary"),
    mortgage: tcalc("mortgage"),
    vat: tcalc("vat"),
    pension: tcalc("pension"),
    currency: tcalc("currency"),
  };

  const countryName = tc(countryId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${countryName} Financial Calculators`,
          url: `https://calc.m1ng.space/${locale}/${countryId}`,
          description: `Free financial calculators for ${countryName}`,
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {country.flag} {countryName}
      </h1>
      <p className="text-(--color-text-muted) mb-8">
        {country.currency} &middot; {th("financialCalculators")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {country.calculators.map((calc) => (
          <Link
            key={calc}
            href={`/${locale}/${countryId}/${calc}`}
            className="flex items-center gap-4 p-5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) hover:shadow-sm transition-all"
          >
            <span className="text-2xl">{calculatorIcons[calc] ?? "🔢"}</span>
            <span className="font-semibold text-(--color-text)">
              {calculatorLabels[calc] ?? calc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
