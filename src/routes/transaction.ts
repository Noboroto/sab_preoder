import { Router, Request, Response } from 'express';
import { Transaction } from '../models/transaction';
import { QuickDB } from "quick.db";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from 'crypto';  

const router = Router();

const transactionDbPath = process.env.TRANSACTION_DB_PATH || "./files/Transactions.sqlite";
const dirPath = path.dirname(transactionDbPath);

if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath);
}

export const transactionDb = new QuickDB({
	filePath: transactionDbPath
});
transactionDb.init();

router.post('/', async (req: Request, res: Response) => {
	let orderID = await randomString(8);
	while (await transactionDb.has(orderID)) {
		orderID = await randomString(8);
	}
	const info: Transaction = {
		lastName: req.body.lastName,
		studentID: req.body.studentID,
		email: req.body.email,
		phone: req.body.phone,
		firstName: req.body.firstName,
		totalMoney: req.body.totalMoney,
		events: req.body.events,
	}

	const current = new Date();
	// convert to UTC +7 timezone
	current.setHours(current.getHours() + 7);
	transactionDb.set(orderID, info).then(() => {
		console.info(`[${current.toISOString()}] Order ${orderID} created`);
		// send the object with status code 200 Created
		res.status(200)
	}
	).catch((e) => {
		console.error(e)
		console.info(info)
		res.status(500).send();
	});
});

router.get('/item/:id', (req: Request, res: Response) => {
	const id = req.params.id;
	transactionDb.get(id).then((order) => {
		res.status(200).send(order);
	}).catch(() => {
		res.status(500).send();
	});
});


router.get('/sheet', async (req: Request, res: Response) => {
	const auth = req.query.auth as string;
	if (auth !== process.env.AUTH && auth !== "") {
		res.status(401).send();
		return;
	}
	// return all orders in json format
	const orders = await transactionDb.all();
	res.status(200).send(orders);
});


export default router;

function randomString(length) {
	return randomBytes(length)
		.toString('base64')
		.replace(/[^a-zA-Z0-9]/g, '')
		.substring(0, length);  
}