"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  calculatePension,
  type PensionData,
  type PensionInput,
} from "@/calculators/japan/pension";
import { formatCurrency } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";

interface Props {
  pensionData: PensionData;
}

export function JapanPensionForm({ pensionData }: Props) {
  const t = useTranslations("pension");
  const [pensionType, setPensionType] = useState<"kokumin" | "kousei">(
    "kousei"
  );
  const [currentAge, setCurrentAge] = useState("35");
  const [annualIncome, setAnnualIncome] = useState("5000000");
  const [contributedYears, setContributedYears] = useState("10");
  const [claimAge, setClaimAge] = useState("65");
  const [result, setResult] =
    useState<ReturnType<typeof calculatePension> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const incomeValue = parseInt(annualIncome.replace(/[^0-9]/g, ""), 10);
    if (!incomeValue || incomeValue <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const input: PensionInput = {
      pensionType,
      currentAge: parseInt(currentAge, 10) || 35,
      annualIncome: incomeValue,
      contributedYears: parseInt(contributedYears, 10) || 0,
      claimAge: parseInt(claimAge, 10) || 65,
    };
    setResult(calculatePension(input, pensionData));
  };

  const fmt = (n: number) => formatCurrency(n, "JPY");

  const claimAgeOptions = Array.from({ length: 16 }, (_, i) => ({
    value: String(i + 60),
    label: String(i + 60),
  }));

  const items: BreakdownItem[] = result
    ? [
        {
          label: t("kokuminPortion"),
          amount: result.kokuminAnnualBenefit,
          color: "#3b82f6",
        },
        ...(pensionType === "kousei"
          ? [
              {
                label: t("kouseiPortion"),
                amount: result.kouseiAnnualBenefit,
                color: "#22c55e",
              },
            ]
          : []),
      ]
    : [];

  const adjustmentLabel = () => {
    if (!result) return "";
    if (result.claimAgeAdjustment < 1) {
      return `${t("earlyPenalty")}: ×${result.claimAgeAdjustment.toFixed(3)}`;
    }
    if (result.claimAgeAdjustment > 1) {
      return `${t("deferralBonus")}: ×${result.claimAgeAdjustment.toFixed(3)}`;
    }
    return t("noAdjustment");
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("pensionType")}</Label>
            <Select
              value={pensionType}
              onChange={(e) =>
                setPensionType(e.target.value as "kokumin" | "kousei")
              }
              options={[
                { value: "kousei", label: t("kousei") },
                { value: "kokumin", label: t("kokuminOnly") },
              ]}
            />
          </div>

          <div>
            <Label>{t("currentAge")}</Label>
            <Input
              type="number"
              min={20}
              max={59}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
            />
          </div>

          {pensionType === "kousei" && (
            <div>
              <Label>{t("annualIncome")}</Label>
              <Input
                type="text"
                prefix="¥"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="5,000,000"
                numeric
              inputMode="numeric"
              error={error}
              />
            </div>
          )}

          <div>
            <Label>{t("contributedYears")}</Label>
            <Input
              type="number"
              min={0}
              max={40}
              value={contributedYears}
              onChange={(e) => setContributedYears(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("claimAge")}</Label>
            <Select
              value={claimAge}
              onChange={(e) => setClaimAge(e.target.value)}
              options={claimAgeOptions}
            />
          </div>

          <Button onClick={handleCalculate} className="w-full">
            {t("calculate")}
          </Button>
        </div>
      </Card>

      {result && (
        <Card title={t("results")}>
          <div className="text-center mb-6">
            <p className="text-sm text-(--color-text-muted) mb-1">
              {t("monthlyBenefit")}
            </p>
            <p className="text-4xl font-bold font-mono text-(--color-navy)">
              {fmt(result.totalMonthlyBenefit)}
            </p>
            <p className="text-sm text-(--color-text-muted) mt-1">
              / month &mdash; {fmt(result.totalAnnualBenefit)} / year
            </p>
          </div>

          <BreakdownTable
            items={items}
            total={{ label: t("annualBenefit"), amount: result.totalAnnualBenefit }}
            formatAmount={fmt}
          />

          <div className="mt-4 space-y-2 text-sm text-(--color-text-muted)">
            <div className="flex justify-between">
              <span>{t("monthlyContribution")}</span>
              <span className="font-mono">{fmt(result.monthlyContribution)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("totalContributions")}</span>
              <span className="font-mono">
                {fmt(result.totalLifetimeContributions)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("claimAgeAdjustment")}</span>
              <span className="font-mono">{adjustmentLabel()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
