export interface GermanyPensionData {
  rentenwert: number;                    // €40.17 per point per month
  durchschnittsentgelt: number;          // €45,358 average earnings
  beitragsbemessungsgrenze: number;      // €96,600 contribution ceiling
  employeeRate: number;                  // 0.093 (9.3%)
  normalRetirementAge: number;           // 67
  earlyClaimPenaltyPerMonth: number;     // 0.003
  deferralBonusPerMonth: number;         // 0.005
  earliestClaimAge: number;              // 63
  source: string;
  lastVerified: string;
}

export interface GermanyPensionInput {
  annualIncome: number;
  currentAge: number;
  contributedYears: number;
  claimAge: number; // 63-75
}

export interface GermanyPensionResult {
  monthlyBenefit: number;
  annualBenefit: number;
  totalPoints: number;
  pointsPerYear: number;
  monthlyContribution: number;
  claimAgeAdjustment: number; // multiplier
}

export function calculateGermanyPension(
  input: GermanyPensionInput,
  data: GermanyPensionData
): GermanyPensionResult {
  const { annualIncome, currentAge, contributedYears, claimAge } = input;
  const {
    rentenwert,
    durchschnittsentgelt,
    beitragsbemessungsgrenze,
    employeeRate,
    normalRetirementAge,
    earlyClaimPenaltyPerMonth,
    deferralBonusPerMonth,
  } = data;

  const round2 = (x: number) => Math.round(x * 100) / 100;

  // Points earned per year based on income relative to average
  const cappedIncome = Math.min(annualIncome, beitragsbemessungsgrenze);
  const pointsPerYear = round2(cappedIncome / durchschnittsentgelt);

  // Past points (simplified: assume current income for all past years)
  const pastPoints = pointsPerYear * contributedYears;

  // Future years of contribution (up to normal retirement age)
  const futureYears = Math.max(
    0,
    Math.min(claimAge, normalRetirementAge) - currentAge
  );

  const totalPoints = round2(pastPoints + pointsPerYear * futureYears);

  // Access factor (Zugangsfaktor)
  let claimAgeAdjustment: number;
  if (claimAge === normalRetirementAge) {
    claimAgeAdjustment = 1.0;
  } else if (claimAge < normalRetirementAge) {
    const monthsEarly = (normalRetirementAge - claimAge) * 12;
    claimAgeAdjustment = 1.0 - monthsEarly * earlyClaimPenaltyPerMonth;
  } else {
    const monthsLate = (claimAge - normalRetirementAge) * 12;
    claimAgeAdjustment = 1.0 + monthsLate * deferralBonusPerMonth;
  }
  claimAgeAdjustment = round2(claimAgeAdjustment);

  // Monthly pension: points × access factor × 1.0 (type factor) × Rentenwert
  const monthlyBenefit = round2(totalPoints * claimAgeAdjustment * rentenwert);
  const annualBenefit = round2(monthlyBenefit * 12);

  // Monthly employee contribution
  const monthlyContribution = round2((cappedIncome / 12) * employeeRate);

  return {
    monthlyBenefit,
    annualBenefit,
    totalPoints,
    pointsPerYear,
    monthlyContribution,
    claimAgeAdjustment,
  };
}
