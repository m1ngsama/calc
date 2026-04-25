import type { BreakdownItem } from "@/lib/types";

interface BreakdownTableProps {
  items: BreakdownItem[];
  total: { label: string; amount: number };
  formatAmount: (amount: number) => string;
}

export function BreakdownTable({
  items,
  total,
  formatAmount,
}: BreakdownTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-(--color-border)">
      <table className="w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="border-b border-(--color-border)">
              <td className="px-4 py-3 text-(--color-text)">
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-(--color-text)">
                {formatAmount(item.amount)}
              </td>
            </tr>
          ))}
          <tr className="bg-(--color-surface-alt)">
            <td className="px-4 py-3 font-semibold text-(--color-text)">
              {total.label}
            </td>
            <td className="px-4 py-3 text-right font-mono font-semibold text-(--color-text)">
              {formatAmount(total.amount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
