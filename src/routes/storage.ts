import { Router, Request, Response } from 'express';
import { QuickDB } from "quick.db";
import * as fs from "fs";
import * as path from "path";

const router = Router();
const storageDbPath = process.env.ORDER_DB_PATH || "./files/storage.sqlite";
const dirPath = path.dirname(storageDbPath);

if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath);
}

export const storageDb = new QuickDB({
	filePath: storageDbPath
});
storageDb.init();

if (!storageDb.has("blackHolderAmount")) {
	storageDb.set("blackHolderAmount", 0);
}
if (!storageDb.has("grayHolderAmount")) {
	storageDb.set("grayHolderAmount", 0);
}
if (!storageDb.has("lanyard1Amount")) {
	storageDb.set("lanyard1Amount", 0);
}
if (!storageDb.has("lanyard2Amount")) {
	storageDb.set("lanyard2Amount", 0);
}
if (!storageDb.has("lanyard3Amount")) {
	storageDb.set("lanyard3Amount", 0);
}

router.post('/', (req: Request, res: Response) => {
	const id: string = req.body.id;
	const value: number = req.body.value;

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

router.get('/:id', (req: Request, res: Response) => {
	const id: string = req.params.id;
	const value = storageDb.get(id);

	if (!value) {
		res.status(404).send();
		return;
	}

	res.status(200).json({ value });
});

router.put('/:id', (req: Request, res: Response) => {
	const id: string = req.params.id;
	const value: number = req.body.value;

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