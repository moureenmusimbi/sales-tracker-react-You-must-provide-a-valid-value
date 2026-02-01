import { Timestamp } from "firebase/firestore";

export type SaleData = {
  id: string;
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  targetExpected: number;
  totalReceived: number;
  date: Timestamp; // Firestore Timestamp
};