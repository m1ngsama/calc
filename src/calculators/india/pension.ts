export interface IndiaPensionData {
  eps: {
    pensionableSalaryCap: number; // 15000
    divisor: number; // 70
    minimumPension: number; // 1000
    bonusYearsThreshold: number; // 20
    bonusYears: number; // 2
    minimumServiceYears: number; // 10
  };
  epf: {
    employeeRate: number; // 0.12
    epsRate: number; // 0.0833
    interestRate: number; // 0.0825
  };
  retirementAge: number; // 58
  source: string;
  lastVerified: string;
}

export interface IndiaPensionInput {
  monthlySalary: number; // Basic + DA
  currentAge: number;
  serviceYears: number;
}

export interface IndiaPensionResult {
  monthlyPension: number;
  epfCorpus: number;
  pensionableSalary: number;
  pensionableService: number;
  monthlyEpfContribution: number;
}

export function calculateIndiaPension(
  input: IndiaPensionInput,
  data: IndiaPensionData
): IndiaPensionResult {
  const { monthlySalary, currentAge, serviceYears } = input;
  const { eps, epf, retirementAge } = data;

  // Pensionable salary is capped at EPS limit
  const pensionableSalary = Math.min(monthlySalary, eps.pensionableSalaryCap);

  // Future service years remaining until retirement
  const futureServiceYears = Math.max(0, retirementAge - currentAge);

  // Total service (past + future)
  const totalService = serviceYears + futureServiceYears;

  // Bonus years for 20+ years of service
  const bonusYears = totalService >= eps.bonusYearsThreshold ? eps.bonusYears : 0;

  // Pensionable service including bonus
  const pensionableService = totalService + bonusYears;

  // Monthly EPS pension (zero if minimum service not met)
  let monthlyPension = 0;
  if (totalService >= eps.minimumServiceYears) {
    monthlyPension = (pensionableSalary * pensionableService) / eps.divisor;
    monthlyPension = Math.max(monthlyPension, eps.minimumPension);
  }
  monthlyPension = Math.round(monthlyPension);

  // Monthly EPF employee contribution
  const monthlyEpfContribution = Math.round(monthlySalary * epf.employeeRate);

  // EPF corpus using future value of annuity formula
  // FV = PMT * [((1+r)^n - 1) / r]
  const r = epf.interestRate / 12; // monthly interest rate
  const fvAnnuity = (pmt: number, months: number): number => {
    if (months <= 0) return 0;
    if (r === 0) return pmt * months;
    return pmt * (((1 + r) ** months - 1) / r);
  };

  // Estimate existing corpus from past service years
  const pastMonths = serviceYears * 12;
  const existingCorpus = fvAnnuity(monthlyEpfContribution, pastMonths);

  // Grow existing corpus to retirement
  const futureMonths = futureServiceYears * 12;
  const grownExistingCorpus = existingCorpus * (1 + r) ** futureMonths;

  // Future value of contributions from now until retirement
  const futureContributions = fvAnnuity(monthlyEpfContribution, futureMonths);

  const epfCorpus = Math.round(grownExistingCorpus + futureContributions);

  return {
    monthlyPension,
    epfCorpus,
    pensionableSalary: Math.round(pensionableSalary),
    pensionableService: Math.round(pensionableService),
    monthlyEpfContribution,
  };
}
