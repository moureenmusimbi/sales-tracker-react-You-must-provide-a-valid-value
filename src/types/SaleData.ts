export type SaleData = {
  id: string;
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  salesTarget: number;
  totalReceived: number;
  targetExpected: number;
  date: string;   // YYYY-MM-DD
  month: string;  // e.g. "2026-02"
};