import { Router, Request, Response } from 'express';
import { Order } from '../models/oder';
import { QuickDB } from "quick.db";
import { storageDb } from './storage';
import { sendEmail } from '../utils/sendEmail';
import * as fs from "fs";
import * as path from "path";

const router = Router();

function generateUniqueId(): string {
	return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

const orderDbPath = process.env.ORDER_DB_PATH || "./files/orders.sqlite";
const dirPath = path.dirname(orderDbPath);

if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath);
}

export const orderDb = new QuickDB({
	filePath: orderDbPath
});
orderDb.init();

router.post('/', async (req: Request, res: Response) => {
	const order: Order = {
		id: generateUniqueId(),
		dayAndTime: new Date(),
		email: req.body.email,
		phone: req.body.phone,
		name: req.body.name,
		blackHolderAmount: req.body.blackHolderAmount,
		grayHolderAmount: req.body.grayHolderAmount,
		lanyard1Amount: req.body.lanyard1Amount,
		lanyard2Amount: req.body.lanyard2Amount,
		lanyard3Amount: req.body.lanyard3Amount,
		totalMoney: req.body.totalMoney
	}

	orderDb.set(order.id, order).then(() => {
		handleEmail(order).then(() => {
			res.status(200).send(order);
		}).catch(() => {
			console.error("Error sending email");
			res.status(500).send();
		});
	}).catch(() => {
		res.status(500).send();
	});

});

router.get('/item/:id', (req: Request, res: Response) => {
	orderDb.get(req.params.id).then((order: Order) => {
		res.status(200).send(order);
	}).catch(() => {
		res.status(404).send();
	});
});


router.get('/sheet', async (req: Request, res: Response) => {
	const auth = req.query.auth as string;
	if (auth !== process.env.AUTH && auth !== "") {
		res.status(401).send();
		return;
	}
	// return all orders in json format
	const orders = await orderDb.all();
	res.status(200).send(orders);
});


export default router;

const handleEmail = async (order: Order): Promise<void> => {
	const orderTimeStr = order.dayAndTime.toLocaleString("vi-VN", {
		timeZone: "Asia/Ho_Chi_Minh",
		day: "2-digit",
		month: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	const replacements = new Map<string, string>();
	replacements.set("Name", order.name);
	replacements.set("OrderDate", orderTimeStr);
	replacements.set("blackHolderAmount", order.blackHolderAmount.toString());
	replacements.set("grayHolderAmount", order.grayHolderAmount.toString());
	replacements.set("lanyard1Amount", order.lanyard1Amount.toString());
	replacements.set("lanyard2Amount", order.lanyard2Amount.toString());
	replacements.set("lanyard3Amount", order.lanyard3Amount.toString());
	replacements.set("Total", (order.totalMoney / 1000).toString());
	replacements.set("Phone", order.phone);

	await sendEmail(order.email, replacements);
}


const updateStorage = async (order: Order): Promise<void> => {
	const blackHolderAmount = await storageDb.get("blackHolderAmount") as number;
	const grayHolderAmount = await storageDb.get("grayHolderAmount") as number;
	const lanyard1Amount = await storageDb.get("lanyard1Amount") as number;
	const lanyard2Amount = await storageDb.get("lanyard2Amount") as number;
	const lanyard3Amount = await storageDb.get("lanyard3Amount") as number;

	storageDb.set("blackHolderAmount", blackHolderAmount - order.blackHolderAmount);
	storageDb.set("grayHolderAmount", grayHolderAmount - order.grayHolderAmount);
	storageDb.set("lanyard1Amount", lanyard1Amount - order.lanyard1Amount);
	storageDb.set("lanyard2Amount", lanyard2Amount - order.lanyard2Amount);
	storageDb.set("lanyard3Amount", lanyard3Amount - order.lanyard3Amount);
}