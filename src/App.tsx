import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import AddSaleForm from "./components/AddSaleForm";
import SalesTable from "./components/SalesTable";
import type { SaleData } from "./types/SaleData";

export default function App() {
  const [sales, setSales] = useState<SaleData[]>([]);
  const salesCollection = collection(db, "sales");

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

  const handleAdd = async (sale: Omit<SaleData, "id">) => {
    await addDoc(salesCollection, sale);
  };

  const totalReceived = sales.reduce((sum, s) => sum + s.totalReceived, 0);

  return (
    <div className="app">
      <h1>📊 Sales Tracker</h1>
      <AddSaleForm onAdd={handleAdd} />
      <SalesTable sales={sales} dbCollection={salesCollection} />
      <p>Total Received: {totalReceived}</p>
    </div>
  );
}