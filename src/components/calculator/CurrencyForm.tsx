"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { fetchRates, convert, MAJOR_CURRENCIES, type ExchangeRates } from "@/calculators/currency";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

interface Props {
  defaultCurrency: string;
}

function formatAmount(amount: number, currencyCode: string): string {
  const noDecimals = ["JPY", "KRW"];
  if (noDecimals.includes(currencyCode)) {
    return amount.toFixed(0);
  }
  return amount.toFixed(2);
}

export function CurrencyForm({ defaultCurrency }: Props) {
  const t = useTranslations("currency");

  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState(defaultCurrency);
  const [toCurrency, setToCurrency] = useState("USD");
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadRates = async (base: string) => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchRates(base);
      setRates(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates(fromCurrency);
  }, [fromCurrency]);

  const handleSwap = () => {
    const prev = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prev);
  };

  const currencyOptions = MAJOR_CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
  }));

  // Compute result
  let convertedAmount: number | null = null;
  let exchangeRate: number | null = null;

  if (rates && !loading && !error) {
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericAmount) && numericAmount > 0) {
      if (toCurrency === fromCurrency) {
        convertedAmount = numericAmount;
        exchangeRate = 1;
      } else if (rates.rates[toCurrency] !== undefined) {
        // rates.base === fromCurrency, so fromRate = 1
        exchangeRate = rates.rates[toCurrency];
        convertedAmount = convert(numericAmount, 1, exchangeRate);
      }
    }
  }

  const toCurrencyMeta = MAJOR_CURRENCIES.find((c) => c.code === toCurrency);
  const fromCurrencyMeta = MAJOR_CURRENCIES.find((c) => c.code === fromCurrency);

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <Label>{t("amount")}</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <Label>{t("from")}</Label>
            <Select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              options={currencyOptions}
            />
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={handleSwap} className="px-8">
              ⇅ {t("swap")}
            </Button>
          </div>

          <div>
            <Label>{t("to")}</Label>
            <Select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              options={currencyOptions}
            />
          </div>
        </div>
      </Card>

      {loading && (
        <Card>
          <p className="text-center text-(--color-text-muted) py-4">{t("loading")}</p>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <p className="text-center text-(--color-text-muted) mb-4">{t("error")}</p>
          <Button onClick={() => loadRates(fromCurrency)} className="w-full">
            {t("convert")}
          </Button>
        </Card>
      )}

      {!loading && !error && convertedAmount !== null && (
        <Card title={t("result")}>
          <div className="text-center mb-6">
            <p className="text-sm text-(--color-text-muted) mb-1">
              {formatAmount(parseFloat(amount.replace(/[^0-9.]/g, "")) || 0, fromCurrency)}{" "}
              {fromCurrencyMeta?.name ?? fromCurrency} =
            </p>
            <p className="text-4xl font-bold font-mono text-(--color-navy)">
              {toCurrencyMeta?.symbol ?? ""}{formatAmount(convertedAmount, toCurrency)}
            </p>
            <p className="text-sm text-(--color-text-muted) mt-1">{toCurrency}</p>
          </div>

          {exchangeRate !== null && (
            <div className="border-t border-(--color-border) pt-4 text-sm text-(--color-text-muted) space-y-1">
              <p>
                {t("rate")}: 1 {fromCurrency} = {formatAmount(exchangeRate, toCurrency)} {toCurrency}
              </p>
              {rates?.date && (
                <p>
                  {t("lastUpdated")}: {rates.date}
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
