"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { calculateVat, type VatData } from "@/calculators/japan/vat";
import { formatCurrency } from "@/lib/format";
import type { BreakdownItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { BreakdownTable } from "@/components/calculator/BreakdownTable";

interface Props {
  vatData: VatData;
}

export function JapanVatForm({ vatData }: Props) {
  const t = useTranslations("vat");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState(String(vatData.standardRate));
  const [operation, setOperation] = useState<"add" | "remove">("add");
  const [result, setResult] = useState<ReturnType<typeof calculateVat> | null>(null);

  const handleCalculate = () => {
    const value = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!value || value <= 0) return;
    setResult(calculateVat(value, parseFloat(rate), operation));
  };

  const fmt = (n: number) => formatCurrency(n, "JPY");

  const items: BreakdownItem[] = result
    ? [
        { label: t("preTaxAmount"), amount: result.preTaxAmount, color: "#3b82f6" },
        { label: t("taxAmount"), amount: result.taxAmount, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("amount")}</Label>
            <Input
              type="text"
              prefix="¥"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10,000"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label>{t("rate")}</Label>
            <Select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              options={[
                { value: String(vatData.standardRate), label: t("standardRate") },
                { value: String(vatData.reducedRate), label: t("reducedRate") },
              ]}
            />
          </div>
          <div>
            <Label>{t("operation")}</Label>
            <Select
              value={operation}
              onChange={(e) => setOperation(e.target.value as "add" | "remove")}
              options={[
                { value: "add", label: t("addTax") },
                { value: "remove", label: t("removeTax") },
              ]}
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
            <p className="text-sm text-(--color-text-muted) mb-1">{t("totalAmount")}</p>
            <p className="text-4xl font-bold font-mono text-(--color-navy)">
              {fmt(result.totalAmount)}
            </p>
          </div>
          <BreakdownTable
            items={items}
            total={{ label: t("totalAmount"), amount: result.totalAmount }}
            formatAmount={fmt}
          />
          <p className="text-xs text-(--color-text-muted) mt-3 text-right">
            Tax rate: {(result.rate * 100).toFixed(0)}%
          </p>
        </Card>
      )}
    </div>
  );
}
