import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { countries, countryIds } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JapanVatForm } from "@/components/calculator/JapanVatForm";
import { Card } from "@/components/ui/Card";
import type { VatData } from "@/calculators/japan/vat";
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
    title: `${countryName} VAT Calculator 2026 | Consumption Tax (消費税)`,
    description: `Calculate Japanese consumption tax (消費税) at 10% standard or 8% reduced rate. Add or remove tax instantly. Free calculator.`,
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {t("title", { country: tc(countryId), year: 2026 })}
      </h1>
      <p className="text-(--color-text-muted) mb-8">{t("description")}</p>

      <JapanVatForm vatData={vatData} />

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
          <p>{t("dataSource", { source: "National Tax Agency (国税庁)" })}</p>
          <p>{t("lastVerified", { date: vatData.lastVerified })}</p>
        </div>
      </Card>
    </div>
  );
}
