export interface BrazilPensionData {
  minimumPension: number;      // R$1,518
  maximumPension: number;      // R$7,786.02
  contributionCeiling: number; // R$8,157.41
  retirementAge: { men: number; women: number };
  minimumContributionYears: { men: number; women: number };
  baseAliquota: number;        // 0.60
  additionalPerYear: number;   // 0.02
  fullBenefitYears: { men: number; women: number };
  source: string;
  lastVerified: string;
}

export interface BrazilPensionInput {
  monthlyIncome: number;
  gender: "male" | "female";
  contributedYears: number;
  currentAge: number;
}

export interface BrazilPensionResult {
  monthlyBenefit: number;
  benefitRate: number;         // percentage (e.g. 0.80 for 80%)
  averageSalary: number;       // capped at ceiling
  totalContributionYears: number;
  retirementAge: number;
  monthlyContribution: number; // current INSS contribution
}

export function calculateBrazilPension(
  input: BrazilPensionInput,
  data: BrazilPensionData
): BrazilPensionResult {
  const { monthlyIncome, gender, contributedYears, currentAge } = input;
  const {
    minimumPension,
    maximumPension,
    contributionCeiling,
    retirementAge: retirementAges,
    minimumContributionYears,
    baseAliquota,
    additionalPerYear,
  } = data;

  const round2 = (x: number) => Math.round(x * 100) / 100;

  // INSS progressive monthly contribution
  const brackets: Array<[number, number, number]> = [
    [0, 1518, 0.075],
    [1518.01, 2793.88, 0.09],
    [2793.89, 4190.83, 0.12],
    [4190.84, 8157.41, 0.14],
  ];

  let monthlyContribution = 0;
  for (const [low, high, rate] of brackets) {
    if (monthlyIncome > low) {
      const taxable = Math.min(monthlyIncome, high) - low;
      monthlyContribution += taxable * rate;
    }
  }
  monthlyContribution = round2(monthlyContribution);

  // Average salary capped at contribution ceiling
  const averageSalary = round2(Math.min(monthlyIncome, contributionCeiling));

  // Retirement age by gender
  const retirementAge = gender === "male" ? retirementAges.men : retirementAges.women;

  // Total contribution years (past + future until retirement)
  const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
  const totalContributionYears = contributedYears + yearsUntilRetirement;

  // Benefit rate: base + 2% per year above minimum contribution years
  const minYears =
    gender === "male"
      ? minimumContributionYears.men
      : minimumContributionYears.women;
  const extraYears = Math.max(0, totalContributionYears - minYears);
  const benefitRate = round2(Math.min(1.0, baseAliquota + extraYears * additionalPerYear));

  // Raw benefit clamped between minimum and maximum pension
  const rawBenefit = averageSalary * benefitRate;
  const monthlyBenefit = round2(
    Math.max(minimumPension, Math.min(maximumPension, rawBenefit))
  );

  return {
    monthlyBenefit,
    benefitRate,
    averageSalary,
    totalContributionYears,
    retirementAge,
    monthlyContribution,
  };
}
