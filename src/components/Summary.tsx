import type { SaleData } from "../types/SaleData";
import { Timestamp } from "firebase/firestore";

type SummaryProps = {
  sales: SaleData[];
};

// Helper to get month name from Timestamp
const getMonthName = (ts: Timestamp) => {
  const d = ts.toDate();
  return d.toLocaleString("default", { month: "short" }); // e.g., "Jan", "Feb"
};

export default function Summary({ sales }: SummaryProps) {
  const monthlyTotals: Record<string, number> = {};

  sales.forEach((s) => {
    if (!(s.date instanceof Timestamp)) return; // skip invalid dates

    const month = getMonthName(s.date);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + s.salesMade;
  });

  return (
    <div className="summary">
      <h2>📅 Monthly Sales Summary</h2>
      <ul>
        {Object.entries(monthlyTotals).map(([month, total]) => (
          <li key={month}>
            {month}: {total} sales
          </li>
        ))}
      </ul>
    </div>
  );
}