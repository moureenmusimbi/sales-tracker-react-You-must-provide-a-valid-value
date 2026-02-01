import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import "./App.css";
import type { SaleData } from "./types/SaleData";

type SaleForm = {
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  totalReceived: number;
  targetExpected: number;
  date: string;
};

export default function App() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [editing, setEditing] = useState<{ id: string; field: keyof SaleData } | null>(null);

  const [form, setForm] = useState<SaleForm>({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    totalReceived: 0,
    targetExpected: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const salesCollection = collection(db, "sales");

  // Listen to sales collection
  useEffect(() => {
    const unsubscribe = onSnapshot(salesCollection, (snapshot) => {
      const data: SaleData[] = snapshot.docs.map((d) => ({
        ...(d.data() as SaleData),
        id: d.id,
      }));
      setSales(data);
    });
    return unsubscribe;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "product" || name === "givenTo" || name === "date" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(salesCollection, {
      ...form,
      date: Timestamp.fromDate(new Date(form.date)),
    });
    setForm({
      product: "",
      givenTo: "",
      salesMade: 0,
      salesNotMade: 0,
      totalReceived: 0,
      targetExpected: 0,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleCellUpdate = async (id: string, field: keyof SaleData, value: string) => {
    const ref = doc(db, "sales", id);

    let parsedValue: string | number | Timestamp;
    if (field === "product" || field === "givenTo") parsedValue = value;
    else if (field === "date") parsedValue = Timestamp.fromDate(new Date(value));
    else parsedValue = Number(value);

    await updateDoc(ref, { [field]: parsedValue });
    setEditing(null);
  };

  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const totalReceived = sales.reduce((sum, s) => sum + s.totalReceived, 0);

  const renderCell = (s: SaleData, field: keyof SaleData) => {
    const value = s[field];

    if (editing && editing.id === s.id && editing.field === field) {
      return (
        <input
          autoFocus
          defaultValue={field === "date" && value instanceof Timestamp ? value.toDate().toISOString().split("T")[0] : String(value)}
          onBlur={(e) => handleCellUpdate(s.id, field, e.target.value)}
        />
      );
    }

    // Narrow type to ReactNode
    let displayValue: string | number;
    if (field === "date" && value instanceof Timestamp) displayValue = formatDate(value);
    else if (typeof value === "string" || typeof value === "number") displayValue = value;
    else displayValue = String(value);

    return <span onClick={() => setEditing({ id: s.id, field })}>{displayValue}</span>;
  };

  return (
    <div className="excel-container">
      <h1 className="excel-title">📊 Sales for the Whole Year</h1>

      <div className="excel-toolbar">
        <form onSubmit={handleSubmit}>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
          <input name="product" placeholder="Product" value={form.product} onChange={handleChange} />
          <input name="givenTo" placeholder="Given To" value={form.givenTo} onChange={handleChange} />
          <input type="number" name="salesMade" placeholder="Sales Made" value={form.salesMade} onChange={handleChange} />
          <input type="number" name="salesNotMade" placeholder="Sales Not Made" value={form.salesNotMade} onChange={handleChange} />
          <input type="number" name="targetExpected" placeholder="Target" value={form.targetExpected} onChange={handleChange} />
          <input type="number" name="totalReceived" placeholder="Received" value={form.totalReceived} onChange={handleChange} />
          <button type="submit">➕ Add</button>
        </form>
      </div>

      <div className="excel-table">
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => {
              const met = s.salesMade >= s.targetExpected; // Dynamic status
              return (
                <tr key={s.id}>
                  <td>{renderCell(s, "date")}</td>
                  <td>{renderCell(s, "product")}</td>
                  <td>{renderCell(s, "givenTo")}</td>
                  <td>{renderCell(s, "salesMade")}</td>
                  <td>{renderCell(s, "salesNotMade")}</td>
                  <td>{renderCell(s, "targetExpected")}</td>
                  <td>{renderCell(s, "totalReceived")}</td>
                  <td className={met ? "ok" : "no"}>{met ? "✔" : "✖"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6}>📌 TOTAL</td>
              <td>{totalReceived}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}