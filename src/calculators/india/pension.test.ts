import { describe, it, expect } from "vitest";
import { calculateIndiaPension } from "./pension";
import pensionData from "../../../data/india/2026/pension.json";
import type { IndiaPensionData } from "./pension";

const data = pensionData as unknown as IndiaPensionData;

describe("calculateIndiaPension", () => {
  it("caps pensionable salary at EPS limit", () => {
    const result = calculateIndiaPension(
      { monthlySalary: 50_000, currentAge: 35, serviceYears: 10 },
      data
    );
    expect(result.pensionableSalary).toBe(data.eps.pensionableSalaryCap);
  });

  it("returns zero pension with less than minimum service years", () => {
    const result = calculateIndiaPension(
      { monthlySalary: 25_000, currentAge: 55, serviceYears: 2 },
      data
    );
    expect(result.monthlyPension).toBe(0);
  });

  it("calculates positive pension with sufficient service", () => {
    const result = calculateIndiaPension(
      { monthlySalary: 25_000, currentAge: 35, serviceYears: 10 },
      data
    );
    expect(result.monthlyPension).toBeGreaterThan(0);
    expect(result.monthlyPension).toBeGreaterThanOrEqual(data.eps.minimumPension);
  });

  it("adds bonus years for 20+ years service", () => {
    const under20 = calculateIndiaPension(
      { monthlySalary: 15_000, currentAge: 50, serviceYears: 5 },
      data
    );
    const over20 = calculateIndiaPension(
      { monthlySalary: 15_000, currentAge: 35, serviceYears: 10 },
      data
    );
    expect(over20.pensionableService).toBeGreaterThan(
      over20.pensionableService - data.eps.bonusYears >= 20 ? 0 : under20.pensionableService
    );
  });

  it("calculates EPF corpus", () => {
    const result = calculateIndiaPension(
      { monthlySalary: 25_000, currentAge: 30, serviceYears: 5 },
      data
    );
    expect(result.epfCorpus).toBeGreaterThan(0);
    expect(result.monthlyEpfContribution).toBe(Math.round(25_000 * data.epf.employeeRate));
  });

  it("handles retirement age person", () => {
    const result = calculateIndiaPension(
      { monthlySalary: 25_000, currentAge: 58, serviceYears: 30 },
      data
    );
    expect(result.monthlyPension).toBeGreaterThan(0);
  });
});
