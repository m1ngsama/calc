"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateIndiaIncomeTax, type IndiaTaxData } from "@/calculators/india/income-tax";
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
  taxData: IndiaTaxData;
}

export function IndiaSalaryForm({ taxData }: Props) {
  const t = useTranslations("salary");
  const ti = useTranslations("india.incomeTax");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("annual");
  const [result, setResult] = useState<ReturnType<typeof calculateIndiaIncomeTax> | null>(null);
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
    setResult(calculateIndiaIncomeTax({ annualIncome: annual }, taxData));
  };

  const fmt = (n: number) => formatCurrency(n, "INR", "en-IN");

  const items: BreakdownItem[] = result
    ? [
        { label: ti("incomeTax"), amount: result.incomeTax, color: "#ef4444" },
        ...(result.surcharge > 0
          ? [{ label: ti("surcharge"), amount: result.surcharge, color: "#f97316" }]
          : []),
        { label: ti("cess"), amount: result.cess, color: "#a855f7" },
        { label: ti("epf"), amount: result.epf, color: "#3b82f6" },
        { label: ti("professionalTax"), amount: result.professionalTax, color: "#06b6d4" },
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
              prefix="₹"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={mode === "monthly" ? "100,000" : "1,200,000"}
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
              {ti("effectiveRate")}: {formatPercent(result.effectiveRate)}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
