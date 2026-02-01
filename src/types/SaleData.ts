export type SaleData = {
  id: string;
  product: string;
  givenTo: string;
  salesMade: number;
  salesNotMade: number;
  salesTarget: number; // ✅ single source of truth
  month: string;
};