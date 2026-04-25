import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { VatForm } from "@/components/calculator/VatForm";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { alternateLanguages } from "@/lib/seo";
import type { VatData } from "@/calculators/vat";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    countryIds
      .filter((c) => countries[c].calculators.includes("vat"))
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
    title: `${countryName} VAT / Sales Tax Calculator 2026 | CalcHub`,
    description: `Calculate VAT and sales tax in ${countryName}. Add or remove tax instantly based on official rates. Free calculator.`,
    alternates: alternateLanguages(`/${locale}/${countryId}/vat`),
  };
}

export default async function VatPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countryId } = await params;
  const country = countries[countryId];
  if (!country || !country.calculators.includes("vat")) notFound();

  setRequestLocale(locale);

  const vatData: VatData = (
    await import(`../../../../../data/${countryId}/2026/vat.json`)
  ).default;

  const t = await getTranslations({ locale, namespace: "vat" });
  const tj = await getTranslations({ locale, namespace: `${countryId}.vat` });
  const tc = await getTranslations({ locale, namespace: "country" });

  const countryName = tc(countryId);
  const tcalc = await getTranslations({ locale, namespace: "calculator" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: "CalcHub", href: `/${locale}` },
          { label: countryName, href: `/${locale}/${countryId}` },
          { label: tcalc("vat"), href: `/${locale}/${countryId}/vat` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${countryName} VAT Calculator 2026`,
          url: `https://calc.m1ng.space/${locale}/${countryId}/vat`,
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

      <VatForm vatData={vatData} currency={country.currency} currencySymbol={country.currencySymbol} />

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
          <p>{t("dataSource", { source: vatData.source })}</p>
          <p>{t("lastVerified", { date: vatData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
