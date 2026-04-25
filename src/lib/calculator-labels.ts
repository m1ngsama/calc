export function getCalculatorLabels(
  tcalc: (key: string) => string
): Record<string, string> {
  return {
    "income-tax": tcalc("incometax"),
    salary: tcalc("salary"),
    mortgage: tcalc("mortgage"),
    vat: tcalc("vat"),
    pension: tcalc("pension"),
    currency: tcalc("currency"),
  };
}
