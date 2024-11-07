import { z } from "zod";

export interface Transaction {
	lastName: String,
	studentID: String,
	email: String,
	phone: String,
	firstName: String,
	totalMoney: Number,
	events: Map<String, Number>,
}

export const OrderSchema = z.object({
	lastName: z.string(),
	studentID: z.string(),
	email: z.string(),
	phone: z.string(),
	firstName: z.string(),
	totalMoney: z.number(),
	events: z.record(z.number()),
});