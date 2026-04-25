import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JapanSalaryForm } from "@/components/calculator/JapanSalaryForm";
import { GermanySalaryForm } from "@/components/calculator/GermanySalaryForm";
import { BrazilSalaryForm } from "@/components/calculator/BrazilSalaryForm";
import { IndiaSalaryForm } from "@/components/calculator/IndiaSalaryForm";
import { CanadaSalaryForm } from "@/components/calculator/CanadaSalaryForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { alternateLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("salary"))
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
    title: `${countryName} Salary Calculator 2026 | Take-Home Pay`,
    description: `Calculate your take-home salary in ${countryName} after income tax and social insurance. Free, accurate, based on official rates.`,
    alternates: alternateLanguages(`/${locale}/${countryId}/salary`),
  };
}

export default async function SalaryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("salary")) notFound();

  setRequestLocale(locale);

  const taxData = (
    await import(`../../../../../data/${countryId}/2026/income-tax.json`)
  ).default;

  const t = await getTranslations({ locale, namespace: "salary" });
  const tj = await getTranslations({ locale, namespace: `${countryId}.salary` });
  const tc = await getTranslations({ locale, namespace: "country" });

  const countryName = tc(countryId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} Salary Calculator 2026`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/salary`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: country.currency },
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {t("title", { country: countryName, year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">{t("description")}</p>

      {countryId === "japan" && <JapanSalaryForm taxData={taxData} />}
      {countryId === "germany" && <GermanySalaryForm taxData={taxData} />}
      {countryId === "brazil" && <BrazilSalaryForm taxData={taxData} />}
      {countryId === "india" && <IndiaSalaryForm taxData={taxData} />}
      {countryId === "canada" && <CanadaSalaryForm taxData={taxData} />}

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {t("howItWorks", { country: countryName })}
        </h2>
        <div className="prose prose-sm text-(--color-text-muted) max-w-none">
          {tj("howItWorksContent")
            .split("\n\n")
            .map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-(--color-border) text-xs text-(--color-text-muted)">
          <p>{t("dataSource", { source: taxData.source })}</p>
          <p>{t("lastVerified", { date: taxData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
