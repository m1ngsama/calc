"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateCanadaIncomeTax, type CanadaTaxData } from "@/calculators/canada/income-tax";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";
import { TaxPieChart } from "@/components/calculator/TaxPieChart";

interface Props {
  taxData: CanadaTaxData;
}

export function CanadaIncomeTaxForm({ taxData }: Props) {
  const t = useTranslations("canada.incomeTax");
  const [income, setIncome] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateCanadaIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const gross = parseInt(income.replace(/[^0-9]/g, ""), 10);
    if (!gross || gross <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    setResult(calculateCanadaIncomeTax({ annualIncome: gross }, taxData));
  };

  const fmt = (amount: number) => formatCurrency(amount, "CAD", "en-CA");

  const pieItems: BreakdownItem[] = result
    ? [
        { label: t("federalTax"), amount: result.federalTax, color: "#ef4444" },
        { label: t("provincialTax"), amount: result.provincialTax, color: "#f97316" },
        ...(result.ontarioSurtax > 0
          ? [{ label: t("ontarioSurtax"), amount: result.ontarioSurtax, color: "#eab308" }]
          : []),
        ...(result.ontarioHealthPremium > 0
          ? [{ label: t("ontarioHealthPremium"), amount: result.ontarioHealthPremium, color: "#a855f7" }]
          : []),
        { label: t("cpp"), amount: result.cppContribution, color: "#3b82f6" },
        { label: t("ei"), amount: result.eiPremium, color: "#06b6d4" },
      ]
    : [];

  const tableItems: BreakdownItem[] = result
    ? [
        { label: t("federalTax"), amount: result.federalTax, color: "#ef4444" },
        { label: t("provincialTax"), amount: result.provincialTax, color: "#f97316" },
        ...(result.ontarioSurtax > 0
          ? [{ label: t("ontarioSurtax"), amount: result.ontarioSurtax, color: "#eab308" }]
          : []),
        ...(result.ontarioHealthPremium > 0
          ? [{ label: t("ontarioHealthPremium"), amount: result.ontarioHealthPremium, color: "#a855f7" }]
          : []),
        { label: t("cpp"), amount: result.cppContribution, color: "#3b82f6" },
        { label: t("ei"), amount: result.eiPremium, color: "#06b6d4" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("annualIncome")}</Label>
            <Input
              type="text"
              prefix="$"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="100,000"
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
              <p className="text-sm text-(--color-text-muted) mb-1">
                {t("takeHomePay")}
              </p>
              <p className="text-4xl font-bold font-mono text-(--color-success)">
                {fmt(result.netIncome)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(Math.round(result.netIncome / 12))} {t("perMonth")}
              </p>
              <p className="text-sm text-(--color-text-muted)">
                {fmt(result.netIncome)} {t("perYear")}
              </p>
            </div>

            <TaxPieChart
              items={pieItems}
              takeHomePay={result.netIncome}
              takeHomeLabel={t("takeHomePay")}
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <BreakdownTable
              items={tableItems}
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
