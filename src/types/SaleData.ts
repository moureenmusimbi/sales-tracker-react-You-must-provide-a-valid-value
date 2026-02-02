// /src/types/SaleData.ts
import { Timestamp } from "firebase/firestore";

// Each sale record
export type SaleData = {
  id: string;               // Firestore doc id
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  targetExpected: number;
  totalReceived: number;
  date: Timestamp;          // Firestore timestamp
  result: "Achieved" | "Not Achieved";
};

// Totals summary
export type TotalsData = {
  salesMade: number;
  salesNotMade: number;
  totalReceived: number;
};