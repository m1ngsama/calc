import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countries } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { alternateLanguages } from "@/lib/seo";
import { calcKeyMap } from "@/lib/calculator-labels";
import type { Metadata } from "next";

const VALID_TYPES = [
  "income-tax",
  "salary",
  "mortgage",
  "vat",
  "pension",
  "currency",
] as const;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    VALID_TYPES.map((type) => ({ locale, type }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale, type } = await params;
  const tcalc = await getTranslations({ locale, namespace: "calculator" });
  const th = await getTranslations({ locale, namespace: "home" });
  const calcName = tcalc(calcKeyMap[type] ?? type);
  return {
    title: calcName,
    description: th("hubDescription", { calculator: calcName }),
    alternates: alternateLanguages(`/${locale}/calculators/${type}`),
  };
}

export default async function CalculatorHubPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) notFound();

  setRequestLocale(locale);

  const tcalc = await getTranslations({ locale, namespace: "calculator" });
  const tc = await getTranslations({ locale, namespace: "country" });
  const th = await getTranslations({ locale, namespace: "home" });

  const calcName = tcalc(calcKeyMap[type]);

  const countriesWithCalc = Object.values(countries).filter((c) =>
    c.calculators.includes(type)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "CalcHub", href: `/${locale}` },
          { label: calcName, href: `/${locale}/calculators/${type}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: calcName,
          url: `https://calc.m1ng.space/${locale}/calculators/${type}`,
          description: th("hubDescription", { calculator: calcName }),
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />

      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">{calcName}</h1>
      <p className="text-(--color-text-muted) mb-10">
        {th("hubDescription", { calculator: calcName })}
      </p>

      <h2 className="text-lg font-semibold text-(--color-text) mb-4">
        {th("allCountries")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {countriesWithCalc.map((country) => (
          <Link
            key={country.id}
            href={`/${locale}/${country.id}/${type}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) transition-colors"
          >
            <span className="text-3xl">{country.flag}</span>
            <div>
              <span className="font-semibold text-(--color-text)">
                {tc(country.id)}
              </span>
              <span className="block text-xs text-(--color-text-muted)">
                {country.currency}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
