import { describe, it, expect } from "vitest";
import { calculateJapanIncomeTax } from "./income-tax";
import taxData from "../../../data/japan/2026/income-tax.json";
import type { IncomeTaxData } from "@/lib/types";

const data = taxData as IncomeTaxData;

describe("calculateJapanIncomeTax", () => {
  it("calculates tax for ¥3,000,000 annual income", () => {
    const result = calculateJapanIncomeTax(3_000_000, data);
    expect(result.grossIncome).toBe(3_000_000);
    expect(result.takeHomePay).toBeGreaterThan(0);
    expect(result.takeHomePay).toBeLessThan(3_000_000);
    expect(result.effectiveRate).toBeGreaterThan(0);
    expect(result.effectiveRate).toBeLessThan(1);
  });

  it("calculates tax for ¥5,000,000 annual income", () => {
    const result = calculateJapanIncomeTax(5_000_000, data);
    expect(result.grossIncome).toBe(5_000_000);
    expect(result.employmentDeduction).toBe(5_000_000 * 0.2 + 440_000);
    expect(result.basicDeduction).toBe(480_000);
    expect(result.incomeTax).toBeGreaterThan(0);
    expect(result.residenceTax).toBeGreaterThan(0);
    expect(result.healthInsurance).toBeGreaterThan(0);
    expect(result.pension).toBeGreaterThan(0);
    expect(result.employmentInsurance).toBeGreaterThan(0);
  });

  it("calculates tax for ¥10,000,000 annual income", () => {
    const result = calculateJapanIncomeTax(10_000_000, data);
    expect(result.effectiveRate).toBeGreaterThan(0.2);
    expect(result.effectiveRate).toBeLessThan(0.4);
  });

  it("returns zero tax for zero income", () => {
    const result = calculateJapanIncomeTax(0, data);
    expect(result.grossIncome).toBe(0);
    expect(result.takeHomePay).toBe(0);
    expect(result.incomeTax).toBe(0);
    expect(result.residenceTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it("caps social insurance at maximum amounts", () => {
    const result = calculateJapanIncomeTax(30_000_000, data);
    expect(result.healthInsurance).toBeLessThanOrEqual(data.socialInsurance.healthInsuranceMax);
    expect(result.pension).toBeLessThanOrEqual(data.socialInsurance.pensionMax);
  });

  it("ensures all amounts sum correctly", () => {
    const result = calculateJapanIncomeTax(7_000_000, data);
    const totalDeductions =
      result.incomeTax +
      result.reconstructionTax +
      result.residenceTax +
      result.healthInsurance +
      result.pension +
      result.employmentInsurance;
    expect(result.totalDeductions).toBe(totalDeductions);
    expect(result.takeHomePay).toBe(result.grossIncome - result.totalDeductions);
  });
});
