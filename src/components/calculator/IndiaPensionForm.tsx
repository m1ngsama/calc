"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  calculateIndiaPension,
  type IndiaPensionData,
} from "@/calculators/india/pension";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface Props {
  pensionData: IndiaPensionData;
}

export function IndiaPensionForm({ pensionData }: Props) {
  const t = useTranslations("india.pension");

  const [monthlySalary, setMonthlySalary] = useState("25000");
  const [currentAge, setCurrentAge] = useState("35");
  const [serviceYears, setServiceYears] = useState("5");
  const [result, setResult] =
    useState<ReturnType<typeof calculateIndiaPension> | null>(null);

  const handleCalculate = () => {
    const input = {
      monthlySalary: parseInt(monthlySalary.replace(/[^0-9]/g, ""), 10) || 0,
      currentAge: parseInt(currentAge, 10) || 35,
      serviceYears: parseInt(serviceYears, 10) || 0,
    };
    setResult(calculateIndiaPension(input, pensionData));
  };

  const fmt = (n: number) => formatCurrency(n, "INR");

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("monthlySalary")}</Label>
            <Input
              type="text"
              prefix="₹"
              inputMode="numeric"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              placeholder="25,000"
            />
          </div>

          <div>
            <Label>{t("currentAge")}</Label>
            <Input
              type="number"
              min={18}
              max={57}
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
            />
          </div>

          <div>
            <Label>{t("serviceYears")}</Label>
            <Input
              type="number"
              min={0}
              max={40}
              value={serviceYears}
              onChange={(e) => setServiceYears(e.target.value)}
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
              {t("monthlyPension")}
            </p>
            <p className="text-4xl font-bold font-mono text-(--color-navy)">
              {fmt(result.monthlyPension)}
            </p>
          </div>

          <div className="space-y-2 text-sm text-(--color-text-muted)">
            <div className="flex justify-between">
              <span>{t("epfCorpus")}</span>
              <span className="font-mono">{fmt(result.epfCorpus)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("pensionableSalary")}</span>
              <span className="font-mono">{fmt(result.pensionableSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("pensionableService")}</span>
              <span className="font-mono">{result.pensionableService} years</span>
            </div>
            <div className="flex justify-between">
              <span>{t("monthlyEpfContribution")}</span>
              <span className="font-mono">{fmt(result.monthlyEpfContribution)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
