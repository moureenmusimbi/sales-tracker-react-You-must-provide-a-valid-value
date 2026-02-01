import type { SaleData } from "../types/SaleData";

type Props = {
  sales: SaleData[];
};

export default function Summary({ sales }: Props) {
  const monthlyTotals: Record<string, number> = {};

  sales.forEach((s) => {
    monthlyTotals[s.month] =
      (monthlyTotals[s.month] || 0) + s.salesMade;
  });

  return (
    <div>
      <h3>Monthly Summary</h3>
      {Object.entries(monthlyTotals).map(([month, total]) => (
        <p key={month}>
          {month}: {total}
        </p>
      ))}
    </div>
  );
}