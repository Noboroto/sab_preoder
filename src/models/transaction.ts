import { z } from "zod";

export interface Transaction {
	transactionID: String;
	date: String;
	sellerID: String;
	customerID: String;
	customerName: String;
	products: Map<String, Number>;
}

export const TransactionSchema = z.object({
	transactionID: z.string(),
	date: z.string(),
	sellerID: z.string(),
	customerID: z.string(),
	customerName: z.string(),
	products: z.record(z.number()),
});
