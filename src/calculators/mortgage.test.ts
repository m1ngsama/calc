import { describe, it, expect } from "vitest";
import { calculateMortgage } from "./mortgage";

describe("Mortgage Calculator", () => {
  it("calculates standard 30-year mortgage", () => {
    const result = calculateMortgage({
      principal: 30000000,
      annualRate: 1.5,
      termYears: 35,
    });
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBeGreaterThan(30000000);
    expect(result.totalInterest).toBe(result.totalPayment - 30000000);
    expect(result.schedule).toHaveLength(35);
  });

  it("generates correct schedule length", () => {
    const result = calculateMortgage({
      principal: 10000000,
      annualRate: 2.0,
      termYears: 20,
    });
    expect(result.schedule).toHaveLength(20);
    expect(result.schedule[0].year).toBe(1);
    expect(result.schedule[19].year).toBe(20);
  });

  it("schedule ends with zero balance", () => {
    const result = calculateMortgage({
      principal: 10000000,
      annualRate: 3.0,
      termYears: 15,
    });
    expect(result.schedule[14].remainingBalance).toBe(0);
  });

  it("early years have more interest, later years more principal", () => {
    const result = calculateMortgage({
      principal: 50000000,
      annualRate: 2.5,
      termYears: 30,
    });
    const firstYear = result.schedule[0];
    const lastYear = result.schedule[29];
    expect(firstYear.interestPaid).toBeGreaterThan(firstYear.principalPaid);
    expect(lastYear.principalPaid).toBeGreaterThan(lastYear.interestPaid);
  });

  it("total schedule principal equals loan amount", () => {
    const result = calculateMortgage({
      principal: 25000000,
      annualRate: 1.8,
      termYears: 25,
    });
    const totalPrincipal = result.schedule.reduce(
      (sum, y) => sum + y.principalPaid,
      0
    );
    expect(totalPrincipal).toBeCloseTo(25000000, -2);
  });

  it("returns zeros for zero principal", () => {
    const result = calculateMortgage({
      principal: 0,
      annualRate: 2.0,
      termYears: 30,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
  });

  it("returns zeros for zero rate", () => {
    const result = calculateMortgage({
      principal: 10000000,
      annualRate: 0,
      termYears: 30,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
  });

  it("higher rate means higher total interest", () => {
    const lowRate = calculateMortgage({
      principal: 20000000,
      annualRate: 1.0,
      termYears: 30,
    });
    const highRate = calculateMortgage({
      principal: 20000000,
      annualRate: 3.0,
      termYears: 30,
    });
    expect(highRate.totalInterest).toBeGreaterThan(lowRate.totalInterest);
    expect(highRate.monthlyPayment).toBeGreaterThan(lowRate.monthlyPayment);
  });
});
