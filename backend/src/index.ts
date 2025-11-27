import express from 'express';
import taskRoutes from './routes/task.routes.js';

const port = process.env.PORT || 8000;

const app = express();

// Parse JSON request bodies
app.use(express.json());

app.use('/api/', taskRoutes);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
