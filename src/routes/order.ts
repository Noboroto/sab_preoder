import { Router, Request, Response } from 'express';
import { Order } from '../models/oder';
import { QuickDB } from "quick.db";
import { storageDb } from './storage';
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

router.post('/', (req: Request, res: Response) => {
	const order: Order = {
		id: generateUniqueId(),
		dayAndTime: req.body.dayAndTime,
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

	checkStorage(order).then((result: boolean) => {
		if (!result) {
			res.status(409).send();
			return;
		}

		orderDb.set(order.id, order);
		res.status(201).send();
	}).catch(() => {
		res.status(500).send();
	});
});

router.get('/:id', (req: Request, res: Response) => {
	orderDb.get(req.params.id).then((order: Order) => {
		res.status(200).send(order);
	}).catch(() => {
		res.status(404).send();
	});
});


export default router;

const checkStorage = async (order: Order): Promise<boolean> => {
	const blackHolderAmount = await storageDb.get("blackHolderAmount") as number;
	const grayHolderAmount = await storageDb.get("grayHolderAmount") as number;
	const lanyard1Amount = await storageDb.get("lanyard1Amount") as number;
	const lanyard2Amount = await storageDb.get("lanyard2Amount") as number;
	const lanyard3Amount = await storageDb.get("lanyard3Amount") as number;

	if (blackHolderAmount < order.blackHolderAmount) {
		return false;
	}
	if (grayHolderAmount < order.grayHolderAmount) {
		return false;
	}
	if (lanyard1Amount < order.lanyard1Amount) {
		return false;
	}
	if (lanyard2Amount < order.lanyard2Amount) {
		return false;
	}
	if (lanyard3Amount < order.lanyard3Amount) {
		return false;
	}

	return true;
}