import { z } from "zod";

export interface Order {
	id: string;
	dayAndTime: Date;
	email: string;
	phone: string;
	name: string;
	blackHolderAmount: number;
	grayHolderAmount: number;
	lanyard1Amount: number;
	lanyard2Amount: number;
	lanyard3Amount: number;
	totalMoney: number;
	paymentMethod: string;
}

export const OrderSchema = z.object({
	id: z.string().optional(),
	dayAndTime: z.date(),
	email: z.string(),
	phone: z.string(),
	name: z.string(),
	blackHolderAmount: z.number(),
	grayHolderAmount: z.number(),
	lanyard1Amount: z.number(),
	lanyard2Amount: z.number(),
	lanyard3Amount: z.number(),
	totalMoney: z.number(),
});