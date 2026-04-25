import { describe, it, expect } from "vitest";
import { calculateCanadaIncomeTax } from "./income-tax";
import taxData from "../../../data/canada/2026/income-tax.json";
import type { CanadaTaxData } from "./income-tax";

const data = taxData as unknown as CanadaTaxData;

describe("calculateCanadaIncomeTax", () => {
  it("returns zero for zero income", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 0 }, data);
    expect(result.federalTax).toBe(0);
    expect(result.provincialTax).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("pays no federal tax below BPA", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 15_000 }, data);
    expect(result.federalTax).toBe(0);
  });

  it("calculates tax for $100,000 income", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 100_000 }, data);
    expect(result.federalTax).toBeGreaterThan(0);
    expect(result.provincialTax).toBeGreaterThan(0);
    expect(result.cppContribution).toBeGreaterThan(0);
    expect(result.eiPremium).toBeGreaterThan(0);
    expect(result.netIncome).toBeGreaterThan(0);
    expect(result.netIncome).toBeLessThan(100_000);
  });

  it("caps CPP contribution at maximum", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 200_000 }, data);
    expect(result.cppContribution).toBeLessThanOrEqual(Math.ceil(data.cpp.maxContribution));
  });

  it("caps EI premium at maximum", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 200_000 }, data);
    expect(result.eiPremium).toBeLessThanOrEqual(Math.ceil(data.ei.maxPremium));
  });

  it("applies Ontario surtax for high earners", () => {
    const low = calculateCanadaIncomeTax({ annualIncome: 50_000 }, data);
    const high = calculateCanadaIncomeTax({ annualIncome: 250_000 }, data);
    expect(low.ontarioSurtax).toBe(0);
    expect(high.ontarioSurtax).toBeGreaterThan(0);
  });

  it("applies Ontario health premium", () => {
    const exempt = calculateCanadaIncomeTax({ annualIncome: 18_000 }, data);
    const paying = calculateCanadaIncomeTax({ annualIncome: 50_000 }, data);
    expect(exempt.ontarioHealthPremium).toBe(0);
    expect(paying.ontarioHealthPremium).toBeGreaterThan(0);
  });

  it("ensures amounts sum correctly", () => {
    const result = calculateCanadaIncomeTax({ annualIncome: 120_000 }, data);
    const expectedTotal =
      result.federalTax +
      result.provincialTax +
      result.ontarioSurtax +
      result.ontarioHealthPremium +
      result.cppContribution +
      result.eiPremium;
    expect(result.totalDeductions).toBe(expectedTotal);
    expect(result.netIncome).toBe(120_000 - result.totalDeductions);
  });
});
