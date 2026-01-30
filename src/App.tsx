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

export type SaleData = {
  id?: string;
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  totalReceived: number;
  targetExpected: number;
  date: Timestamp;
};

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
  const [editing, setEditing] = useState<{
    id: string;
    field: keyof SaleData;
  } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(salesCollection, {
      ...form,
      date: Timestamp.fromDate(new Date(form.date)),
    });
  };

  const handleCellUpdate = async (
    id: string,
    field: keyof SaleData,
    value: string
  ) => {
    const ref = doc(db, "sales", id);
    const parsed =
      field === "product" || field === "givenTo"
        ? value
        : Number(value);

    await updateDoc(ref, { [field]: parsed });
    setEditing(null);
  };

  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const totalReceived = sales.reduce(
    (sum, s) => sum + s.totalReceived,
    0
  );

  return (
    <div className="excel-container">
      <h1 className="excel-title">📊 Sales for the Whole Year</h1>

      <div className="excel-toolbar">
        <form onSubmit={handleSubmit}>
          <input type="date" name="date" value={form.date} onChange={handleChange} />
          <input name="product" placeholder="Product" onChange={handleChange} />
          <input name="givenTo" placeholder="Given To" onChange={handleChange} />
          <input type="number" name="salesMade" placeholder="Sales Made" onChange={handleChange} />
          <input type="number" name="salesNotMade" placeholder="Sales Not Made" onChange={handleChange} />
          <input type="number" name="targetExpected" placeholder="Target" onChange={handleChange} />
          <input type="number" name="totalReceived" placeholder="Received" onChange={handleChange} />
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
              const met = s.salesMade >= s.targetExpected;

              const renderCell = (
                field: keyof SaleData,
                value: any,
                align = ""
              ) =>
                editing?.id === s.id && editing.field === field ? (
                  <input
                    autoFocus
                    defaultValue={value}
                    className={`cell-input ${align}`}
                    onBlur={(e) =>
                      handleCellUpdate(s.id!, field, e.target.value)
                    }
                  />
                ) : (
                  <span
                    onClick={() =>
                      setEditing({ id: s.id!, field })
                    }
                  >
                    {value}
                  </span>
                );

              return (
                <tr key={s.id}>
                  <td>{formatDate(s.date)}</td>
                  <td className="text">{renderCell("product", s.product)}</td>
                  <td className="text">{renderCell("givenTo", s.givenTo)}</td>
                  <td className="num">{renderCell("salesMade", s.salesMade, "num")}</td>
                  <td className="num">{renderCell("salesNotMade", s.salesNotMade, "num")}</td>
                  <td className="num">{renderCell("targetExpected", s.targetExpected, "num")}</td>
                  <td className="num">{renderCell("totalReceived", s.totalReceived, "num")}</td>
                  <td className={met ? "ok" : "no"}>{met ? "✔" : "✖"}</td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={6}>📌 TOTAL</td>
              <td className="num">{totalReceived}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}