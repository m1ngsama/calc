import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface) mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-xs text-(--color-text-muted) mb-2">
          {t("disclaimer")}
        </p>
        <p className="text-xs text-(--color-text-muted)">
          {t("privacy")}
        </p>
        <p className="text-xs text-(--color-text-muted) mt-4">
          &copy; {new Date().getFullYear()} CalcHub
        </p>
      </div>
    </footer>
  );
}
