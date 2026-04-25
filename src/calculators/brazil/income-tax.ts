export interface BrazilTaxData {
  monthlyBrackets: Array<{ min: number; max: number | null; rate: number; deduction: number }>;
  dependentDeductionMonthly: number;
  socialInsurance: {
    type: string;
    brackets: Array<{ min: number; max: number; rate: number }>;
    ceiling: number;
  };
  source: string;
  lastVerified: string;
}

export interface BrazilTaxInput {
  monthlyIncome: number;
  dependents: number;
}

export interface BrazilTaxResult {
  inss: number;          // monthly INSS
  irpf: number;          // monthly IRPF
  totalDeductions: number;
  netIncome: number;     // monthly
  annualNet: number;
  effectiveRate: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcINSS(monthlyIncome: number, data: BrazilTaxData): number {
  // Progressive INSS: each slice of income is taxed at its own bracket rate.
  // The slice width for bracket i is: min(income, bracket[i].max) - bracket[i-1].max
  // (treating bracket[0] lower bound as 0).
  const brackets = data.socialInsurance.brackets;
  const income = Math.min(monthlyIncome, data.socialInsurance.ceiling);

  let total = 0;
  let prevMax = 0;

  for (const bracket of brackets) {
    if (income <= prevMax) break;

    const sliceTop = Math.min(income, bracket.max);
    const slice = sliceTop - prevMax;
    if (slice > 0) {
      total += slice * bracket.rate;
    }

    prevMax = bracket.max;
  }

  return round2(total);
}

export function calculateBrazilIncomeTax(input: BrazilTaxInput, data: BrazilTaxData): BrazilTaxResult {
  const { monthlyIncome, dependents } = input;

  if (monthlyIncome <= 0) {
    return {
      inss: 0,
      irpf: 0,
      totalDeductions: 0,
      netIncome: 0,
      annualNet: 0,
      effectiveRate: 0,
    };
  }

  // INSS: progressive, each slice at its own rate
  const inss = calcINSS(monthlyIncome, data);

  // IRPF base
  const irpfBase = monthlyIncome - inss - dependents * data.dependentDeductionMonthly;

  // Find applicable IRPF bracket
  let irpf = 0;
  for (const bracket of data.monthlyBrackets) {
    const upper = bracket.max ?? Infinity;
    if (irpfBase >= bracket.min && irpfBase <= upper) {
      irpf = irpfBase * bracket.rate - bracket.deduction;
      break;
    }
  }
  if (irpf < 0) irpf = 0;
  irpf = round2(irpf);

  const totalDeductions = round2(inss + irpf);
  const netIncome = round2(monthlyIncome - totalDeductions);
  const annualNet = round2(netIncome * 12);
  const effectiveRate = monthlyIncome > 0 ? totalDeductions / monthlyIncome : 0;

  return {
    inss,
    irpf,
    totalDeductions,
    netIncome,
    annualNet,
    effectiveRate,
  };
}
