import { createApp } from './app.js';

const port = process.env.PORT || 8000;

const app = createApp();

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
