"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  locale: Locale;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const otherLocale: Locale = locale === "en" ? "zh" : "en";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="border-b border-(--color-border) bg-(--color-surface)">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-lg font-bold text-(--color-navy)"
        >
          CalcHub
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            className="text-sm text-(--color-text-muted) hover:text-(--color-text)"
          >
            {t("home")}
          </Link>
          <ThemeToggle />
          <Link
            href={switchedPath || `/${otherLocale}`}
            className="text-sm px-3 py-1.5 rounded-md bg-(--color-surface-alt) text-(--color-text-muted) hover:text-(--color-text)"
          >
            {otherLocale === "zh" ? "中文" : "EN"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
