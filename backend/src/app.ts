import cors from 'cors';
import express from 'express';
import { rateLimiter } from './middleware/rateLimiter.js';
import taskRoutes from './routes/task.routes.js';

export function createApp() {
	const app = express();

	app.use(
		cors({
			origin: [
				'http://localhost:5173', // Vite default
				'http://localhost:3001',
				'http://127.0.0.1:5173'
			],
			methods: ['GET', 'POST', 'DELETE'],
			credentials: true
		})
	);

	app.use(express.json());

	app.use('/api/', rateLimiter);

	app.use('/api/', taskRoutes);

	return app;
}
