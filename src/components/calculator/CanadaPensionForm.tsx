"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  calculateCanadaPension,
  type CanadaPensionData,
} from "@/calculators/canada/pension";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Props {
  pensionData: CanadaPensionData;
}

export function CanadaPensionForm({ pensionData }: Props) {
  const t = useTranslations("canada.pension");

  const [annualIncome, setAnnualIncome] = useState("70000");
  const [currentAge, setCurrentAge] = useState("45");
  const [contributedYears, setContributedYears] = useState("10");
  const [claimAge, setClaimAge] = useState("65");
  const [result, setResult] =
    useState<ReturnType<typeof calculateCanadaPension> | null>(null);

  const handleCalculate = () => {
    const input = {
      annualIncome: parseInt(annualIncome.replace(/[^0-9]/g, ""), 10) || 0,
      currentAge: parseInt(currentAge, 10) || 45,
      contributedYears: parseInt(contributedYears, 10) || 0,
      claimAge: parseInt(claimAge, 10) || 65,
    };
    setResult(calculateCanadaPension(input, pensionData));
  };

  const fmt = (n: number) => formatCurrency(n, "CAD");

  const renderAdjustmentText = () => {
    if (!result) return null;
    const pct = result.cppAdjustmentPercent;
    if (pct < 0) {
      return `${t("earlyPenalty")}: ${(pct * 100).toFixed(0)}%`;
    } else if (pct > 0) {
      return `${t("deferralBonus")}: +${(pct * 100).toFixed(0)}%`;
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
              prefix="$"
              inputMode="numeric"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="70,000"
            />
          </div>

          <div>
            <Label>{t("currentAge")}</Label>
            <Input
              type="number"
              min={18}
              max={69}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("contributedYears")}</Label>
            <Input
              type="number"
              min={0}
              max={47}
              value={contributedYears}
              onChange={(e) => setContributedYears(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("claimAge")}</Label>
            <Input
              type="number"
              min={60}
              max={70}
              value={claimAge}
              onChange={(e) => setClaimAge(e.target.value)}
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
              {t("cppMonthly")}
            </p>
            <p className="text-4xl font-bold font-mono text-(--color-navy)">
              {fmt(result.monthlyCpp)}
            </p>
          </div>

          <div className="space-y-2 text-sm text-(--color-text-muted)">
            <div className="flex justify-between">
              <span>{t("oasMonthly")}</span>
              <span className="font-mono">{fmt(result.monthlyOas)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("totalMonthly")}</span>
              <span className="font-mono">{fmt(result.totalMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("cppClaimAdjustment")}</span>
              <span className="font-mono">{renderAdjustmentText()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("currentCppContribution")}</span>
              <span className="font-mono">
                {fmt(result.currentAnnualCppContribution)}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
