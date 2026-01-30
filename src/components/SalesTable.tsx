import { useState, useEffect } from "react";
import AddSaleForm from "./AddSaleForm";
import { db } from "./firebase"; // Firebase config
import { collection, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";

type SaleData = {
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  target: number;
};

export default function SalesTable() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()]);
  const [salesData, setSalesData] = useState<Record<string, SaleData[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // Load data from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sales"), (snapshot) => {
      const data: Record<string, SaleData[]> = {};
      snapshot.docs.forEach(docSnap => {
        const docData = docSnap.data() as SaleData & { month: string };
        if (!data[docData.month]) data[docData.month] = [];
        data[docData.month].push(docData);
      });
      setSalesData(data);
    });
    return () => unsubscribe();
  }, []);

  // Add new sale
  const handleAdd = async (data: SaleData) => {
    const saleWithMonth = { ...data, month: currentMonth };
    await addDoc(collection(db, "sales"), saleWithMonth);
  };

  // Start editing a cell
  const handleEdit = (idx: number, field: string) => {
    setEditingId(idx.toString());
    setEditingField(field);
    setEditingValue(salesData[currentMonth][idx][field as keyof SaleData].toString());
  };

  // Save edited cell
  const saveEdit = async (idx: number) => {
    if (editingId === null || editingField === null) return;
    const updatedData = [...salesData[currentMonth]];
    (updatedData[idx] as any)[editingField] = isNaN(Number(editingValue)) ? editingValue : Number(editingValue);

    // Update in Firebase
    const docId = ""; // You need a way to store Firebase doc IDs for each sale
    if (docId) {
      await updateDoc(doc(db, "sales", docId), { [editingField]: (updatedData[idx] as any)[editingField] });
    }

    setSalesData(prev => ({ ...prev, [currentMonth]: updatedData }));
    setEditingId(null);
    setEditingField(null);
  };

  return (
    <div style={{ width: "100%", padding: "20px", overflowX: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign:"center", marginBottom:"20px" }}>📊 Sales Tracker - {currentMonth}</h2>

      {/* Month Navigation */}
      <div style={{ marginBottom:"10px", display:"flex", justifyContent:"center", gap:"5px", flexWrap:"wrap" }}>
        {months.map(month => (
          <button
            key={month}
            style={{
              padding:"5px 10px",
              backgroundColor: month === currentMonth ? "#4CAF50":"#ddd",
              color: month===currentMonth?"white":"black",
              border:"none",
              borderRadius:"4px",
              cursor:"pointer"
            }}
            onClick={()=>setCurrentMonth(month)}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Add Sale Form */}
      <AddSaleForm onAdd={handleAdd} />

      {/* Sales Table */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginTop:"20px" }}>
        <thead style={{ backgroundColor:"#0077b6", color:"white" }}>
          <tr>
            {["Product","Given To","Sales Made","Sales Not Made","Target","Target Met"].map(head => (
              <th key={head} style={{border:"1px solid #0077b6", padding:"8px"}}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {salesData[currentMonth]?.map((sale, idx) => (
            <tr key={idx} style={{ borderBottom:"1px solid #ccc", height:"50px" }}>
              {(["product","givenTo","salesMade","salesNotMade","target"] as (keyof SaleData)[]).map(field => (
                <td
                  key={field}
                  style={{border:"1px solid #ccc", padding:"5px", cursor:"pointer", textAlign:"center"}}
                  onClick={()=>handleEdit(idx, field)}
                >
                  {editingId === idx.toString() && editingField === field ? (
                    <input
                      value={editingValue}
                      onChange={e=>setEditingValue(e.target.value)}
                      onBlur={()=>saveEdit(idx)}
                      autoFocus
                      style={{
                        width:"100%",
                        padding:"5px",
                        border:"1px solid #0077b6",
                        borderRadius:"4px",
                        textAlign:"center"
                      }}
                    />
                  ) : (
                    sale[field]
                  )}
                </td>
              ))}
              <td style={{border:"1px solid #ccc", padding:"5px"}}>
                {sale.salesMade >= sale.target ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
