import { Router, Request, Response } from 'express';
import { Order } from '../models/oder';
import { QuickDB } from "quick.db";

const router = Router();

function generateUniqueId(): string {
	return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

const orderDbPath = process.env.ORDER_DB_PATH || "../../files/orders.sqlite";
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

	orderDb.set(order.id, order);
	res.status(201).send();
});

router.get('/:id', (req: Request, res: Response) => {
	orderDb.get(req.params.id).then((order: Order) => {
		res.status(200).send(order);
	}).catch(() => {
		res.status(404).send();
	});
});


export default router;