export interface PensionData {
  kokumin: {
    monthlyContribution: number;
    maxContributionMonths: number;
    fullAnnualBenefit: number;
    earlyClaimPenaltyPerMonth: number;
    deferralBonusPerMonth: number;
  };
  kousei: {
    employeeRate: number;
    remunerationCap: number;
    accrualRate: number;
  };
  normalRetirementAge: number;
  source: string;
  lastVerified: string;
}

export interface PensionInput {
  pensionType: "kokumin" | "kousei"; // kousei includes kokumin
  currentAge: number;
  annualIncome: number; // only used for kousei
  contributedYears: number;
  claimAge: number; // 60-75
}

export interface PensionResult {
  kokuminMonthlyBenefit: number;
  kokuminAnnualBenefit: number;
  kouseiMonthlyBenefit: number;
  kouseiAnnualBenefit: number;
  totalMonthlyBenefit: number;
  totalAnnualBenefit: number;
  monthlyContribution: number;
  totalLifetimeContributions: number;
  claimAgeAdjustment: number; // multiplier, e.g. 1.42 for deferral to 70
}

export function calculatePension(
  input: PensionInput,
  data: PensionData
): PensionResult {
  const { pensionType, currentAge, annualIncome, contributedYears, claimAge } =
    input;
  const { kokumin, kousei, normalRetirementAge } = data;

  // --- Kokumin (basic/national pension) ---
  // Already-contributed months + remaining months to age 60 (capped at 480)
  const alreadyContributedMonths = contributedYears * 12;
  const remainingMonthsTo60 = Math.max(0, (60 - currentAge) * 12);
  const totalKokuminMonths = Math.min(
    alreadyContributedMonths + remainingMonthsTo60,
    kokumin.maxContributionMonths
  );

  const kokuminAnnualBenefitBase = Math.floor(
    kokumin.fullAnnualBenefit * (totalKokuminMonths / kokumin.maxContributionMonths)
  );

  // --- Kousei (employees' pension) ---
  let kouseiAnnualBenefitBase = 0;
  let standardMonthlyRemuneration = 0;

  if (pensionType === "kousei") {
    standardMonthlyRemuneration = Math.min(
      Math.round(annualIncome / 12 / 1000) * 1000,
      kousei.remunerationCap
    );
    const remainingMonthsTo65 = Math.max(
      0,
      (normalRetirementAge - currentAge) * 12
    );
    const totalKouseiMonths = alreadyContributedMonths + remainingMonthsTo65;
    kouseiAnnualBenefitBase = Math.floor(
      standardMonthlyRemuneration * kousei.accrualRate * totalKouseiMonths
    );
  }

  // --- Claim age adjustment ---
  let claimAgeAdjustment = 1.0;
  if (claimAge < normalRetirementAge) {
    const monthsEarly = (normalRetirementAge - claimAge) * 12;
    claimAgeAdjustment = 1 - kokumin.earlyClaimPenaltyPerMonth * monthsEarly;
  } else if (claimAge > normalRetirementAge) {
    const monthsLate = (claimAge - normalRetirementAge) * 12;
    claimAgeAdjustment = 1 + kokumin.deferralBonusPerMonth * monthsLate;
  }

  const kokuminAnnualBenefit = Math.floor(
    kokuminAnnualBenefitBase * claimAgeAdjustment
  );
  const kokuminMonthlyBenefit = Math.floor(kokuminAnnualBenefit / 12);

  const kouseiAnnualBenefit = Math.floor(
    kouseiAnnualBenefitBase * claimAgeAdjustment
  );
  const kouseiMonthlyBenefit = Math.floor(kouseiAnnualBenefit / 12);

  const totalAnnualBenefit = kokuminAnnualBenefit + kouseiAnnualBenefit;
  const totalMonthlyBenefit = Math.floor(totalAnnualBenefit / 12);

  // --- Monthly contribution ---
  let monthlyContribution: number;
  if (pensionType === "kousei") {
    monthlyContribution = Math.floor(
      standardMonthlyRemuneration * kousei.employeeRate
    );
  } else {
    monthlyContribution = kokumin.monthlyContribution;
  }

  // --- Total lifetime contributions (future contributions only) ---
  const futureContributionMonths = remainingMonthsTo60;
  const totalLifetimeContributions = Math.floor(
    monthlyContribution * futureContributionMonths
  );

  return {
    kokuminMonthlyBenefit,
    kokuminAnnualBenefit,
    kouseiMonthlyBenefit,
    kouseiAnnualBenefit,
    totalMonthlyBenefit,
    totalAnnualBenefit,
    monthlyContribution,
    totalLifetimeContributions,
    claimAgeAdjustment,
  };
}
