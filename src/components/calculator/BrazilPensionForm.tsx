"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateBrazilPension, type BrazilPensionData } from "@/calculators/brazil/pension";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

interface Props {
  pensionData: BrazilPensionData;
}

export function BrazilPensionForm({ pensionData }: Props) {
  const t = useTranslations("brazil.pension");

  const [monthlyIncome, setMonthlyIncome] = useState("5000");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [contributedYears, setContributedYears] = useState("10");
  const [currentAge, setCurrentAge] = useState("35");
  const [result, setResult] =
    useState<ReturnType<typeof calculateBrazilPension> | null>(null);
  const [error, setError] = useState(false);

  const handleCalculate = () => {
    const incomeValue = parseInt(monthlyIncome.replace(/[^0-9]/g, ""), 10);
    if (!incomeValue || incomeValue <= 0) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setError(false);
    const input = {
      monthlyIncome: incomeValue,
      gender,
      contributedYears: parseInt(contributedYears, 10) || 0,
      currentAge: parseInt(currentAge, 10) || 35,
    };
    setResult(calculateBrazilPension(input, pensionData));
  };

  const fmt = (n: number) => formatCurrency(n, "BRL");

  const genderOptions = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("monthlyIncome")}</Label>
            <Input
              type="text"
              prefix="R$"
              numeric
              inputMode="numeric"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="5,000"
              error={error}
            />
          </div>

          <div>
            <Label>{t("gender")}</Label>
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
              options={genderOptions}
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
            <Label>{t("currentAge")}</Label>
            <Input
              type="number"
              min={18}
              max={64}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
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
          </div>

          <div className="space-y-2 text-sm text-(--color-text-muted)">
            <div className="flex justify-between">
              <span>{t("benefitRate")}</span>
              <span className="font-mono">
                {Math.round(result.benefitRate * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("averageSalary")}</span>
              <span className="font-mono">{fmt(result.averageSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("contributionYearsTotal")}</span>
              <span className="font-mono">{result.totalContributionYears}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("retirementAge")}</span>
              <span className="font-mono">{result.retirementAge}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("monthlyContribution")}</span>
              <span className="font-mono">{fmt(result.monthlyContribution)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
