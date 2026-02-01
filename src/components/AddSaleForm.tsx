import { useState } from "react";
import type { SaleData } from "../types/SaleData";
import { Timestamp } from "firebase/firestore";

type Props = {
  onAdd: (data: Omit<SaleData, "id">) => Promise<void>;
};

export default function AddSaleForm({ onAdd }: Props) {
  const [form, setForm] = useState<Omit<SaleData, "id">>({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    targetExpected: 0,
    totalReceived: 0,
    date: Timestamp.now(),
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({
      ...form,
      [key]:
        key === "product" || key === "givenTo"
          ? value
          : key === "date"
          ? Timestamp.fromDate(new Date(value))
          : Number(value),
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(form);
    setForm({
      product: "",
      givenTo: "",
      salesMade: 0,
      salesNotMade: 0,
      targetExpected: 0,
      totalReceived: 0,
      date: Timestamp.now(),
    });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <input
        type="date"
        value={form.date.toDate().toISOString().split("T")[0]}
        onChange={(e) => handleChange("date", e.target.value)}
      />
      <input
        placeholder="Product"
        value={form.product}
        onChange={(e) => handleChange("product", e.target.value)}
      />
      <input
        placeholder="Given To"
        value={form.givenTo}
        onChange={(e) => handleChange("givenTo", e.target.value)}
      />
      <input
        type="number"
        placeholder="Sales Made"
        value={form.salesMade}
        onChange={(e) => handleChange("salesMade", e.target.value)}
      />
      <input
        type="number"
        placeholder="Sales Not Made"
        value={form.salesNotMade}
        onChange={(e) => handleChange("salesNotMade", e.target.value)}
      />
      <input
        type="number"
        placeholder="Target"
        value={form.targetExpected}
        onChange={(e) => handleChange("targetExpected", e.target.value)}
      />
      <input
        type="number"
        placeholder="Received"
        value={form.totalReceived}
        onChange={(e) => handleChange("totalReceived", e.target.value)}
      />
      <button type="submit">Add Sale</button>
    </form>
  );
}