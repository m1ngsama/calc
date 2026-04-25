import { describe, it, expect } from "vitest";
import { calculateBrazilPension } from "./pension";
import pensionData from "../../../data/brazil/2026/pension.json";
import type { BrazilPensionData } from "./pension";

const data = pensionData as unknown as BrazilPensionData;

describe("calculateBrazilPension", () => {
  it("clamps benefit at minimum pension", () => {
    const result = calculateBrazilPension(
      { monthlyIncome: 1_518, gender: "male", contributedYears: 20, currentAge: 60 },
      data
    );
    expect(result.monthlyBenefit).toBeGreaterThanOrEqual(data.minimumPension);
  });

  it("clamps benefit at maximum pension", () => {
    const result = calculateBrazilPension(
      { monthlyIncome: 50_000, gender: "male", contributedYears: 40, currentAge: 30 },
      data
    );
    expect(result.monthlyBenefit).toBeLessThanOrEqual(data.maximumPension);
  });

  it("uses correct retirement age by gender", () => {
    const male = calculateBrazilPension(
      { monthlyIncome: 5_000, gender: "male", contributedYears: 10, currentAge: 40 },
      data
    );
    const female = calculateBrazilPension(
      { monthlyIncome: 5_000, gender: "female", contributedYears: 10, currentAge: 40 },
      data
    );
    expect(male.retirementAge).toBe(data.retirementAge.men);
    expect(female.retirementAge).toBe(data.retirementAge.women);
  });

  it("increases benefit rate with more contribution years", () => {
    const fewer = calculateBrazilPension(
      { monthlyIncome: 5_000, gender: "male", contributedYears: 15, currentAge: 55 },
      data
    );
    const more = calculateBrazilPension(
      { monthlyIncome: 5_000, gender: "male", contributedYears: 30, currentAge: 55 },
      data
    );
    expect(more.benefitRate).toBeGreaterThan(fewer.benefitRate);
  });

  it("caps benefit rate at 100%", () => {
    const result = calculateBrazilPension(
      { monthlyIncome: 5_000, gender: "female", contributedYears: 40, currentAge: 30 },
      data
    );
    expect(result.benefitRate).toBeLessThanOrEqual(1.0);
  });

  it("caps average salary at contribution ceiling", () => {
    const result = calculateBrazilPension(
      { monthlyIncome: 20_000, gender: "male", contributedYears: 10, currentAge: 40 },
      data
    );
    expect(result.averageSalary).toBe(data.contributionCeiling);
  });
});
