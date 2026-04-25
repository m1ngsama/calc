"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateJapanIncomeTax } from "@/calculators/japan/income-tax";
import { formatCurrency, formatPercent } from "@/lib/format";
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

export function JapanIncomeTaxForm({ taxData }: Props) {
  const t = useTranslations("japan.incomeTax");
  const [income, setIncome] = useState("");
  const [filingStatus, setFilingStatus] = useState("single");
  const [result, setResult] = useState<TaxResult | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const gross = parseInt(income.replace(/[^0-9]/g, ""), 10);
    if (!gross || gross <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    setResult(calculateJapanIncomeTax(gross, taxData));
  };

  const fmt = (amount: number) => formatCurrency(amount, "JPY");

  const breakdownItems: BreakdownItem[] = result
    ? [
        { label: t("incomeTax"), amount: result.incomeTax + result.reconstructionTax, color: "#ef4444" },
        { label: t("residenceTax"), amount: result.residenceTax, color: "#f97316" },
        { label: t("healthInsurance"), amount: result.healthInsurance, color: "#eab308" },
        { label: t("pension"), amount: result.pension, color: "#3b82f6" },
        { label: t("employmentInsurance"), amount: result.employmentInsurance, color: "#8b5cf6" },
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
              prefix="¥"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="5,000,000"
              numeric
              inputMode="numeric"
              error={error}
            />
          </div>

          <div>
            <Label>{t("filingStatus")}</Label>
            <Select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
              options={[
                { value: "single", label: t("single") },
                { value: "married", label: t("married") },
              ]}
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
                {fmt(result.takeHomePay)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(Math.floor(result.takeHomePay / 12))} {t("perMonth")}
              </p>
            </div>

            <TaxPieChart
              items={breakdownItems}
              takeHomePay={result.takeHomePay}
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
