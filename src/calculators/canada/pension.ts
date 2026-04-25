export interface CanadaPensionData {
  taxYear: number;
  currency: string;
  cpp: {
    ympe: number;
    basicExemption: number;
    employeeRate: number;
    maxMonthlyBenefit: number;
    normalRetirementAge: number;
    earliestClaimAge: number;
    latestClaimAge: number;
    earlyClaimPenaltyPerMonth: number;
    deferralBonusPerMonth: number;
  };
  oas: {
    monthlyBase: number;
    monthlyAge75: number;
    clawbackThreshold: number;
    clawbackRate: number;
  };
  source: string;
  lastVerified: string;
}

export interface CanadaPensionInput {
  annualIncome: number;
  currentAge: number;
  contributedYears: number;
  claimAge: number;
}

export interface CanadaPensionResult {
  monthlyCpp: number;
  monthlyOas: number;
  totalMonthly: number;
  cppAdjustmentPercent: number;
  currentAnnualCppContribution: number;
}

export function calculateCanadaPension(
  input: CanadaPensionInput,
  data: CanadaPensionData
): CanadaPensionResult {
  const { annualIncome, claimAge } = input;
  const { cpp, oas } = data;

  // CPP benefit estimate based on income relative to YMPE
  const benefitRatio = Math.min(
    1,
    Math.max(0, (annualIncome - cpp.basicExemption) / (cpp.ympe - cpp.basicExemption))
  );
  const baseBenefit = cpp.maxMonthlyBenefit * benefitRatio;

  // Early/late claiming adjustment
  const monthsFromNormal = (claimAge - cpp.normalRetirementAge) * 12;
  let cppAdjustmentPercent: number;
  if (monthsFromNormal < 0) {
    // Early claim: penalty of 0.6% per month
    cppAdjustmentPercent = monthsFromNormal * cpp.earlyClaimPenaltyPerMonth;
  } else if (monthsFromNormal > 0) {
    // Deferred claim: bonus of 0.7% per month
    cppAdjustmentPercent = monthsFromNormal * cpp.deferralBonusPerMonth;
  } else {
    cppAdjustmentPercent = 0;
  }

  const monthlyCpp = Math.round(baseBenefit * (1 + cppAdjustmentPercent));

  // OAS monthly base at 65
  const monthlyOas = Math.round(oas.monthlyBase);

  // Total monthly pension
  const totalMonthly = monthlyCpp + monthlyOas;

  // Current annual CPP contribution
  const pensionableEarnings = Math.min(annualIncome, cpp.ympe) - cpp.basicExemption;
  const currentAnnualCppContribution = Math.round(
    Math.max(0, pensionableEarnings) * cpp.employeeRate
  );

  return {
    monthlyCpp,
    monthlyOas,
    totalMonthly,
    cppAdjustmentPercent,
    currentAnnualCppContribution,
  };
}
