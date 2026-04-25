export interface GermanyTaxData {
  taxYear: number;
  currency: string;
  zones: Array<{
    id: number;
    min: number;
    max: number | null;
    type: "zero" | "progressive" | "linear";
    baseOffset?: number;
    divisor?: number;
    a?: number;
    b?: number;
    c?: number;
    rate?: number;
    offset?: number;
  }>;
  solidaritySurcharge: {
    rate: number;
    exemptionThreshold: number;
    mitigationCeiling: number;
    mitigationRate: number;
  };
  churchTax: {
    standardRate: number;
    bavariaRate: number;
  };
  socialInsurance: {
    healthInsurance: { employeeRate: number; supplementaryRate: number; annualCeiling: number };
    pensionInsurance: { employeeRate: number; annualCeiling: number };
    unemploymentInsurance: { employeeRate: number; annualCeiling: number };
    longTermCareInsurance: { employeeRate: number; childlessSurcharge: number; annualCeiling: number };
  };
  source: string;
  lastVerified: string;
}

export interface GermanyTaxInput {
  annualIncome: number;
  churchMember: boolean;
  hasChildren: boolean;
}

export interface GermanyTaxResult {
  incomeTax: number;
  solidaritySurcharge: number;
  churchTax: number;
  healthInsurance: number;
  pensionInsurance: number;
  unemploymentInsurance: number;
  longTermCareInsurance: number;
  totalSocialInsurance: number;
  totalDeductions: number;
  netIncome: number;
  effectiveRate: number;
}

function calcIncomeTax(zve: number, data: GermanyTaxData): number {
  if (zve <= 0) return 0;

  for (const zone of data.zones) {
    const upper = zone.max ?? Infinity;
    if (zve > upper) continue;

    if (zone.type === "zero") {
      return 0;
    }

    if (zone.type === "progressive") {
      const variable = (zve - zone.baseOffset!) / zone.divisor!;
      return Math.floor((zone.a! * variable + zone.b!) * variable + zone.c!);
    }

    if (zone.type === "linear") {
      return Math.floor(zone.rate! * zve - zone.offset!);
    }
  }

  return 0;
}

function calcSolidaritySurcharge(incomeTax: number, data: GermanyTaxData): number {
  const { rate, exemptionThreshold, mitigationCeiling, mitigationRate } = data.solidaritySurcharge;

  if (incomeTax <= exemptionThreshold) return 0;

  if (incomeTax <= mitigationCeiling) {
    return Math.floor(Math.min(rate * incomeTax, mitigationRate * (incomeTax - exemptionThreshold)));
  }

  return Math.floor(rate * incomeTax);
}

export function calculateGermanyIncomeTax(
  input: GermanyTaxInput,
  data: GermanyTaxData
): GermanyTaxResult {
  const { annualIncome, churchMember, hasChildren } = input;

  if (annualIncome <= 0) {
    return {
      incomeTax: 0,
      solidaritySurcharge: 0,
      churchTax: 0,
      healthInsurance: 0,
      pensionInsurance: 0,
      unemploymentInsurance: 0,
      longTermCareInsurance: 0,
      totalSocialInsurance: 0,
      totalDeductions: 0,
      netIncome: 0,
      effectiveRate: 0,
    };
  }

  const si = data.socialInsurance;

  // Social insurance — calculated on gross, deducted before income tax
  const healthInsurance = Math.floor(
    Math.min(annualIncome, si.healthInsurance.annualCeiling) *
      (si.healthInsurance.employeeRate + si.healthInsurance.supplementaryRate)
  );

  const pensionInsurance = Math.floor(
    Math.min(annualIncome, si.pensionInsurance.annualCeiling) *
      si.pensionInsurance.employeeRate
  );

  const unemploymentInsurance = Math.floor(
    Math.min(annualIncome, si.unemploymentInsurance.annualCeiling) *
      si.unemploymentInsurance.employeeRate
  );

  const ltcRate =
    si.longTermCareInsurance.employeeRate +
    (hasChildren ? 0 : si.longTermCareInsurance.childlessSurcharge);
  const longTermCareInsurance = Math.floor(
    Math.min(annualIncome, si.longTermCareInsurance.annualCeiling) * ltcRate
  );

  const totalSocialInsurance =
    healthInsurance + pensionInsurance + unemploymentInsurance + longTermCareInsurance;

  // zvE = taxable income after social insurance deduction
  const zve = Math.max(0, annualIncome - totalSocialInsurance);

  const incomeTax = calcIncomeTax(zve, data);
  const solidaritySurcharge = calcSolidaritySurcharge(incomeTax, data);
  const churchTax = churchMember
    ? Math.floor(data.churchTax.standardRate * incomeTax)
    : 0;

  const totalDeductions =
    incomeTax + solidaritySurcharge + churchTax + totalSocialInsurance;
  const netIncome = annualIncome - totalDeductions;
  const effectiveRate = annualIncome > 0 ? totalDeductions / annualIncome : 0;

  return {
    incomeTax,
    solidaritySurcharge,
    churchTax,
    healthInsurance,
    pensionInsurance,
    unemploymentInsurance,
    longTermCareInsurance,
    totalSocialInsurance,
    totalDeductions,
    netIncome,
    effectiveRate,
  };
}
