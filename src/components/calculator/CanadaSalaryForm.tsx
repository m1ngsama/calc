"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateCanadaIncomeTax, type CanadaTaxData } from "@/calculators/canada/income-tax";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";
import { TaxPieChart } from "@/components/calculator/TaxPieChart";

interface Props {
  taxData: CanadaTaxData;
}

export function CanadaSalaryForm({ taxData }: Props) {
  const t = useTranslations("salary");
  const tc = useTranslations("canada.incomeTax");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("annual");
  const [result, setResult] = useState<ReturnType<typeof calculateCanadaIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const raw = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!raw || raw <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const annual = mode === "annual" ? raw : raw * 12;
    setResult(calculateCanadaIncomeTax({ annualIncome: annual }, taxData));
  };

  const fmt = (n: number) => formatCurrency(n, "CAD", "en-CA");

  const items: BreakdownItem[] = result
    ? [
        { label: tc("federalTax"), amount: result.federalTax, color: "#ef4444" },
        { label: tc("provincialTax"), amount: result.provincialTax, color: "#f97316" },
        ...(result.ontarioSurtax > 0
          ? [{ label: tc("ontarioSurtax"), amount: result.ontarioSurtax, color: "#eab308" }]
          : []),
        ...(result.ontarioHealthPremium > 0
          ? [{ label: tc("ontarioHealthPremium"), amount: result.ontarioHealthPremium, color: "#a855f7" }]
          : []),
        { label: tc("cpp"), amount: result.cppContribution, color: "#3b82f6" },
        { label: tc("ei"), amount: result.eiPremium, color: "#06b6d4" },
      ]
    : [];

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
              prefix="$"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === "monthly" ? "8,000" : "100,000"}
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
              <p className="text-sm text-(--color-text-muted) mb-1">{t("annualTakeHome")}</p>
              <p className="text-4xl font-bold font-mono text-(--color-success)">
                {fmt(result.netIncome)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(Math.round(result.netIncome / 12))} / {t("monthly")}
              </p>
            </div>
            <TaxPieChart
              items={items}
              takeHomePay={result.netIncome}
              takeHomeLabel={t("netPay")}
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <BreakdownTable
              items={items}
              total={{ label: t("totalDeductions"), amount: result.totalDeductions }}
              formatAmount={fmt}
            />
            <div className="mt-4 p-3 rounded-lg bg-(--color-surface-alt) flex justify-between">
              <span className="font-semibold text-(--color-text)">{t("netPay")}</span>
              <span className="font-bold font-mono text-(--color-success)">{fmt(result.netIncome)}</span>
            </div>
            <p className="text-sm text-(--color-text-muted) mt-3 text-right">
              {tc("effectiveRate")}: {formatPercent(result.effectiveRate)}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
