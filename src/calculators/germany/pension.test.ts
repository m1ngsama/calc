import { describe, it, expect } from "vitest";
import { calculateGermanyPension } from "./pension";
import pensionData from "../../../data/germany/2026/pension.json";
import type { GermanyPensionData } from "./pension";

const data = pensionData as unknown as GermanyPensionData;

describe("calculateGermanyPension", () => {
  it("earns 1.0 point per year at average earnings", () => {
    const result = calculateGermanyPension(
      {
        annualIncome: data.durchschnittsentgelt,
        currentAge: 40,
        contributedYears: 10,
        claimAge: 67,
      },
      data
    );
    expect(result.pointsPerYear).toBeCloseTo(1.0, 1);
  });

  it("applies no adjustment at normal retirement age", () => {
    const result = calculateGermanyPension(
      { annualIncome: 50_000, currentAge: 50, contributedYears: 20, claimAge: 67 },
      data
    );
    expect(result.claimAgeAdjustment).toBe(1.0);
  });

  it("applies early claim penalty", () => {
    const result = calculateGermanyPension(
      { annualIncome: 50_000, currentAge: 50, contributedYears: 20, claimAge: 63 },
      data
    );
    const expectedPenalty = 1.0 - (67 - 63) * 12 * data.earlyClaimPenaltyPerMonth;
    expect(result.claimAgeAdjustment).toBeCloseTo(expectedPenalty, 2);
    expect(result.claimAgeAdjustment).toBeLessThan(1.0);
  });

  it("applies deferral bonus", () => {
    const result = calculateGermanyPension(
      { annualIncome: 50_000, currentAge: 50, contributedYears: 20, claimAge: 70 },
      data
    );
    expect(result.claimAgeAdjustment).toBeGreaterThan(1.0);
  });

  it("caps income at Beitragsbemessungsgrenze", () => {
    const low = calculateGermanyPension(
      { annualIncome: data.beitragsbemessungsgrenze, currentAge: 40, contributedYears: 10, claimAge: 67 },
      data
    );
    const high = calculateGermanyPension(
      { annualIncome: data.beitragsbemessungsgrenze + 50_000, currentAge: 40, contributedYears: 10, claimAge: 67 },
      data
    );
    expect(high.pointsPerYear).toBe(low.pointsPerYear);
    expect(high.monthlyBenefit).toBe(low.monthlyBenefit);
  });

  it("annual benefit equals 12× monthly", () => {
    const result = calculateGermanyPension(
      { annualIncome: 60_000, currentAge: 35, contributedYears: 5, claimAge: 67 },
      data
    );
    expect(result.annualBenefit).toBeCloseTo(result.monthlyBenefit * 12, 1);
  });
});
