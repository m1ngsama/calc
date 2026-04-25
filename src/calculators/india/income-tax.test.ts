import { describe, it, expect } from "vitest";
import { calculateIndiaIncomeTax } from "./income-tax";
import taxData from "../../../data/india/2026/income-tax.json";
import type { IndiaTaxData } from "./income-tax";

const data = taxData as unknown as IndiaTaxData;

describe("calculateIndiaIncomeTax", () => {
  it("returns zero for zero income", () => {
    const result = calculateIndiaIncomeTax({ annualIncome: 0 }, data);
    expect(result.incomeTax).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("applies Section 87A rebate for low income", () => {
    const result = calculateIndiaIncomeTax({ annualIncome: 700_000 }, data);
    expect(result.rebate87A).toBeGreaterThan(0);
    expect(result.incomeTax).toBe(0);
  });

  it("calculates tax for ₹15,00,000 income", () => {
    const result = calculateIndiaIncomeTax({ annualIncome: 1_500_000 }, data);
    expect(result.incomeTax).toBeGreaterThan(0);
    expect(result.epf).toBeGreaterThan(0);
    expect(result.cess).toBeGreaterThan(0);
    expect(result.netIncome).toBeGreaterThan(0);
    expect(result.netIncome).toBeLessThan(1_500_000);
  });

  it("adds surcharge for very high income", () => {
    const result = calculateIndiaIncomeTax({ annualIncome: 6_000_000 }, data);
    expect(result.surcharge).toBeGreaterThan(0);
  });

  it("ensures amounts sum correctly", () => {
    const result = calculateIndiaIncomeTax({ annualIncome: 2_000_000 }, data);
    const expectedTotal =
      result.incomeTax + result.surcharge + result.cess + result.epf + result.professionalTax;
    expect(result.totalDeductions).toBe(expectedTotal);
    expect(result.netIncome).toBe(2_000_000 - result.totalDeductions);
  });

  it("effective rate increases with income", () => {
    const low = calculateIndiaIncomeTax({ annualIncome: 800_000 }, data);
    const high = calculateIndiaIncomeTax({ annualIncome: 5_000_000 }, data);
    expect(high.effectiveRate).toBeGreaterThan(low.effectiveRate);
  });
});
