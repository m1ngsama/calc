import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-(--color-navy) mb-4">404</h1>
      <p className="text-lg text-(--color-text-muted) mb-8">{t("message")}</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg bg-(--color-navy) text-white font-medium hover:opacity-90 transition-opacity"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
