"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateGermanyIncomeTax, type GermanyTaxData } from "@/calculators/germany/income-tax";
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
  taxData: GermanyTaxData;
}

export function GermanyIncomeTaxForm({ taxData }: Props) {
  const t = useTranslations("germany.incomeTax");
  const [income, setIncome] = useState("");
  const [churchMember, setChurchMember] = useState("no");
  const [hasChildren, setHasChildren] = useState("no");
  const [result, setResult] = useState<ReturnType<typeof calculateGermanyIncomeTax> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const gross = parseInt(income.replace(/[^0-9]/g, ""), 10);
    if (!gross || gross <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    setResult(
      calculateGermanyIncomeTax(
        {
          annualIncome: gross,
          churchMember: churchMember === "yes",
          hasChildren: hasChildren === "yes",
        },
        taxData
      )
    );
  };

  const fmt = (amount: number) => formatCurrency(amount, "EUR");

  const breakdownItems: BreakdownItem[] = result
    ? [
        { label: t("incomeTax"), amount: result.incomeTax, color: "#ef4444" },
        ...(result.solidaritySurcharge > 0
          ? [{ label: t("solidaritySurcharge"), amount: result.solidaritySurcharge, color: "#f97316" }]
          : []),
        ...(result.churchTax > 0
          ? [{ label: t("churchTax"), amount: result.churchTax, color: "#a855f7" }]
          : []),
        { label: t("healthInsurance"), amount: result.healthInsurance, color: "#3b82f6" },
        { label: t("pensionInsurance"), amount: result.pensionInsurance, color: "#06b6d4" },
        { label: t("unemploymentInsurance"), amount: result.unemploymentInsurance, color: "#8b5cf6" },
        { label: t("longTermCareInsurance"), amount: result.longTermCareInsurance, color: "#ec4899" },
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
              prefix="€"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="60,000"
              numeric
              inputMode="numeric"
              error={error}
            />
          </div>

          <div>
            <Label>{t("churchMember")}</Label>
            <Select
              value={churchMember}
              onChange={(e) => setChurchMember(e.target.value)}
              options={[
                { value: "no", label: t("no") },
                { value: "yes", label: t("yes") },
              ]}
            />
          </div>

          <div>
            <Label>{t("hasChildren")}</Label>
            <Select
              value={hasChildren}
              onChange={(e) => setHasChildren(e.target.value)}
              options={[
                { value: "no", label: t("no") },
                { value: "yes", label: t("yes") },
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
                {fmt(result.netIncome)}
              </p>
              <p className="text-sm text-(--color-text-muted) mt-1">
                {fmt(Math.floor(result.netIncome / 12))} {t("perMonth")}
              </p>
            </div>

            <TaxPieChart
              items={breakdownItems}
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
