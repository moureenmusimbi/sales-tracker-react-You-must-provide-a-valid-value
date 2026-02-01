import { useState, useEffect } from "react";
import AddSaleForm from "./AddSaleForm";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import type { SaleData } from "../types/SaleData";

export default function SalesTable() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const [currentMonth, setCurrentMonth] = useState(
    months[new Date().getMonth()]
  );

  const [salesData, setSalesData] = useState<
    Record<string, SaleData[]>
  >({});

  const [editing, setEditing] = useState<{
    id: string;
    field: keyof SaleData;
    value: string;
  } | null>(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sales"), (snapshot) => {
      const data: Record<string, SaleData[]> = {};

      snapshot.docs.forEach((d) => {
        const sale = { ...(d.data() as SaleData), id: d.id };
        if (!data[sale.month]) data[sale.month] = [];
        data[sale.month].push(sale);
      });

      setSalesData(data);
    });

    return unsubscribe;
  }, []);

  /* ================= ADD SALE ================= */
  const handleAdd = async (
    data: Omit<SaleData, "id" | "month">
  ) => {
    await addDoc(collection(db, "sales"), {
      ...data,
      month: currentMonth,
    });
  };

  /* ================= SAVE EDIT ================= */
  const saveEdit = async () => {
    if (!editing) return;

    const ref = doc(db, "sales", editing.id);
    const parsedValue =
      isNaN(Number(editing.value))
        ? editing.value
        : Number(editing.value);

    await updateDoc(ref, {
      [editing.field]: parsedValue,
    });

    setEditing(null);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>
        📊 Sales Tracker – {currentMonth}
      </h2>

      {/* Month Selector */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setCurrentMonth(m)}
            style={{
              margin: 3,
              padding: "5px 10px",
              background: m === currentMonth ? "#4CAF50" : "#ddd",
              color: m === currentMonth ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Add Form */}
      <AddSaleForm onAdd={handleAdd} />

      {/* Table */}
      <table
        style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
        }}
      >
        <thead style={{ background: "#0077b6", color: "white" }}>
          <tr>
            {[
              "Product",
              "Given To",
              "Sales Made",
              "Sales Not Made",
              "Target",
              "Met",
            ].map((h) => (
              <th key={h} style={{ padding: 8 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {salesData[currentMonth]?.map((s) => (
            <tr key={s.id}>
              {(
                [
                  "product",
                  "givenTo",
                  "salesMade",
                  "salesNotMade",
                  "salesTarget",
                ] as const
              ).map((field) => (
                <td
                  key={field}
                  onClick={() =>
                    setEditing({
                      id: s.id,
                      field,
                      value: String(s[field]),
                    })
                  }
                  style={{
                    border: "1px solid #ccc",
                    padding: 6,
                    cursor: "pointer",
                  }}
                >
                  {editing?.id === s.id &&
                  editing.field === field ? (
                    <input
                      autoFocus
                      value={editing.value}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev
                            ? { ...prev, value: e.target.value }
                            : prev
                        )
                      }
                      onBlur={saveEdit}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    s[field]
                  )}
                </td>
              ))}

              <td style={{ textAlign: "center" }}>
                {s.salesMade >= s.salesTarget ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}