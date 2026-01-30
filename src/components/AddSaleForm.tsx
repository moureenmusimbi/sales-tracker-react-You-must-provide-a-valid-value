// src/components/AddSaleForm.tsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import "./AddSaleForm.css";

/* Firestore Sale Type */
export type SaleData = {
  id?: string;
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  totalReceived: number;
  targetExpected: number;
  date: Timestamp; // stored as Firestore Timestamp
};

/* Form type (date is string for input) */
type SaleForm = {
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  totalReceived: number;
  targetExpected: number;
  date: string; // string for date input
};

export default function AddSaleForm() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const [form, setForm] = useState<SaleForm>({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    totalReceived: 0,
    targetExpected: 0,
    date: new Date().toISOString().split("T")[0], // default today
  });

  const salesCollection = collection(db, "sales");

  /* Load sales from Firebase */
  useEffect(() => {
    const unsubscribe = onSnapshot(salesCollection, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as SaleData),
        id: doc.id,
      }));
      setSales(data);
    });
    return () => unsubscribe();
  }, []);

  /* Handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "product" || name === "givenTo" || name === "date"
          ? value
          : Number(value),
    });
  };

  /* Submit sale */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(salesCollection, {
        ...form,
        date: Timestamp.fromDate(new Date(form.date)), // store as Timestamp
      });

      setForm({
        product: "",
        givenTo: "",
        salesMade: 0,
        salesNotMade: 0,
        totalReceived: 0,
        targetExpected: 0,
        date: new Date().toISOString().split("T")[0], // reset to today
      });
    } catch (error) {
      console.error("Error adding sale:", error);
    }
  };

  /* Format Firestore Timestamp to DD/MM/YYYY */
  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="add-sale-form">
      <h2>Sales Tracker</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="product"
          placeholder="Product"
          value={form.product}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="givenTo"
          placeholder="Given To"
          value={form.givenTo}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salesMade"
          placeholder="Sales Made"
          value={form.salesMade}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salesNotMade"
          placeholder="Sales Not Made"
          value={form.salesNotMade}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="totalReceived"
          placeholder="Total Received"
          value={form.totalReceived}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="targetExpected"
          placeholder="Target Expected"
          value={form.targetExpected}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Sale</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Given To</th>
            <th>Sales Made</th>
            <th>Sales Not Made</th>
            <th>Total Received</th>
            <th>Target Expected</th>
            <th>Target Met</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{formatDate(s.date)}</td>
              <td>{s.product}</td>
              <td>{s.givenTo}</td>
              <td>{s.salesMade}</td>
              <td>{s.salesNotMade}</td>
              <td>{s.totalReceived}</td>
              <td>{s.targetExpected}</td>
              <td style={{ textAlign: "center" }}>
                {s.salesMade >= s.targetExpected ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
