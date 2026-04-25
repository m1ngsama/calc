export interface CanadaTaxData {
  taxYear: number;
  currency: string;
  federalBrackets: Array<{ min: number; max: number | null; rate: number }>;
  federalBPA: number;
  provincialBrackets: Array<{ min: number; max: number | null; rate: number }>;
  provincialBPA: number;
  province: string;
  ontarioSurtax: {
    tier1Threshold: number;
    tier1Rate: number;
    tier2Threshold: number;
    tier2Rate: number;
  };
  ontarioHealthPremium: Array<{ min: number; max: number | null; annual: number }>;
  cpp: {
    employeeRate: number;
    basicExemption: number;
    ympe: number;
    maxContribution: number;
  };
  cpp2: {
    employeeRate: number;
    yampe: number;
    maxContribution: number;
  };
  ei: {
    employeeRate: number;
    maximumInsurableEarnings: number;
    maxPremium: number;
  };
  source: string;
  lastVerified: string;
}

export interface CanadaTaxInput {
  annualIncome: number;
}

export interface CanadaTaxResult {
  federalTax: number;
  provincialTax: number;
  ontarioSurtax: number;
  ontarioHealthPremium: number;
  cppContribution: number;
  eiPremium: number;
  totalDeductions: number;
  netIncome: number;
  effectiveRate: number;
}

export function calculateCanadaIncomeTax(
  input: CanadaTaxInput,
  data: CanadaTaxData
): CanadaTaxResult {
  const { annualIncome } = input;

  if (annualIncome <= 0) {
    return {
      federalTax: 0,
      provincialTax: 0,
      ontarioSurtax: 0,
      ontarioHealthPremium: 0,
      cppContribution: 0,
      eiPremium: 0,
      totalDeductions: 0,
      netIncome: 0,
      effectiveRate: 0,
    };
  }

  // Federal tax: progressive brackets
  let federalGross = 0;
  for (const bracket of data.federalBrackets) {
    if (annualIncome <= bracket.min) break;
    const upper = bracket.max ?? Infinity;
    const slice = Math.min(annualIncome, upper) - bracket.min;
    if (slice > 0) {
      federalGross += slice * bracket.rate;
    }
  }
  // Subtract federal BPA non-refundable credit (15% of BPA)
  const federalCredit = data.federalBPA * data.federalBrackets[0].rate;
  const federalTax = Math.round(Math.max(0, federalGross - federalCredit));

  // Provincial tax: progressive brackets
  let provincialGross = 0;
  for (const bracket of data.provincialBrackets) {
    if (annualIncome <= bracket.min) break;
    const upper = bracket.max ?? Infinity;
    const slice = Math.min(annualIncome, upper) - bracket.min;
    if (slice > 0) {
      provincialGross += slice * bracket.rate;
    }
  }
  // Subtract provincial BPA non-refundable credit (lowest rate × BPA)
  const provincialCredit = data.provincialBPA * data.provincialBrackets[0].rate;
  const provincialTax = Math.round(Math.max(0, provincialGross - provincialCredit));

  // Ontario surtax
  let ontarioSurtax = 0;
  if (provincialTax > data.ontarioSurtax.tier1Threshold) {
    ontarioSurtax += (provincialTax - data.ontarioSurtax.tier1Threshold) * data.ontarioSurtax.tier1Rate;
  }
  if (provincialTax > data.ontarioSurtax.tier2Threshold) {
    ontarioSurtax += (provincialTax - data.ontarioSurtax.tier2Threshold) * data.ontarioSurtax.tier2Rate;
  }
  ontarioSurtax = Math.round(ontarioSurtax);

  // Ontario health premium: bracket lookup
  let ontarioHealthPremium = 0;
  for (const bracket of data.ontarioHealthPremium) {
    const upper = bracket.max ?? Infinity;
    if (annualIncome >= bracket.min && annualIncome <= upper) {
      ontarioHealthPremium = bracket.annual;
      break;
    }
  }

  // CPP contribution: 5.95% on earnings between basicExemption and ympe
  const cppPensionableEarnings = Math.max(0, Math.min(annualIncome, data.cpp.ympe) - data.cpp.basicExemption);
  const cppContribution = Math.round(
    Math.min(cppPensionableEarnings * data.cpp.employeeRate, data.cpp.maxContribution) * 100
  ) / 100;

  // EI premium: 1.64% on insurable earnings up to maximum
  const eiInsurableEarnings = Math.min(annualIncome, data.ei.maximumInsurableEarnings);
  const eiPremium = Math.round(
    Math.min(eiInsurableEarnings * data.ei.employeeRate, data.ei.maxPremium) * 100
  ) / 100;

  const totalDeductions = federalTax + provincialTax + ontarioSurtax + ontarioHealthPremium +
    Math.round(cppContribution) + Math.round(eiPremium);
  const netIncome = annualIncome - totalDeductions;
  const effectiveRate = annualIncome > 0 ? totalDeductions / annualIncome : 0;

  return {
    federalTax,
    provincialTax,
    ontarioSurtax,
    ontarioHealthPremium,
    cppContribution: Math.round(cppContribution),
    eiPremium: Math.round(eiPremium),
    totalDeductions,
    netIncome,
    effectiveRate,
  };
}
