import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { CurrencyForm } from "@/components/calculator/CurrencyForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { alternateLanguages } from "@/lib/seo";
import { PrintButton } from "@/components/ui/PrintButton";
import { getCalculatorLabels } from "@/lib/calculator-labels";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("currency"))
      .map((country) => ({ locale, country }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}): Promise<Metadata> {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  const tc = await getTranslations({ locale, namespace: "country" });
  const t = await getTranslations({ locale, namespace: "currency" });
  const countryName = tc(countryId);
  return {
    title: t("title", { country: countryName, year: 2026 }),
    description: t("description", { currencyCode: country?.currency ?? "" }),
    alternates: alternateLanguages(`/${locale}/${countryId}/currency`),
  };
}

export default async function CurrencyPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("currency")) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "currency" });
  const tc = await getTranslations({ locale, namespace: "country" });
  const countryName = tc(countryId);
  const tcalc = await getTranslations({ locale, namespace: "calculator" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "CalcHub", href: `/${locale}` },
          { label: countryName, href: `/${locale}/${countryId}` },
          { label: tcalc("currency"), href: `/${locale}/${countryId}/currency` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} Currency Converter`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/currency`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: country.currency },
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-(--color-navy) mb-3">
        {t("title", { country: countryName, year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">
        {t("description", { currencyCode: country.currency })}
      </p>

      <CurrencyForm defaultCurrency={country.currency} />

      <div className="flex justify-end mt-4">
        <PrintButton />
      </div>

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {t("howItWorks")}
        </h2>
        <div className="prose prose-sm text-(--color-text-muted) max-w-none">
          {t("howItWorksContent")
            .split("\n\n")
            .map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-(--color-border) text-xs text-(--color-text-muted)">
          <p>{t("dataSource")}</p>
          <p>{t("lastVerified")}</p>
        </div>
      </Card>

      <RelatedCalculators
        locale={locale}
        countryId={countryId}
        currentCalc="currency"
        calculators={country.calculators}
        labels={getCalculatorLabels(tcalc)}
      />
    </div>
  );
}
