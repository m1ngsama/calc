"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateGermanyIncomeTax, type GermanyTaxData } from "@/calculators/germany/income-tax";
import { formatCurrency } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";
import { TaxPieChart } from "@/components/calculator/TaxPieChart";

interface Props {
  taxData: GermanyTaxData;
}

export function GermanySalaryForm({ taxData }: Props) {
  const t = useTranslations("salary");
  const tg = useTranslations("germany.incomeTax");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("monthly");
  const [result, setResult] = useState<ReturnType<typeof calculateGermanyIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const raw = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!raw || raw <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const annual = mode === "monthly" ? raw * 12 : raw;
    setResult(
      calculateGermanyIncomeTax({ annualIncome: annual, churchMember: false, hasChildren: false }, taxData)
    );
  };

  const fmt = (n: number) => formatCurrency(n, "EUR");
  const monthly = (n: number) => Math.floor(n / 12);

  const items: BreakdownItem[] = result
    ? [
        { label: tg("incomeTax"), amount: result.incomeTax, color: "#ef4444" },
        ...(result.solidaritySurcharge > 0
          ? [{ label: tg("solidaritySurcharge"), amount: result.solidaritySurcharge, color: "#f97316" }]
          : []),
        { label: tg("healthInsurance"), amount: result.healthInsurance, color: "#3b82f6" },
        { label: tg("pensionInsurance"), amount: result.pensionInsurance, color: "#06b6d4" },
        { label: tg("unemploymentInsurance"), amount: result.unemploymentInsurance, color: "#8b5cf6" },
        { label: tg("longTermCareInsurance"), amount: result.longTermCareInsurance, color: "#ec4899" },
      ]
    : [];

  const monthlyItems = items.map((i) => ({ ...i, amount: monthly(i.amount) }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("inputMode")}</Label>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { value: "monthly", label: t("monthly") },
                { value: "annual", label: t("annual") },
              ]}
            />
          </div>
          <div>
            <Label>{mode === "monthly" ? t("monthlySalary") : t("annualSalary")}</Label>
            <Input
              type="text"
              prefix="€"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === "monthly" ? "5,000" : "60,000"}
              numeric
              inputMode="numeric"
              error={error}
            />
          </div>
          <Button onClick={handleCalculate} className="w-full">
            {t("calculate")}
          </Button>
        </div>
      </Card>

      {result && (
        <>
          <Card>
            <div className="text-center mb-6">
              <p className="text-sm text-(--color-text-muted) mb-1">{t("monthlyTakeHome")}</p>
              <p className="text-4xl font-bold font-mono text-(--color-success)">
                {fmt(monthly(result.netIncome))}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(result.netIncome)} / {t("annualTakeHome")}
              </p>
            </div>
            <TaxPieChart
              items={monthlyItems}
              takeHomePay={monthly(result.netIncome)}
              takeHomeLabel={t("netPay")}
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <h3 className="text-sm font-medium text-(--color-text-muted) mb-2">{t("monthly")}</h3>
            <BreakdownTable
              items={monthlyItems}
              total={{ label: t("totalDeductions"), amount: monthly(result.totalDeductions) }}
              formatAmount={fmt}
            />
            <div className="mt-4 p-3 rounded-lg bg-(--color-surface-alt) flex justify-between">
              <span className="font-semibold text-(--color-text)">{t("netPay")}</span>
              <span className="font-bold font-mono text-(--color-success)">{fmt(monthly(result.netIncome))}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
