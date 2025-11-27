import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import * as queueService from './services/queue.service.js';

const port = process.env.PORT || 3000;

const app = createApp();

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: ['http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
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

// Graceful shutdown handler
let isShuttingDown = false;
const gracefulShutdown = (signal: string) => {
	if (isShuttingDown) {
		return;
	}
	isShuttingDown = true;

	console.log(`\nGraceful shutdown initiated (${signal})...`);

	queueService.stopProcessing();
	console.log('Queue processing stopped');

	io.emit('server_shutdown', { message: 'Server is shutting down' });
	console.log('Shutdown message sent to clients');

	// Force close after 10 seconds
	const forceCloseTimeout = setTimeout(() => {
		console.log('Force closing...');
		process.exit(1);
	}, 10000);

	// Give clients time to receive the message, then close connections
	setTimeout(() => {
		// Close Socket.IO connections
		void io.close().then(() => {
			console.log('Socket.IO connections closed');

			// Close HTTP server
			httpServer.close(() => {
				console.log('HTTP server closed');
				clearTimeout(forceCloseTimeout);
				process.exit(0);
			});
		});
	}, 500);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle Windows-specific close event
if (process.platform === 'win32') {
	process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
}

httpServer.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
	console.log(`Socket.IO server running on ws://localhost:${port}`);

	queueService.startProcessing();
});
