import { z } from "zod";

export interface Transaction {
  transactionID: String;
  date: String;
  sellerID: String;
  customerID: String;
  customerName: String;
  combo1: Number;
  combo2: Number;
  combo3: Number;
  combo4: Number;
  total: Number;
  payment: String;
  isPreOrder: Boolean;
}

export const TransactionSchema = z.object({
  transactionID: z.string(),
  date: z.string(),
  sellerID: z.string(),
  customerID: z.string(),
  customerName: z.string(),
  combo1: z.number(),
  combo2: z.number(),
  combo3: z.number(),
  combo4: z.number(),
  total: z.number(),
  payment: z.string(),
  isPreOrder: z.boolean(),
});
