export default function ExportCSV({ sales }: any) {
  const exportCSV = () => {
    const rows = [
      ["Date", "Month", "Amount"],
      ...sales.map((s: any) => {
        const d = new Date(s.date);
        return [
          d.toLocaleDateString(),
          d.toLocaleString("default", { month: "long" }),
          s.amount,
        ];
      }),
    ];

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-year-report.csv";
    a.click();
  };

  return <button onClick={exportCSV}>Export Excel</button>;
}
