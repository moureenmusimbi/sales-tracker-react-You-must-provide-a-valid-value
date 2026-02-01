import { Timestamp, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import type { SaleData } from "../types/SaleData";

type Props = {
  sales: SaleData[];
  dbCollection: any;
};

export default function SalesTable({ sales, dbCollection }: Props) {
  const [editing, setEditing] = useState<{ id: string; field: keyof SaleData } | null>(null);

  const handleCellUpdate = async (id: string, field: keyof SaleData, value: string) => {
    const ref = doc(dbCollection, id);

    const parsedValue =
      field === "product" || field === "givenTo"
        ? value
        : field === "date"
        ? Timestamp.fromDate(new Date(value))
        : Number(value);

    await updateDoc(ref, { [field]: parsedValue });
    setEditing(null);
  };

  const formatDate = (ts: Timestamp) => {
    const d = ts.toDate();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const renderCell = (s: SaleData, field: keyof SaleData) => {
    const value = s[field];
    if (editing && editing.id === s.id && editing.field === field) {
      return (
        <input
          autoFocus
          defaultValue={field === "date" ? value.toDate().toISOString().split("T")[0] : String(value)}
          onBlur={(e) => handleCellUpdate(s.id, field, e.target.value)}
        />
      );
    }
    return <span onClick={() => setEditing({ id: s.id, field })}>{field === "date" ? formatDate(value as Timestamp) : value}</span>;
  };

  return (
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
    </table>
  );
}