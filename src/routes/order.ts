import { Router, Request, Response } from 'express';
import { Order } from '../models/order';
import { QuickDB } from "quick.db";
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
	if (process.env.DOMAIN == "preorder.sab.edu.vn") {
		res.status(500).send();
	}
	const order: Order = {
		id: generateUniqueId(),
		dayAndTime: new Date(),
		email: "",
		phone: "",
		name: req.body.id,
		blackHolderAmount: req.body.blackHolderAmount,
		grayHolderAmount: req.body.grayHolderAmount,
		lanyard1Amount: req.body.lanyard1Amount,
		lanyard2Amount: req.body.lanyard2Amount,
		lanyard3Amount: req.body.lanyard3Amount,
		totalMoney: req.body.totalMoney,
		paymentMethod: req.body.paymentMethod,
	}

	orderDb.set(order.id, order).then(() => {
		res.status(200).send(order);
	}
	).catch(() => {
		res.status(500).send();
	});
});

router.get('/item/:id', (req: Request, res: Response) => {
	res.status(500).send();
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
