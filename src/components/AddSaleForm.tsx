import { useState } from "react";
import type { SaleData } from "../types/SaleData";

type Props = {
  onAdd: (data: Omit<SaleData, "id">) => Promise<void>;
};

export default function AddSaleForm({ onAdd }: Props) {
  const [form, setForm] = useState<Omit<SaleData, "id">>({
    product: "",
    givenTo: "",
    salesMade: 0,
    salesNotMade: 0,
    salesTarget: 0,
    totalReceived: 0,
    targetExpected: 0,
    date: "",
    month: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(form);
    setForm({
      product: "",
      givenTo: "",
      salesMade: 0,
      salesNotMade: 0,
      salesTarget: 0,
      totalReceived: 0,
      targetExpected: 0,
      date: "",
      month: "",
    });
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({
      ...form,
      [key]: isNaN(Number(value)) ? value : Number(value),
    });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.entries(form).map(([key, value]) => (
        <input
          key={key}
          placeholder={key}
          value={value}
          onChange={(e) => handleChange(key as keyof typeof form, e.target.value)}
        />
      ))}
      <button type="submit">Add Monthly Sale</button>
    </form>
  );
}