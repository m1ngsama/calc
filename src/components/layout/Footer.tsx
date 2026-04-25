import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { countries } from "@/lib/countries";
import { calcKeyMap } from "@/lib/calculator-labels";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("country");
  const tcalc = useTranslations("calculator");
  const locale = useLocale();

  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface) mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {Object.values(countries).map((country) => (
            <div key={country.id}>
              <Link
                href={`/${locale}/${country.id}`}
                className="font-semibold text-sm text-(--color-text) hover:text-(--color-accent) transition-colors"
              >
                {country.flag} {tc(country.id)}
              </Link>
              <ul className="mt-2 space-y-1">
                {country.calculators.map((calc) => (
                  <li key={calc}>
                    <Link
                      href={`/${locale}/${country.id}/${calc}`}
                      className="text-xs text-(--color-text-muted) hover:text-(--color-accent) transition-colors"
                    >
                      {tcalc(calcKeyMap[calc])}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-(--color-border) pt-6 space-y-2">
          <p className="text-xs text-(--color-text-muted)">{t("disclaimer")}</p>
          <p className="text-xs text-(--color-text-muted)">{t("privacy")}</p>
          <p className="text-xs text-(--color-text-muted) mt-4">
            &copy; {new Date().getFullYear()} CalcHub
          </p>
        </div>
      </div>
    </footer>
  );
}
