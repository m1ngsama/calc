"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BreakdownItem } from "@/lib/types";

interface TaxPieChartProps {
  items: BreakdownItem[];
  takeHomePay: number;
  takeHomeLabel: string;
  formatAmount: (amount: number) => string;
}

export function TaxPieChart({
  items,
  takeHomePay,
  takeHomeLabel,
  formatAmount,
}: TaxPieChartProps) {
  const data = [
    ...items.map((item) => ({
      name: item.label,
      value: item.amount,
      color: item.color,
    })),
    {
      name: takeHomeLabel,
      value: takeHomePay,
      color: "#22c55e",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatAmount(Number(value))}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
