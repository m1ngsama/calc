export interface VatData {
  standardRate: number;
  reducedRate: number;
  source: string;
  lastVerified: string;
}

export interface VatResult {
  preTaxAmount: number;
  taxAmount: number;
  totalAmount: number;
  rate: number;
}

export function calculateVat(
  amount: number,
  rate: number,
  operation: "add" | "remove"
): VatResult {
  if (amount <= 0 || rate <= 0) {
    return { preTaxAmount: 0, taxAmount: 0, totalAmount: 0, rate };
  }

  if (operation === "add") {
    const taxAmount = Math.floor(amount * rate);
    return {
      preTaxAmount: amount,
      taxAmount,
      totalAmount: amount + taxAmount,
      rate,
    };
  }

  // remove: extract tax from tax-inclusive amount
  const preTaxAmount = Math.floor(amount / (1 + rate));
  const taxAmount = amount - preTaxAmount;
  return {
    preTaxAmount,
    taxAmount,
    totalAmount: amount,
    rate,
  };
}
