"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateBrazilIncomeTax, type BrazilTaxData } from "@/calculators/brazil/income-tax";
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
  taxData: BrazilTaxData;
}

export function BrazilSalaryForm({ taxData }: Props) {
  const t = useTranslations("salary");
  const tb = useTranslations("brazil.incomeTax");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("monthly");
  const [result, setResult] = useState<ReturnType<typeof calculateBrazilIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const raw = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!raw || raw <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const monthly = mode === "monthly" ? raw : Math.round(raw / 12);
    setResult(
      calculateBrazilIncomeTax({ monthlyIncome: monthly, dependents: 0 }, taxData)
    );
  };

  const fmt = (n: number) => formatCurrency(n, "BRL");

  const items: BreakdownItem[] = result
    ? [
        { label: tb("incomeTax"), amount: result.irpf, color: "#ef4444" },
        { label: tb("inss"), amount: result.inss, color: "#3b82f6" },
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
              prefix="R$"
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
                {fmt(result.netIncome)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(result.annualNet)} / {t("annualTakeHome")}
              </p>
            </div>
            <TaxPieChart
              items={[
                { label: tb("takeHomePay"), amount: result.netIncome, color: "#22c55e" },
                ...items,
              ]}
              takeHomePay={result.netIncome}
              takeHomeLabel={t("netPay")}
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <h3 className="text-sm font-medium text-(--color-text-muted) mb-2">{t("monthly")}</h3>
            <BreakdownTable
              items={items}
              total={{ label: t("totalDeductions"), amount: result.totalDeductions }}
              formatAmount={fmt}
            />
            <div className="mt-4 p-3 rounded-lg bg-(--color-surface-alt) flex justify-between">
              <span className="font-semibold text-(--color-text)">{t("netPay")}</span>
              <span className="font-bold font-mono text-(--color-success)">{fmt(result.netIncome)}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
