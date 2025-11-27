import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import * as queueService from './services/queue.service.js';

const port = process.env.PORT || 8000;

const app = createApp();

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: ['http://localhost:5173'],
		methods: ['GET', 'POST'],
		credentials: true
	}
});

// Set Socket.IO server in queue service
queueService.setSocketServer(io);

io.on('connection', (socket) => {
	console.log(`Client connected: ${socket.id}`);

	// Client joins queue monitoring
	socket.on('join_queue', () => {
		console.log(`Client ${socket.id} joined queue monitoring`);
		// Send current queue state to the client
		socket.emit('queue_update', queueService.getQueueState());
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		console.log(`Client disconnected: ${socket.id}`);
	});
});

httpServer.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
	console.log(`Socket.IO server running on ws://localhost:${port}`);

	queueService.startProcessing();
});
