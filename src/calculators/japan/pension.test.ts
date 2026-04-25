import { describe, it, expect } from "vitest";
import { calculatePension, type PensionData, type PensionInput } from "./pension";

const pensionData: PensionData = {
  kokumin: {
    monthlyContribution: 16980,
    maxContributionMonths: 480,
    fullAnnualBenefit: 816000,
    earlyClaimPenaltyPerMonth: 0.004,
    deferralBonusPerMonth: 0.007,
  },
  kousei: {
    employeeRate: 0.0915,
    remunerationCap: 650000,
    accrualRate: 0.005481,
  },
  normalRetirementAge: 65,
  source: "",
  lastVerified: "",
};

describe("Japan Pension Calculator", () => {
  it("calculates kokumin-only pension at normal retirement age", () => {
    const input: PensionInput = {
      pensionType: "kokumin",
      currentAge: 30,
      annualIncome: 0,
      contributedYears: 10,
      claimAge: 65,
    };
    const result = calculatePension(input, pensionData);
    expect(result.claimAgeAdjustment).toBe(1.0);
    expect(result.kouseiMonthlyBenefit).toBe(0);
    expect(result.kokuminAnnualBenefit).toBeGreaterThan(0);
    expect(result.kokuminAnnualBenefit).toBeLessThanOrEqual(816000);
  });

  it("returns full kokumin benefit for 40 years of contribution", () => {
    const input: PensionInput = {
      pensionType: "kokumin",
      currentAge: 60,
      annualIncome: 0,
      contributedYears: 40,
      claimAge: 65,
    };
    const result = calculatePension(input, pensionData);
    expect(result.kokuminAnnualBenefit).toBe(816000);
  });

  it("caps kokumin contribution months at 480", () => {
    const input: PensionInput = {
      pensionType: "kokumin",
      currentAge: 25,
      annualIncome: 0,
      contributedYears: 10,
      claimAge: 65,
    };
    const result = calculatePension(input, pensionData);
    // 10 years contributed (120 months) + 35 years remaining (420 months) = 540, capped at 480
    const expectedMonths = 480;
    const expectedBenefit = Math.floor(816000 * (expectedMonths / 480));
    expect(result.kokuminAnnualBenefit).toBe(expectedBenefit);
  });

  it("applies early claim penalty", () => {
    const input: PensionInput = {
      pensionType: "kokumin",
      currentAge: 55,
      annualIncome: 0,
      contributedYears: 35,
      claimAge: 60,
    };
    const result = calculatePension(input, pensionData);
    // 5 years early = 60 months × 0.4% = 24% penalty
    expect(result.claimAgeAdjustment).toBeCloseTo(0.76, 5);
    expect(result.kokuminAnnualBenefit).toBeLessThan(816000);
  });

  it("applies deferral bonus", () => {
    const input: PensionInput = {
      pensionType: "kokumin",
      currentAge: 60,
      annualIncome: 0,
      contributedYears: 40,
      claimAge: 70,
    };
    const result = calculatePension(input, pensionData);
    // 5 years late = 60 months × 0.7% = 42% bonus
    expect(result.claimAgeAdjustment).toBeCloseTo(1.42, 5);
    expect(result.kokuminAnnualBenefit).toBeGreaterThan(816000);
  });

  it("calculates kousei pension for employee", () => {
    const input: PensionInput = {
      pensionType: "kousei",
      currentAge: 40,
      annualIncome: 6000000,
      contributedYears: 15,
      claimAge: 65,
    };
    const result = calculatePension(input, pensionData);
    expect(result.kouseiAnnualBenefit).toBeGreaterThan(0);
    expect(result.kokuminAnnualBenefit).toBeGreaterThan(0);
    expect(result.totalAnnualBenefit).toBe(
      result.kokuminAnnualBenefit + result.kouseiAnnualBenefit
    );
  });

  it("caps standard monthly remuneration at 650000", () => {
    const highIncome: PensionInput = {
      pensionType: "kousei",
      currentAge: 50,
      annualIncome: 20000000,
      contributedYears: 25,
      claimAge: 65,
    };
    const cappedIncome: PensionInput = {
      pensionType: "kousei",
      currentAge: 50,
      annualIncome: 7800000, // 650000/month
      contributedYears: 25,
      claimAge: 65,
    };
    const highResult = calculatePension(highIncome, pensionData);
    const cappedResult = calculatePension(cappedIncome, pensionData);
    expect(highResult.kouseiAnnualBenefit).toBe(cappedResult.kouseiAnnualBenefit);
  });

  it("calculates monthly contribution for kousei correctly", () => {
    const input: PensionInput = {
      pensionType: "kousei",
      currentAge: 30,
      annualIncome: 4800000, // 400,000/month
      contributedYears: 5,
      claimAge: 65,
    };
    const result = calculatePension(input, pensionData);
    expect(result.monthlyContribution).toBe(Math.floor(400000 * 0.0915));
  });
});
