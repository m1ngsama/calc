"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateJapanIncomeTax } from "@/calculators/japan/income-tax";
import { formatCurrency } from "@/lib/format";
import type { IncomeTaxData, TaxResult, BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";
import { TaxPieChart } from "@/components/calculator/TaxPieChart";

interface Props {
  taxData: IncomeTaxData;
}

export function JapanSalaryForm({ taxData }: Props) {
  const t = useTranslations("salary");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("monthly");
  const [result, setResult] = useState<TaxResult | null>(null);
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
    setResult(calculateJapanIncomeTax(annual, taxData));
  };

  const fmt = (n: number) => formatCurrency(n, "JPY");
  const monthly = (n: number) => Math.floor(n / 12);

  const items: BreakdownItem[] = result
    ? [
        { label: t("incomeTax"), amount: result.incomeTax + result.reconstructionTax, color: "#ef4444" },
        { label: t("residenceTax"), amount: result.residenceTax, color: "#f97316" },
        { label: t("healthInsurance"), amount: result.healthInsurance, color: "#eab308" },
        { label: t("pension"), amount: result.pension, color: "#3b82f6" },
        { label: t("employmentInsurance"), amount: result.employmentInsurance, color: "#8b5cf6" },
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
              prefix="¥"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === "monthly" ? "400,000" : "5,000,000"}
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
                {fmt(monthly(result.takeHomePay))}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(result.takeHomePay)} / {t("annualTakeHome")}
              </p>
            </div>
            <TaxPieChart
              items={monthlyItems}
              takeHomePay={monthly(result.takeHomePay)}
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
              <span className="font-bold font-mono text-(--color-success)">{fmt(monthly(result.takeHomePay))}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
