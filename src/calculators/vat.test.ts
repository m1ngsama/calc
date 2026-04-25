import { describe, it, expect } from "vitest";
import { calculateVat } from "./vat";

describe("VAT Calculator", () => {
  it("adds tax correctly", () => {
    const result = calculateVat(10000, 0.1, "add");
    expect(result.preTaxAmount).toBe(10000);
    expect(result.taxAmount).toBe(1000);
    expect(result.totalAmount).toBe(11000);
    expect(result.rate).toBe(0.1);
  });

  it("removes tax correctly", () => {
    const result = calculateVat(11000, 0.1, "remove");
    expect(result.totalAmount).toBe(11000);
    expect(result.preTaxAmount).toBe(10000);
    expect(result.taxAmount).toBe(1000);
  });

  it("handles reduced rate", () => {
    const result = calculateVat(5000, 0.08, "add");
    expect(result.taxAmount).toBe(400);
    expect(result.totalAmount).toBe(5400);
  });

  it("returns zeros for zero amount", () => {
    const result = calculateVat(0, 0.1, "add");
    expect(result.preTaxAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  it("returns zeros for negative amount", () => {
    const result = calculateVat(-100, 0.1, "add");
    expect(result.preTaxAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
  });

  it("returns zeros for zero rate", () => {
    const result = calculateVat(10000, 0, "add");
    expect(result.preTaxAmount).toBe(0);
    expect(result.totalAmount).toBe(0);
  });

  it("floors tax amount when adding", () => {
    const result = calculateVat(999, 0.1, "add");
    expect(result.taxAmount).toBe(99); // floor(999 * 0.1)
  });

  it("floors pre-tax amount when removing", () => {
    const result = calculateVat(1099, 0.1, "remove");
    expect(result.preTaxAmount).toBe(999); // floor(1099 / 1.1)
    expect(result.taxAmount).toBe(100); // 1099 - 999
  });
});
