import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JapanIncomeTaxForm } from "@/components/calculator/JapanIncomeTaxForm";
import { GermanyIncomeTaxForm } from "@/components/calculator/GermanyIncomeTaxForm";
import { BrazilIncomeTaxForm } from "@/components/calculator/BrazilIncomeTaxForm";
import { IndiaIncomeTaxForm } from "@/components/calculator/IndiaIncomeTaxForm";
import { CanadaIncomeTaxForm } from "@/components/calculator/CanadaIncomeTaxForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { alternateLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("income-tax"))
      .map((country) => ({ locale, country }))
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
    title: `${countryName} Income Tax Calculator 2026 | Free & Accurate | CalcHub`,
    description: `Calculate your ${countryName} income tax for 2026. Based on official government tax brackets. Free, private, no signup required.`,
    alternates: alternateLanguages(`/${locale}/${countryId}/income-tax`),
  };
}

export default async function IncomeTaxPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("income-tax")) notFound();

  setRequestLocale(locale);

  const taxData = (
    await import(`../../../../../data/${countryId}/2026/income-tax.json`)
  ).default;

  const t = await getTranslations({ locale, namespace: `${countryId}.incomeTax` });
  const tc = await getTranslations({ locale, namespace: "country" });
  const countryName = tc(countryId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} Income Tax Calculator 2026`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/income-tax`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: country.currency },
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {t("title", { year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">{t("description")}</p>

      {countryId === "japan" && <JapanIncomeTaxForm taxData={taxData} />}
      {countryId === "germany" && <GermanyIncomeTaxForm taxData={taxData} />}
      {countryId === "brazil" && <BrazilIncomeTaxForm taxData={taxData} />}
      {countryId === "india" && <IndiaIncomeTaxForm taxData={taxData} />}
      {countryId === "canada" && <CanadaIncomeTaxForm taxData={taxData} />}

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {t("howItWorks")}
        </h2>
        <div className="prose prose-sm text-(--color-text-muted) max-w-none">
          {t("howItWorksContent")
            .split("\n\n")
            .map((paragraph: string, i: number) => (
              <p key={i}>{paragraph}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-(--color-border) text-xs text-(--color-text-muted)">
          <p>{t("dataSource")}</p>
          <p>{t("lastVerified", { date: taxData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
