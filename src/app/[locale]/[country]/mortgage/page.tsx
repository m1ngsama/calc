import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { MortgageForm } from "@/components/calculator/MortgageForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { alternateLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("mortgage"))
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
    title: `${countryName} Mortgage Calculator 2026 | Monthly Payment & Amortization`,
    description: `Calculate your mortgage payment in ${countryName}. See monthly payments, total interest, and full amortization schedule. Free, no signup.`,
    alternates: alternateLanguages(`/${locale}/${countryId}/mortgage`),
  };
}

export default async function MortgagePage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("mortgage")) notFound();

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mortgage" });
  const tc = await getTranslations({ locale, namespace: "country" });

  const countryName = tc(countryId);
  const tcalc = await getTranslations({ locale, namespace: "calculator" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "CalcHub", href: `/${locale}` },
          { label: countryName, href: `/${locale}/${countryId}` },
          { label: tcalc("mortgage"), href: `/${locale}/${countryId}/mortgage` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} Mortgage Calculator 2026`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/mortgage`,
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

      <MortgageForm currency={country.currency} currencySymbol={country.currencySymbol} />

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {t("howItWorks", { country: countryName })}
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
          <p>{t("lastVerified", { date: "2026-04-25" })}</p>
        </div>
      </Card>
    </div>
  );
}
