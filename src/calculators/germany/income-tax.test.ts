import { describe, it, expect } from "vitest";
import { calculateGermanyIncomeTax } from "./income-tax";
import taxData from "../../../data/germany/2026/income-tax.json";
import type { GermanyTaxData } from "./income-tax";

const data = taxData as unknown as GermanyTaxData;

describe("calculateGermanyIncomeTax", () => {
  it("returns zero for zero income", () => {
    const result = calculateGermanyIncomeTax(
      { annualIncome: 0, churchMember: false, hasChildren: false },
      data
    );
    expect(result.incomeTax).toBe(0);
    expect(result.netIncome).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.totalSocialInsurance).toBe(0);
  });

  it("calculates tax for €40,000 income without church", () => {
    const result = calculateGermanyIncomeTax(
      { annualIncome: 40_000, churchMember: false, hasChildren: true },
      data
    );
    expect(result.incomeTax).toBeGreaterThan(0);
    expect(result.churchTax).toBe(0);
    expect(result.netIncome).toBeGreaterThan(0);
    expect(result.netIncome).toBeLessThan(40_000);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(0.5);
  });

  it("adds church tax when member", () => {
    const without = calculateGermanyIncomeTax(
      { annualIncome: 60_000, churchMember: false, hasChildren: false },
      data
    );
    const withChurch = calculateGermanyIncomeTax(
      { annualIncome: 60_000, churchMember: true, hasChildren: false },
      data
    );
    expect(withChurch.churchTax).toBeGreaterThan(0);
    expect(withChurch.totalDeductions).toBeGreaterThan(without.totalDeductions);
    expect(withChurch.churchTax).toBe(
      Math.floor(data.churchTax.standardRate * withChurch.incomeTax)
    );
  });

  it("adds childless surcharge to long-term care insurance", () => {
    const withChildren = calculateGermanyIncomeTax(
      { annualIncome: 50_000, churchMember: false, hasChildren: true },
      data
    );
    const childless = calculateGermanyIncomeTax(
      { annualIncome: 50_000, churchMember: false, hasChildren: false },
      data
    );
    expect(childless.longTermCareInsurance).toBeGreaterThan(
      withChildren.longTermCareInsurance
    );
  });

  it("caps social insurance at ceilings", () => {
    const result = calculateGermanyIncomeTax(
      { annualIncome: 200_000, churchMember: false, hasChildren: false },
      data
    );
    const maxHealth = Math.floor(
      data.socialInsurance.healthInsurance.annualCeiling *
        (data.socialInsurance.healthInsurance.employeeRate +
          data.socialInsurance.healthInsurance.supplementaryRate)
    );
    expect(result.healthInsurance).toBe(maxHealth);
  });

  it("ensures all amounts sum correctly", () => {
    const result = calculateGermanyIncomeTax(
      { annualIncome: 75_000, churchMember: true, hasChildren: false },
      data
    );
    expect(result.totalSocialInsurance).toBe(
      result.healthInsurance +
        result.pensionInsurance +
        result.unemploymentInsurance +
        result.longTermCareInsurance
    );
    expect(result.totalDeductions).toBe(
      result.incomeTax +
        result.solidaritySurcharge +
        result.churchTax +
        result.totalSocialInsurance
    );
    expect(result.netIncome).toBe(75_000 - result.totalDeductions);
  });
});
