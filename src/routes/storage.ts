import { Router, Request, Response } from 'express';
import { QuickDB } from "quick.db";

const router = Router();
const storageDbPath = process.env.ORDER_DB_PATH || "../../files/storage.sqlite";
export const storageDb = new QuickDB({
	filePath: storageDbPath
});
storageDb.init();

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