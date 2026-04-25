"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateMortgage } from "@/calculators/mortgage";
import { formatCurrency } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";
import { TaxPieChart } from "@/components/calculator/TaxPieChart";

interface Props {
  currency: string;
  currencySymbol: string;
}

export function MortgageForm({ currency, currencySymbol }: Props) {
  const t = useTranslations("mortgage");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("1.5");
  const [term, setTerm] = useState("35");
  const [result, setResult] = useState<ReturnType<typeof calculateMortgage> | null>(null);

  const handleCalculate = () => {
    const p = parseInt(principal.replace(/[^0-9]/g, ""), 10);
    const r = parseFloat(rate);
    const y = parseInt(term, 10);
    if (!p || !r || !y || p <= 0 || r <= 0 || y <= 0) return;
    setResult(calculateMortgage({ principal: p, annualRate: r, termYears: y }));
  };

  const fmt = (n: number) => formatCurrency(n, currency);

  const breakdownItems: BreakdownItem[] = result
    ? [
        { label: t("principal"), amount: parseInt(principal.replace(/[^0-9]/g, ""), 10), color: "#3b82f6" },
        { label: t("interest"), amount: result.totalInterest, color: "#f97316" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("loanAmount")}</Label>
            <Input
              type="text"
              prefix={currencySymbol}
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="30,000,000"
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("interestRate")}</Label>
              <Input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="1.5"
                inputMode="decimal"
              />
            </div>
            <div>
              <Label>{t("loanTerm")}</Label>
              <Input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="35"
                inputMode="numeric"
              />
            </div>
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
              <p className="text-sm text-(--color-text-muted) mb-1">{t("monthlyPayment")}</p>
              <p className="text-4xl font-bold font-mono text-(--color-navy)">
                {fmt(result.monthlyPayment)}
              </p>
            </div>
            <TaxPieChart
              items={breakdownItems}
              takeHomePay={0}
              takeHomeLabel=""
              formatAmount={fmt}
            />
          </Card>

          <Card title={t("results")}>
            <BreakdownTable
              items={[
                { label: t("totalPayment"), amount: result.totalPayment, color: "#6b7280" },
                { label: t("totalInterest"), amount: result.totalInterest, color: "#f97316" },
                { label: t("principal"), amount: parseInt(principal.replace(/[^0-9]/g, ""), 10), color: "#3b82f6" },
              ]}
              total={{ label: t("totalPayment"), amount: result.totalPayment }}
              formatAmount={fmt}
            />
          </Card>

          {result.schedule.length > 0 && (
            <Card title={t("schedule")}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--color-border)">
                      <th className="px-3 py-2 text-left text-(--color-text-muted)">{t("year")}</th>
                      <th className="px-3 py-2 text-right text-(--color-text-muted)">{t("yearlyPrincipal")}</th>
                      <th className="px-3 py-2 text-right text-(--color-text-muted)">{t("yearlyInterest")}</th>
                      <th className="px-3 py-2 text-right text-(--color-text-muted)">{t("balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.year} className="border-b border-(--color-border)">
                        <td className="px-3 py-2 text-(--color-text)">{row.year}</td>
                        <td className="px-3 py-2 text-right font-mono text-(--color-text)">{fmt(row.principalPaid)}</td>
                        <td className="px-3 py-2 text-right font-mono text-(--color-text)">{fmt(row.interestPaid)}</td>
                        <td className="px-3 py-2 text-right font-mono text-(--color-text)">{fmt(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
