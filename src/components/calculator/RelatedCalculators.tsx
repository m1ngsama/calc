import Link from "next/link";

const icons: Record<string, string> = {
  "income-tax": "📊",
  salary: "💰",
  mortgage: "🏠",
  vat: "🧾",
  pension: "🏦",
  currency: "💱",
};

interface RelatedCalculatorsProps {
  locale: string;
  countryId: string;
  currentCalc: string;
  calculators: string[];
  labels: Record<string, string>;
}

export function RelatedCalculators({
  locale,
  countryId,
  currentCalc,
  calculators,
  labels,
}: RelatedCalculatorsProps) {
  const others = calculators.filter((c) => c !== currentCalc);
  if (others.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {others.map((calc) => (
          <Link
            key={calc}
            href={`/${locale}/${countryId}/${calc}`}
            className="flex items-center gap-2 p-3 rounded-lg border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) transition-colors text-sm"
          >
            <span>{icons[calc] ?? "🔢"}</span>
            <span className="text-(--color-text)">{labels[calc] ?? calc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
