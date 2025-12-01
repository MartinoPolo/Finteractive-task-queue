import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
	addTask,
	completeTask,
	setConnectionStatus,
	setError,
	syncQueueState,
	updateTaskProgress
} from '../features/tasks/tasksSlice';
import { useAppDispatch } from '../store/hooks';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket';
import { OPERATION_ERROR_MESSAGES } from '../utils/errorMessages';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_CONFIG = {
	reconnection: true,
	reconnectionAttempts: 10,
	reconnectionDelay: 1000,
	reconnectionDelayMax: 10000,
	timeout: 20000,
	autoConnect: false
} as const;

/**
 * Hook for managing Socket.IO connection and real-time updates.
 * Initializes connection on mount, cleans up on unmount.
 */
export function useSocket(): void {
	const dispatch = useAppDispatch();
	const socketRef = useRef<TypedSocket | null>(null);
	const reconnectAttemptsRef = useRef(0);

	useEffect(() => {
		const socket = io(WS_URL, SOCKET_CONFIG) as TypedSocket;
		socketRef.current = socket;

		// Connection events
		socket.on('connect', () => {
			console.log('Socket connected:', socket.id);
			reconnectAttemptsRef.current = 0;
			dispatch(setConnectionStatus('connected'));
			socket.emit('join_queue');
		});

		socket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', reason);
			dispatch(setConnectionStatus('disconnected'));
			// Reconnect if server forced disconnect
			if (reason === 'io server disconnect') {
				setTimeout(() => socket.connect(), 1000);
			}
		});

		socket.on('connect_error', (error) => {
			console.error('Socket connection error:', error.message);
			reconnectAttemptsRef.current++;
			dispatch(setConnectionStatus('error'));
			dispatch(
				setError(
					reconnectAttemptsRef.current >= SOCKET_CONFIG.reconnectionAttempts
						? OPERATION_ERROR_MESSAGES.socketMaxRetries
						: OPERATION_ERROR_MESSAGES.socketConnection
				)
			);
		});

		// Application events
		socket.on('queue_update', (state) => dispatch(syncQueueState(state)));
		socket.on('task_progress', (task) =>
			dispatch(updateTaskProgress({ id: task.id, progress: task.progress }))
		);
		socket.on('task_completed', (task) => dispatch(completeTask(task)));
		socket.on('task_added', (task) => dispatch(addTask(task)));
		socket.on('server_shutdown', ({ message }) => {
			console.warn('Server shutdown:', message);
			dispatch(setError('Server is shutting down. Connection will be lost.'));
			dispatch(setConnectionStatus('disconnected'));
		});

		// Connect
		dispatch(setConnectionStatus('connecting'));
		socket.connect();

		// Cleanup
		return () => {
			socket.removeAllListeners();
			socket.disconnect();
		};
	}, [dispatch]);
}

export default useSocket;
