import cors from 'cors';
import express from 'express';
import taskRoutes from './routes/task.routes.js';

export function createApp() {
	const app = express();

	app.use(
		cors({
			origin: [
				'http://localhost:5173' // Vite default
			],
			methods: ['GET', 'POST', 'DELETE'],
			credentials: true
		})
	);

	app.use(express.json());

	app.use('/api/', taskRoutes);

	return app;
}
