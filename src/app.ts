import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import cors from "cors";
import helmet from "helmet";
import orderRoutes from './routes/order';
import storageRoutes from './routes/storage';
import path from "path";

dotenv.config();

if (!process.env.PORT) {
	process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			imgSrc: ["'self'", 'data:', 'https://img.vietqr.io'],
		},
	})
); 
app.use(cors());
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use('/order', orderRoutes); 
app.use('/storage', storageRoutes); 
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/', (req: Request, res: Response) => {
	res.sendFile(path.join(path.dirname(__dirname), 'public', 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Listening on port 3000 - http://localhost:${PORT}`);
});