import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

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
  const countryName = tc(countryId);
  return {
    title: `${countryName} Calculators | CalcHub`,
    description: `Free financial calculators for ${countryName}. Income tax, salary, mortgage, and more.`,
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

  const calculatorLabels: Record<string, string> = {
    "income-tax": tcalc("incometax"),
    salary: tcalc("salary"),
    mortgage: tcalc("mortgage"),
    vat: tcalc("vat"),
    pension: tcalc("pension"),
    currency: tcalc("currency"),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {country.flag} {tc(countryId)}
      </h1>
      <p className="text-(--color-text-muted) mb-8">
        {country.currency} &middot; Financial Calculators
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {country.calculators.map((calc) => (
          <Link
            key={calc}
            href={`/${locale}/${countryId}/${calc}`}
            className="p-5 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) transition-colors"
          >
            <span className="font-semibold text-(--color-text)">
              {calculatorLabels[calc] ?? calc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
