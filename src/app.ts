import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import cors from "cors";
import helmet from "helmet";
import orderRoutes from './routes/order';


dotenv.config();

if (!process.env.PORT) {
	process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use('/order', orderRoutes); // Add this line to mount the Task API routes

app.get('/', (req: Request, res: Response) => {
	res.send('Hello, everyone!');
});

app.listen(PORT, () => {
	console.log(`Listening on port 3000 - http://localhost:${PORT}`);
});