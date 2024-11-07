import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import transactionRoutes from './routes/transaction';
import path from "path";

dotenv.config();

const PORT: number = parseInt(process.env.PORT as string, 10);
const DOMAIN: string = process.env.DOMAIN as string;

const app = express();

app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(express.urlencoded({ extended: true }));

app.use('/transaction', transactionRoutes); 
if (DOMAIN.includes('preorder')) {
	console.log('Using public folder');
	app.use(express.static(path.join(path.dirname(__dirname), 'public')));
}
else {
	console.log('Using public_offline folder');
	app.use(express.static(path.join(path.dirname(__dirname), 'public_offline')));
}

app.get('/', (req: Request, res: Response) => {
	console.log('GET /');
	if (DOMAIN.includes('localhost')) {
		console.info('DOMAIN includes localhost');
		res.sendFile(path.join(path.dirname(__dirname), 'public_offline', 'index.html'));
	}
	else if (DOMAIN.includes('preorder')) {
		console.info('DOMAIN includes preorder');
		res.sendFile(path.join(path.dirname(__dirname), 'public', 'index.html'));
	}
	else {
		console.info('DOMAIN includes production');
		res.sendFile(path.join(path.dirname(__dirname), 'public_offline', 'index.html'));
	}
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT} - http://localhost:${PORT}`);
	console.log("DOMAIN:", DOMAIN);
});