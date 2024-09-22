import { Router, Request, Response } from 'express';
import { QuickDB } from "quick.db";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

const router = Router();
const storageDbPath = process.env.ORDER_DB_PATH || "./files/storage.sqlite";
const dirPath = path.dirname(storageDbPath);

if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath);
}

export const storageDb = new QuickDB({
	filePath: storageDbPath
});

(async() => {
	await storageDb.init();
	await storageDb.get("blackHolderAmount").then((value: number) => {
		if (value < 0 || isNaN(value) || value === undefined || value === null) {
			storageDb.set("blackHolderAmount", 0);
		}}
	)
	
	await storageDb.get("grayHolderAmount").then((value: number) => {
		if (value < 0 || isNaN(value) || value === undefined || value === null) {
			storageDb.set("grayHolderAmount", 0);
		}})
	
	await storageDb.get("lanyard1Amount").then((value: number) => {
		if (value < 0 || isNaN(value) || value === undefined || value === null) {
			storageDb.set("lanyard1Amount", 0);
		}})
	
	await storageDb.get("lanyard2Amount").then((value: number) => {
		if (value < 0 || isNaN(value) || value === undefined || value === null) {
			storageDb.set("lanyard2Amount", 0);
		}})
	
	await storageDb.get("lanyard3Amount").then((value: number) => {
		if (value < 0 || isNaN(value) || value === undefined || value === null) {
			storageDb.set("lanyard3Amount", 0);
		}})
})()

router.post('/', (req: Request, res: Response) => {
	const id: string = req.query.id as string;
	const value: number = z.number().parse(req.query.value);

	if (!id || !value) {
		res.status(400).send();
		return;
	}
	if (storageDb.has(id)) {
		res.status(409).send();
		return;
	}

	storageDb.set(id, value);

	res.status(201).send();
});

router.get('/:id', async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const value = await storageDb.get(id);

	if (value === undefined || value === null) {
		res.status(404).send("Not found");
		return;
	}
	console.log(`Key: ${id}, Value: ${value}`);
	res.status(200).json({ value });
});

router.put('/:id', (req: Request, res: Response) => {
	const id: string = req.params.id;
	const value: number = z.number().parse(req.query.value);

	if (!value) {
		res.status(400).send();
		return;
	}
	if (!storageDb.has(id)) {
		res.status(404).send();
		return;
	}

	storageDb.set(id, value);

	res.status(200).send();
});

router.get('/', (req: Request, res: Response) => {
	storageDb.all().then((data: any) => {
		res.status(200).json(data);
	});
});

export default router;