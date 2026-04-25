import { describe, it, expect } from "vitest";
import { calculateCanadaPension } from "./pension";
import pensionData from "../../../data/canada/2026/pension.json";
import type { CanadaPensionData } from "./pension";

const data = pensionData as unknown as CanadaPensionData;

describe("calculateCanadaPension", () => {
  it("gives maximum CPP at YMPE income claimed at 65", () => {
    const result = calculateCanadaPension(
      { annualIncome: data.cpp.ympe, currentAge: 50, contributedYears: 20, claimAge: 65 },
      data
    );
    expect(result.monthlyCpp).toBe(Math.round(data.cpp.maxMonthlyBenefit));
    expect(result.cppAdjustmentPercent).toBe(0);
  });

  it("reduces benefit for early claiming at 60", () => {
    const result = calculateCanadaPension(
      { annualIncome: 70_000, currentAge: 50, contributedYears: 20, claimAge: 60 },
      data
    );
    expect(result.cppAdjustmentPercent).toBeLessThan(0);
    const expectedPenalty = -60 * data.cpp.earlyClaimPenaltyPerMonth;
    expect(result.cppAdjustmentPercent).toBeCloseTo(expectedPenalty, 4);
  });

  it("increases benefit for deferred claiming at 70", () => {
    const result = calculateCanadaPension(
      { annualIncome: 70_000, currentAge: 50, contributedYears: 20, claimAge: 70 },
      data
    );
    expect(result.cppAdjustmentPercent).toBeGreaterThan(0);
    const expectedBonus = 60 * data.cpp.deferralBonusPerMonth;
    expect(result.cppAdjustmentPercent).toBeCloseTo(expectedBonus, 4);
  });

  it("provides OAS at base amount", () => {
    const result = calculateCanadaPension(
      { annualIncome: 50_000, currentAge: 40, contributedYears: 10, claimAge: 65 },
      data
    );
    expect(result.monthlyOas).toBe(Math.round(data.oas.monthlyBase));
  });

  it("total equals CPP + OAS", () => {
    const result = calculateCanadaPension(
      { annualIncome: 60_000, currentAge: 45, contributedYears: 15, claimAge: 65 },
      data
    );
    expect(result.totalMonthly).toBe(result.monthlyCpp + result.monthlyOas);
  });

  it("scales CPP benefit proportionally to income", () => {
    const low = calculateCanadaPension(
      { annualIncome: 30_000, currentAge: 45, contributedYears: 10, claimAge: 65 },
      data
    );
    const high = calculateCanadaPension(
      { annualIncome: 70_000, currentAge: 45, contributedYears: 10, claimAge: 65 },
      data
    );
    expect(high.monthlyCpp).toBeGreaterThan(low.monthlyCpp);
  });
});
