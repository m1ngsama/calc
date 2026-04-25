"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  calculateGermanyPension,
  type GermanyPensionData,
} from "@/calculators/germany/pension";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

interface Props {
  pensionData: GermanyPensionData;
}

export function GermanyPensionForm({ pensionData }: Props) {
  const t = useTranslations("germany.pension");

  const [annualIncome, setAnnualIncome] = useState("45000");
  const [currentAge, setCurrentAge] = useState("35");
  const [contributedYears, setContributedYears] = useState("10");
  const [claimAge, setClaimAge] = useState("67");
  const [result, setResult] =
    useState<ReturnType<typeof calculateGermanyPension> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const incomeValue = parseInt(annualIncome.replace(/[^0-9]/g, ""), 10);
    if (!incomeValue || incomeValue <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const input = {
      annualIncome: incomeValue,
      currentAge: parseInt(currentAge, 10) || 35,
      contributedYears: parseInt(contributedYears, 10) || 0,
      claimAge: parseInt(claimAge, 10) || 67,
    };
    setResult(calculateGermanyPension(input, pensionData));
  };

  const fmt = (n: number) => formatCurrency(n, "EUR");

  const claimAgeOptions = Array.from({ length: 13 }, (_, i) => ({
    value: String(i + 63),
    label: String(i + 63),
  }));

  const adjustmentInfo = () => {
    if (!result) return null;
    const { claimAgeAdjustment } = result;
    const claimAgeNum = parseInt(claimAge, 10) || 67;
    if (claimAgeNum < 67) {
      const pct = ((1 - claimAgeAdjustment) * 100).toFixed(1);
      return `${t("earlyPenalty")}: −${pct}% (×${claimAgeAdjustment.toFixed(3)})`;
    }
    if (claimAgeNum > 67) {
      const pct = ((claimAgeAdjustment - 1) * 100).toFixed(1);
      return `${t("deferralBonus")}: +${pct}% (×${claimAgeAdjustment.toFixed(3)})`;
    }
    return t("noAdjustment");
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("annualIncome")}</Label>
            <Input
              type="text"
              prefix="€"
              numeric
              inputMode="numeric"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="45,000"
              error={error}
            />
          </div>

          <div>
            <Label>{t("currentAge")}</Label>
            <Input
              type="number"
              min={20}
              max={66}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("contributedYears")}</Label>
            <Input
              type="number"
              min={0}
              max={45}
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
              {fmt(result.monthlyBenefit)}
            </p>
            <p className="text-sm text-(--color-text-muted) mt-1">
              / month &mdash; {fmt(result.annualBenefit)} / year
            </p>
          </div>

          <div className="space-y-2 text-sm text-(--color-text-muted)">
            <div className="flex justify-between">
              <span>{t("totalPoints")}</span>
              <span className="font-mono">{result.totalPoints.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("pointsPerYear")}</span>
              <span className="font-mono">{result.pointsPerYear.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("currentContribution")}</span>
              <span className="font-mono">{fmt(result.monthlyContribution)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("claimAgeAdjustment")}</span>
              <span className="font-mono">{adjustmentInfo()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
