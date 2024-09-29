import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import orderRoutes from './routes/order';
import storageRoutes from './routes/storage';
import path from "path";

dotenv.config();

const PORT: number = parseInt(process.env.PORT as string, 10);
const DOMAIN: string = process.env.DOMAIN as string;

const app = express();

app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use(express.urlencoded({ extended: true }));

app.use('/order', orderRoutes); 
app.use('/storage', storageRoutes); 
if (DOMAIN.includes('preorder')) {
	app.use(express.static(path.join(path.dirname(__dirname), 'public')));
}
else {
	app.use(express.static(path.join(path.dirname(__dirname), 'public_offline')));
}

app.get('/', (req: Request, res: Response) => {
	console.log('GET /');
	console.log('DOMAIN:', DOMAIN);
	if (DOMAIN.includes('localhost')) {
		console.log('Sending offline.html');
		res.sendFile(path.join(path.dirname(__dirname), 'public_offline', 'index.html'));
	}
	else if (DOMAIN.includes('preorder')) {
		console.log('Sending index.html');
		res.sendFile(path.join(path.dirname(__dirname), 'public', 'index.html'));
	}
	else {
		console.log('Sending offline.html');
		res.sendFile(path.join(path.dirname(__dirname), 'public_offline', 'index.html'));
	}
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT} - http://localhost:${PORT}`);
	console.log("DOMAIN:", DOMAIN);
});