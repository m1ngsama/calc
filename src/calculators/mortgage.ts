export interface MortgageInput {
  principal: number;
  annualRate: number;
  termYears: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: YearSummary[];
}

export interface YearSummary {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { principal, annualRate, termYears } = input;

  if (principal <= 0 || annualRate <= 0 || termYears <= 0) {
    return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0, schedule: [] };
  }

  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
    (Math.pow(1 + monthlyRate, totalPayments) - 1);

  const schedule: YearSummary[] = [];
  let balance = principal;

  for (let year = 1; year <= termYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 0; month < 12; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      yearInterest += interestPayment;
      yearPrincipal += principalPayment;
      balance -= principalPayment;
    }

    schedule.push({
      year,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      remainingBalance: Math.max(0, Math.round(balance)),
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(monthlyPayment * totalPayments),
    totalInterest: Math.round(monthlyPayment * totalPayments - principal),
    schedule,
  };
}
