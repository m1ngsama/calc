"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateBrazilIncomeTax, type BrazilTaxData } from "@/calculators/brazil/income-tax";
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
  taxData: BrazilTaxData;
}

export function BrazilIncomeTaxForm({ taxData }: Props) {
  const t = useTranslations("brazil.incomeTax");
  const [income, setIncome] = useState("");
  const [dependents, setDependents] = useState("0");
  const [result, setResult] = useState<ReturnType<typeof calculateBrazilIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const monthlyIncome = parseInt(income.replace(/[^0-9]/g, ""), 10);
    if (!monthlyIncome || monthlyIncome <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    setResult(
      calculateBrazilIncomeTax(
        {
          monthlyIncome,
          dependents: Math.max(0, Math.min(10, parseInt(dependents, 10) || 0)),
        },
        taxData
      )
    );
  };

  const fmt = (amount: number) => formatCurrency(amount, "BRL");

  const breakdownItems: BreakdownItem[] = result
    ? [
        { label: t("incomeTax"), amount: result.irpf, color: "#ef4444" },
        { label: t("inss"), amount: result.inss, color: "#3b82f6" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("monthlyIncome")}</Label>
            <Input
              type="text"
              prefix="R$"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="5,000"
              numeric
              inputMode="numeric"
              error={error}
            />
          </div>

          <div>
            <Label>{t("dependents")}</Label>
            <Input
              type="number"
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              min={0}
              max={10}
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
              <p className="text-sm text-(--color-text-muted) mb-1">
                {t("takeHomePay")}
              </p>
              <p className="text-4xl font-bold font-mono text-(--color-success)">
                {fmt(result.netIncome)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {t("perMonth")}
              </p>
              <p className="text-sm text-(--color-text-muted)">
                {fmt(result.annualNet)} {t("perYear")}
              </p>
            </div>

            <TaxPieChart
              items={[
                { label: t("takeHomePay"), amount: result.netIncome, color: "#22c55e" },
                { label: t("incomeTax"), amount: result.irpf, color: "#ef4444" },
                { label: t("inss"), amount: result.inss, color: "#3b82f6" },
              ]}
              takeHomePay={result.netIncome}
              takeHomeLabel={t("takeHomePay")}
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <BreakdownTable
              items={breakdownItems}
              total={{
                label: t("effectiveRate"),
                amount: result.totalDeductions,
              }}
              formatAmount={fmt}
            />
            <p className="text-sm text-(--color-text-muted) mt-3 text-right">
              {t("effectiveRate")}: {formatPercent(result.effectiveRate)}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
