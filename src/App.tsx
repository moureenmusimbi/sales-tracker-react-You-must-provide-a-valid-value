import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import "./App.css";
import type { SaleData, TotalsData } from "./types/SaleData";

type SaleForm = {
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  targetExpected: number;
  totalReceived: number;
  date: string;
};

export default function App() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [editing, setEditing] = useState<{
    id: string;
    field: keyof SaleData;
  } | null>(null);

  const [savedTotals, setSavedTotals] = useState<TotalsData>({
    salesMade: 0,
    salesNotMade: 0,
    totalReceived: 0,
  });

  const [form, setForm] = useState<SaleForm>({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    targetExpected: 0,
    totalReceived: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const salesCollection = collection(db, "sales");

  /* 🔄 LOAD SALES */
  useEffect(() => {
    return onSnapshot(salesCollection, (snap) => {
      const data = snap.docs.map((d) => ({
        ...(d.data() as SaleData),
        id: d.id,
      }));
      setSales(data);
    });
  }, []);

  /* 📊 CALCULATE TOTALS */
  const totals: TotalsData = sales.reduce(
    (acc, s) => {
      acc.salesMade += s.salesMade;
      acc.salesNotMade += s.salesNotMade;
      acc.totalReceived += s.totalReceived;
      return acc;
    },
    { salesMade: 0, salesNotMade: 0, totalReceived: 0 }
  );

  /* 💾 SAVE TOTALS */
  useEffect(() => {
    if (sales.length === 0) return;
    setDoc(doc(db, "totals", "summary"), totals);
  }, [sales]);

  /* 🔄 LOAD SAVED TOTALS */
  useEffect(() => {
    return onSnapshot(doc(db, "totals", "summary"), (snap) => {
      if (snap.exists()) {
        setSavedTotals(snap.data() as TotalsData);
      }
    });
  }, []);

  /* ✍️ FORM INPUT */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "product" || name === "givenTo" || name === "date"
          ? value
          : Number(value),
    }));
  };

  /* ➕ ADD SALE */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result =
      form.salesMade >= form.targetExpected
        ? "Achieved"
        : "Not Achieved";

    await addDoc(salesCollection, {
      ...form,
      date: Timestamp.fromDate(new Date(form.date)),
      result,
    });

    setForm({
      product: "",
      givenTo: "",
      salesMade: 0,
      salesNotMade: 0,
      targetExpected: 0,
      totalReceived: 0,
      date: new Date().toISOString().split("T")[0],
    });
  };

  /* ✏️ UPDATE CELL (FIXED, NO any) */
  const handleCellUpdate = async (
    id: string,
    field: keyof SaleData,
    value: string
  ) => {
    const ref = doc(db, "sales", id);
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;

    const updated: Partial<SaleData> = {};

    if (field === "product" || field === "givenTo") {
      updated[field] = value;
    } 
    else if (field === "date") {
      updated.date = Timestamp.fromDate(new Date(value));
    } 
    else if (
      field === "salesMade" ||
      field === "salesNotMade" ||
      field === "targetExpected" ||
      field === "totalReceived"
    ) {
      updated[field] = Number(value);
    }

    if (field === "salesMade" || field === "targetExpected") {
      const salesMade =
        field === "salesMade" ? Number(value) : sale.salesMade;
      const target =
        field === "targetExpected"
          ? Number(value)
          : sale.targetExpected;

      updated.result =
        salesMade >= target ? "Achieved" : "Not Achieved";
    }

    await updateDoc(ref, updated);
    setEditing(null);
  };

  /* 🧱 CELL RENDER */
  const renderCell = (s: SaleData, field: keyof SaleData) => {
    const value = s[field];

    if (editing?.id === s.id && editing.field === field) {
      return (
        <input
          autoFocus
          defaultValue={
            field === "date"
              ? s.date.toDate().toISOString().split("T")[0]
              : String(value)
          }
          onBlur={(e) =>
            handleCellUpdate(s.id, field, e.target.value)
          }
        />
      );
    }

    return (
      <span onClick={() => setEditing({ id: s.id, field })}>
        {field === "date"
          ? s.date.toDate().toLocaleDateString()
          : String(value)}
      </span>
    );
  };

  return (
    <div className="excel-container">
      <h1>📊 Sales Management System</h1>

      <div className="totals-box">
        <h2>📌 TOTAL SUMMARY</h2>
        <p>Total Sales Made: {savedTotals.salesMade}</p>
        <p>Total Sales Not Made: {savedTotals.salesNotMade}</p>
        <p>Total Received: {savedTotals.totalReceived}</p>
        <button onClick={() => window.print()}>🖨 Print</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input name="product" placeholder="Product" value={form.product} onChange={handleChange} />
        <input name="givenTo" placeholder="Given To" value={form.givenTo} onChange={handleChange} />
        <input type="number" name="salesMade" placeholder="Sales Made" value={form.salesMade} onChange={handleChange} />
        <input type="number" name="salesNotMade" placeholder="Sales Not Made" value={form.salesNotMade} onChange={handleChange} />
        <input type="number" name="targetExpected" placeholder="Target" value={form.targetExpected} onChange={handleChange} />
        <input type="number" name="totalReceived" placeholder="Received" value={form.totalReceived} onChange={handleChange} />
        <button>➕ Add Sale</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Given To</th>
            <th>Sales Made</th>
            <th>Sales Not Made</th>
            <th>Target</th>
            <th>Received</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{renderCell(s, "date")}</td>
              <td>{renderCell(s, "product")}</td>
              <td>{renderCell(s, "givenTo")}</td>
              <td>{renderCell(s, "salesMade")}</td>
              <td>{renderCell(s, "salesNotMade")}</td>
              <td>{renderCell(s, "targetExpected")}</td>
              <td>{renderCell(s, "totalReceived")}</td>
              <td className={s.result === "Achieved" ? "ok" : "no"}>
                {s.result}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}