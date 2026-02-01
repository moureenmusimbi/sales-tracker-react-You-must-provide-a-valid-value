import { Timestamp } from "firebase/firestore";

export type SaleData = {
  id: string;
  date: Timestamp;          // Firestore timestamp
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  targetExpected: number;
  totalReceived: number;
};