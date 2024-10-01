import { Router, Request, Response } from 'express';
import { Order } from '../models/order';
import { QuickDB } from "quick.db";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from 'crypto';  

const router = Router();

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
	let orderID = await randomString(8);
	while (await orderDb.has(orderID)) {
		orderID = await randomString(8);
	}
	const order: Order = {
		id: orderID,
		dayAndTime: new Date(),
		email: "",
		phone: "",
		name: req.body.name,
		blackHolderAmount: req.body.blackHolderAmount,
		grayHolderAmount: req.body.grayHolderAmount,
		lanyard1Amount: req.body.lanyard1Amount,
		lanyard2Amount: req.body.lanyard2Amount,
		lanyard3Amount: req.body.lanyard3Amount,
		totalMoney: req.body.totalMoney,
		paymentMethod: req.body.paymentMethod,
	}

	orderDb.set(order.id, order).then(() => {
		console.info(`[${order.dayAndTime}]Order ${order.id} created, name: ${order.name}`);
		// send the object with status code 201 Created
		res.status(201).json({
			orderID: order.id
		});
	}
	).catch((e) => {
		console.error(e)
		console.info(order)
		res.status(500).send();
	});
});

router.get('/item/:id', (req: Request, res: Response) => {
	const id = req.params.id;
	orderDb.get(id).then((order) => {
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

function randomString(length) {
	return randomBytes(length)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.substring(0, length);  
}