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
}