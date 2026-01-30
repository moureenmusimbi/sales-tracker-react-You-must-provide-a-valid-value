import { Sale } from "./SalesTable";

export default function Summary({ sales }: { sales: Sale[] }) {
  const monthly: Record<string, number> = {};

  sales.forEach(s => {
    const m = new Date(s.date).toLocaleString("default", { month: "long" });
    monthly[m] = (monthly[m] || 0) + s.amount;
  });

  const yearly = Object.values(monthly).reduce((a, b) => a + b, 0);

  return (
    <div className="summary">
      <h3>Monthly Totals</h3>
      <div className="months">
        {Object.entries(monthly).map(([m, v]) => (
          <div key={m}>{m}: <strong>{v}</strong></div>
        ))}
      </div>
      <h2>Yearly Total: {yearly}</h2>
    </div>
  );
}
