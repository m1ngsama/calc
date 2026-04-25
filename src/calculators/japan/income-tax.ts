import type { IncomeTaxData, TaxResult } from "@/lib/types";

function calcEmploymentDeduction(income: number, data: IncomeTaxData): number {
  if (income <= 0) return 0;
  const tiers = data.deductions.employment;
  for (const tier of tiers) {
    if (tier.max === null || income <= tier.max) {
      return Math.min(income, tier.rate * income + tier.base);
    }
  }
  const last = tiers[tiers.length - 1];
  return last.base;
}

function calcProgressiveTax(taxableIncome: number, data: IncomeTaxData): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const bracket of data.brackets) {
    const lower = bracket.min;
    const upper = bracket.max ?? Infinity;
    if (taxableIncome <= lower) break;
    const taxableInBracket = Math.min(taxableIncome, upper) - lower;
    tax += taxableInBracket * bracket.rate;
  }
  return Math.floor(tax);
}

export function calculateJapanIncomeTax(
  grossIncome: number,
  data: IncomeTaxData
): TaxResult {
  if (grossIncome <= 0) {
    return {
      grossIncome: 0,
      employmentDeduction: 0,
      basicDeduction: 0,
      taxableIncome: 0,
      incomeTax: 0,
      reconstructionTax: 0,
      residenceTax: 0,
      healthInsurance: 0,
      pension: 0,
      employmentInsurance: 0,
      totalDeductions: 0,
      takeHomePay: 0,
      effectiveRate: 0,
    };
  }

  const si = data.socialInsurance;
  const healthInsurance = Math.min(
    Math.floor(grossIncome * si.healthInsuranceRate),
    si.healthInsuranceMax
  );
  const pension = Math.min(
    Math.floor(grossIncome * si.pensionRate),
    si.pensionMax
  );
  const employmentInsurance = Math.floor(grossIncome * si.employmentInsuranceRate);

  const totalSocialInsurance = healthInsurance + pension + employmentInsurance;

  const employmentDeduction = calcEmploymentDeduction(grossIncome, data);
  const basicDeduction = data.deductions.basic;
  const taxableIncome = Math.max(
    0,
    grossIncome - totalSocialInsurance - employmentDeduction - basicDeduction
  );

  const incomeTax = calcProgressiveTax(taxableIncome, data);
  const reconstructionTax = Math.floor(incomeTax * data.reconstructionTaxRate);
  const residenceTax = Math.floor(taxableIncome * data.residenceTaxRate);

  const totalDeductions =
    incomeTax + reconstructionTax + residenceTax + healthInsurance + pension + employmentInsurance;
  const takeHomePay = grossIncome - totalDeductions;
  const effectiveRate = grossIncome > 0 ? totalDeductions / grossIncome : 0;

  return {
    grossIncome,
    employmentDeduction,
    basicDeduction,
    taxableIncome,
    incomeTax,
    reconstructionTax,
    residenceTax,
    healthInsurance,
    pension,
    employmentInsurance,
    totalDeductions,
    takeHomePay,
    effectiveRate,
  };
}
