export const calcKeyMap: Record<string, string> = {
  "income-tax": "incometax",
  salary: "salary",
  mortgage: "mortgage",
  vat: "vat",
  pension: "pension",
  currency: "currency",
};

export function getCalculatorLabels(
  tcalc: (key: string) => string
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(calcKeyMap).map(([slug, key]) => [slug, tcalc(key)])
  );
}
