import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JapanPensionForm } from "@/components/calculator/JapanPensionForm";
import { Card } from "@/components/ui/Card";
import type { PensionData } from "@/calculators/japan/pension";
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
  const countryName = tc(countryId);
  return {
    title: `${countryName} Pension Calculator 2026 | 年金`,
    description: `Estimate your future pension benefits from Japan's National Pension (国民年金) and Employees' Pension (厚生年金). Free calculator with claim age adjustment.`,
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

  const pensionData: PensionData = (
    await import(`../../../../../data/${countryId}/2026/pension.json`)
  ).default;

  const t = await getTranslations({ locale, namespace: "pension" });
  const tj = await getTranslations({ locale, namespace: `${countryId}.pension` });
  const tc = await getTranslations({ locale, namespace: "country" });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {t("title", { country: tc(countryId), year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">{t("description")}</p>

      <JapanPensionForm pensionData={pensionData} />

      <Card className="mt-8">
        <h2 className="text-lg font-semibold text-(--color-text) mb-3">
          {t("howItWorks", { country: tc(countryId) })}
        </h2>
        <div className="prose prose-sm text-(--color-text-muted) max-w-none">
          {tj("howItWorksContent")
            .split("\n\n")
            .map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t border-(--color-border) text-xs text-(--color-text-muted)">
          <p>{t("dataSource", { source: pensionData.source })}</p>
          <p>{t("lastVerified", { date: pensionData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
