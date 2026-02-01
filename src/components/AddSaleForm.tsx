import { useState } from "react";
import type { SaleData } from "../types/SaleData";
import { Timestamp } from "firebase/firestore";

type Props = {
  onAdd: (data: Omit<SaleData, "id">) => Promise<void>;
};

export default function AddSaleForm({ onAdd }: Props) {
  const [form, setForm] = useState({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    targetExpected: 0,
    totalReceived: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onAdd({
      ...form,
      date: Timestamp.fromDate(new Date(form.date)),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "product" || name === "givenTo" || name === "date"
          ? value
          : Number(value),
    }));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <input type="date" name="date" value={form.date} onChange={handleChange} />
      <input name="product" placeholder="Product" onChange={handleChange} />
      <input name="givenTo" placeholder="Given To" onChange={handleChange} />
      <input type="number" name="salesMade" placeholder="Sales Made" onChange={handleChange} />
      <input type="number" name="salesNotMade" placeholder="Sales Not Made" onChange={handleChange} />
      <input type="number" name="targetExpected" placeholder="Target" onChange={handleChange} />
      <input type="number" name="totalReceived" placeholder="Received" onChange={handleChange} />
      <button type="submit">➕ Add</button>
    </form>
  );
}