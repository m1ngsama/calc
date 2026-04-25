import { describe, it, expect } from "vitest";
import { calculateBrazilIncomeTax } from "./income-tax";
import taxData from "../../../data/brazil/2026/income-tax.json";
import type { BrazilTaxData } from "./income-tax";

const data = taxData as unknown as BrazilTaxData;

describe("calculateBrazilIncomeTax", () => {
  it("returns zero for zero income", () => {
    const result = calculateBrazilIncomeTax({ monthlyIncome: 0, dependents: 0 }, data);
    expect(result.inss).toBe(0);
    expect(result.irpf).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("calculates INSS progressively for R$5,000 income", () => {
    const result = calculateBrazilIncomeTax({ monthlyIncome: 5_000, dependents: 0 }, data);
    expect(result.inss).toBeGreaterThan(0);
    expect(result.inss).toBeLessThan(5_000 * 0.14);
  });

  it("calculates IRPF with dependents deduction", () => {
    const noDeps = calculateBrazilIncomeTax({ monthlyIncome: 8_000, dependents: 0 }, data);
    const twoDeps = calculateBrazilIncomeTax({ monthlyIncome: 8_000, dependents: 2 }, data);
    expect(twoDeps.irpf).toBeLessThan(noDeps.irpf);
  });

  it("pays no IRPF at minimum wage", () => {
    const result = calculateBrazilIncomeTax({ monthlyIncome: 1_518, dependents: 0 }, data);
    expect(result.irpf).toBe(0);
  });

  it("ensures deductions sum correctly", () => {
    const result = calculateBrazilIncomeTax({ monthlyIncome: 10_000, dependents: 1 }, data);
    expect(result.totalDeductions).toBeCloseTo(result.inss + result.irpf, 2);
    expect(result.netIncome).toBeCloseTo(10_000 - result.totalDeductions, 2);
    expect(result.annualNet).toBeCloseTo(result.netIncome * 12, 2);
  });

  it("effective rate increases with income", () => {
    const low = calculateBrazilIncomeTax({ monthlyIncome: 3_000, dependents: 0 }, data);
    const high = calculateBrazilIncomeTax({ monthlyIncome: 15_000, dependents: 0 }, data);
    expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
  });
});
