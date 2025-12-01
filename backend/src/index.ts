import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import * as queueService from './services/queue.service.js';
import { logger } from './utils/logger.js';

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
	logger.ws('←', 'connection', { id: socket.id });

	// Client joins queue monitoring
	socket.on('join_queue', () => {
		logger.ws('←', 'join_queue', { id: socket.id });
		// Send current queue state to the client
		socket.emit('queue_update', queueService.getQueueState());
	});

	// Handle disconnection
	socket.on('disconnect', () => {
		logger.ws('←', 'disconnect', { id: socket.id });
	});
});

// Graceful shutdown handler
let isShuttingDown = false;
const gracefulShutdown = (signal: string) => {
	if (isShuttingDown) {
		return;
	}
	isShuttingDown = true;

	logger.info(`Graceful shutdown initiated (${signal})`);

	queueService.stopProcessing();
	logger.info('Queue processing stopped');

	io.emit('server_shutdown', { message: 'Server is shutting down' });
	logger.ws('→', 'server_shutdown');

	// Force close after 10 seconds
	const forceCloseTimeout = setTimeout(() => {
		logger.error('Force closing');
		process.exit(1);
	}, 10000);

	// Give clients time to receive the message, then close connections
	setTimeout(() => {
		// Close Socket.IO connections
		void io.close().then(() => {
			logger.info('Socket.IO connections closed');

			// Close HTTP server
			httpServer.close(() => {
				logger.info('HTTP server closed');
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
	logger.info(`Server running on http://localhost:${port}`);
	queueService.startProcessing();
});
