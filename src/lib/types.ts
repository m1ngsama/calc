export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface EmploymentDeduction {
  min: number;
  max: number | null;
  rate: number;
  base: number;
}

export interface IncomeTaxData {
  taxYear: number;
  currency: string;
  brackets: TaxBracket[];
  reconstructionTaxRate: number;
  residenceTaxRate: number;
  deductions: {
    basic: number;
    employment: EmploymentDeduction[];
  };
  socialInsurance: {
    healthInsuranceRate: number;
    pensionRate: number;
    employmentInsuranceRate: number;
    healthInsuranceMax: number;
    pensionMax: number;
  };
  source: string;
  lastVerified: string;
}

export interface TaxResult {
  grossIncome: number;
  employmentDeduction: number;
  basicDeduction: number;
  taxableIncome: number;
  incomeTax: number;
  reconstructionTax: number;
  residenceTax: number;
  healthInsurance: number;
  pension: number;
  employmentInsurance: number;
  totalDeductions: number;
  takeHomePay: number;
  effectiveRate: number;
}

export interface CountryMeta {
  id: string;
  currency: string;
  currencySymbol: string;
  fiscalYearStart: string;
  locale: string;
  flag: string;
  calculators: string[];
}

export interface BreakdownItem {
  label: string;
  amount: number;
  color: string;
}
