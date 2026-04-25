import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { countries } from "@/lib/countries";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("siteName"),
    description: t("siteDescription"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "country" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CalcHub",
          url: "https://calc.m1ng.space",
          description: t("subtitle"),
          inLanguage: locale === "zh" ? "zh-CN" : "en",
        }}
      />
      <h1 className="text-3xl font-bold text-(--color-navy) mb-2">
        {t("title")}
      </h1>
      <p className="text-(--color-text-muted) mb-10">{t("subtitle")}</p>

      <h2 className="text-lg font-semibold text-(--color-text) mb-4">
        {t("pickCountry")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(countries).map((country) => (
          <Link
            key={country.id}
            href={`/${locale}/${country.id}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) transition-colors"
          >
            <span className="text-3xl">{country.flag}</span>
            <div>
              <span className="font-semibold text-(--color-text)">
                {tc(country.id)}
              </span>
              <span className="block text-xs text-(--color-text-muted)">
                {country.calculators.length} calculators
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
