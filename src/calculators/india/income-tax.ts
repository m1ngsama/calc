export interface IndiaTaxData {
  brackets: Array<{ min: number; max: number | null; rate: number }>;
  standardDeduction: number;
  rebate87A: { incomeThreshold: number; maxRebate: number };
  surcharge: Array<{ min: number; max: number | null; rate: number }>;
  cessRate: number;
  epf: { employeeRate: number; wageThreshold: number };
  professionalTax: { annualMax: number };
  source: string;
  lastVerified: string;
}

export interface IndiaTaxInput {
  annualIncome: number;
}

export interface IndiaTaxResult {
  incomeTax: number;
  surcharge: number;
  cess: number;
  rebate87A: number;
  epf: number;
  professionalTax: number;
  totalDeductions: number;
  netIncome: number;
  effectiveRate: number;
}

export function calculateIndiaIncomeTax(
  input: IndiaTaxInput,
  data: IndiaTaxData
): IndiaTaxResult {
  const { annualIncome } = input;

  if (annualIncome <= 0) {
    return {
      incomeTax: 0,
      surcharge: 0,
      cess: 0,
      rebate87A: 0,
      epf: 0,
      professionalTax: 0,
      totalDeductions: 0,
      netIncome: 0,
      effectiveRate: 0,
    };
  }

  // EPF: 12% of annual income (simplified)
  const epf = Math.round(annualIncome * data.epf.employeeRate);

  // Professional tax: capped at annualMax (₹2500)
  const professionalTax = Math.round(Math.min(2500, data.professionalTax.annualMax));

  // Taxable income after standard deduction
  const taxableIncome = Math.max(0, annualIncome - data.standardDeduction);

  // Progressive tax calculation
  let incomeTax = 0;
  for (const bracket of data.brackets) {
    if (taxableIncome <= bracket.min) break;
    const upper = bracket.max ?? Infinity;
    const slice = Math.min(taxableIncome, upper) - bracket.min;
    if (slice > 0) {
      incomeTax += slice * bracket.rate;
    }
  }
  incomeTax = Math.round(incomeTax);

  // Section 87A rebate
  let rebate87A = 0;
  if (taxableIncome <= data.rebate87A.incomeThreshold) {
    rebate87A = Math.min(incomeTax, data.rebate87A.maxRebate);
  }
  incomeTax = Math.round(incomeTax - rebate87A);

  // Surcharge based on annualIncome
  let surchargeRate = 0;
  for (const bracket of data.surcharge) {
    const upper = bracket.max ?? Infinity;
    if (annualIncome > bracket.min && annualIncome <= upper) {
      surchargeRate = bracket.rate;
      break;
    }
  }
  const surcharge = Math.round(incomeTax * surchargeRate);

  // Health & Education Cess at 4%
  const cess = Math.round((incomeTax + surcharge) * data.cessRate);

  const totalDeductions = incomeTax + surcharge + cess + epf + professionalTax;
  const netIncome = annualIncome - totalDeductions;
  const effectiveRate = annualIncome > 0 ? totalDeductions / annualIncome : 0;

  return {
    incomeTax,
    surcharge,
    cess,
    rebate87A,
    epf,
    professionalTax,
    totalDeductions,
    netIncome,
    effectiveRate,
  };
}
