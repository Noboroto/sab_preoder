import * as dotenv from "dotenv";
import express, { Request, Response } from 'express';
import cors from "cors";
import helmet from "helmet";
import orderRoutes from './routes/order';
import storageRoutes from './routes/storage';
import path from "path";

dotenv.config();

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

const corsOptions = {
	origin: '*', // Allow all domains
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
	allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Allowed headers
	credentials: true, // Allow cookies to be sent (if needed)
};
app.use(cors(corsOptions));
app.use(express.json()); // Add this line to enable JSON parsing in the request body
app.use('/order', orderRoutes); 
app.use('/storage', storageRoutes); 
app.use(express.static(path.join(path.dirname(__dirname), 'public')));

app.get('/', (req: Request, res: Response) => {
	console.log('GET /');
	res.sendFile(path.join(path.dirname(__dirname), 'public', 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT} - http://localhost:${PORT}`);
});