import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JapanPensionForm } from "@/components/calculator/JapanPensionForm";
import { GermanyPensionForm } from "@/components/calculator/GermanyPensionForm";
import { BrazilPensionForm } from "@/components/calculator/BrazilPensionForm";
import { IndiaPensionForm } from "@/components/calculator/IndiaPensionForm";
import { CanadaPensionForm } from "@/components/calculator/CanadaPensionForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { alternateLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("pension"))
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
  const tj = await getTranslations({ locale, namespace: `${countryId}.pension` });
  const countryName = tc(countryId);
  return {
    title: `${countryName} Pension Calculator 2026 | CalcHub`,
    description: tj("description"),
    alternates: alternateLanguages(`/${locale}/${countryId}/pension`),
  };
}

export default async function PensionPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("pension")) notFound();

  setRequestLocale(locale);

  const pensionData = (
    await import(`../../../../../data/${countryId}/2026/pension.json`)
  ).default;

  const tj = await getTranslations({ locale, namespace: `${countryId}.pension` });
  const tc = await getTranslations({ locale, namespace: "country" });
  const countryName = tc(countryId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} Pension Calculator 2026`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/pension`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: country.currency },
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {tj("title", { year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">{tj("description")}</p>

      {countryId === "japan" && <JapanPensionForm pensionData={pensionData} />}
      {countryId === "germany" && <GermanyPensionForm pensionData={pensionData} />}
      {countryId === "brazil" && <BrazilPensionForm pensionData={pensionData} />}
      {countryId === "india" && <IndiaPensionForm pensionData={pensionData} />}
      {countryId === "canada" && <CanadaPensionForm pensionData={pensionData} />}

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {countryName} Pension System
        </h2>
        <div className="prose prose-sm text-(--color-text-muted) max-w-none">
          {tj("howItWorksContent")
            .split("\n\n")
            .map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-(--color-border) text-xs text-(--color-text-muted)">
          <p>{tj("dataSource", { source: pensionData.source })}</p>
          <p>{tj("lastVerified", { date: pensionData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
