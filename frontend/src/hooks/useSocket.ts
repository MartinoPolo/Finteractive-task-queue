import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ZodSchema } from 'zod';
import {
	clearSocketConnectionError,
	completeTask,
	setConnectionStatus,
	setError,
	setSocketConnectionError,
	syncQueueState,
	updateTaskProgress
} from '../features/tasks/tasksSlice';
import { useAppDispatch } from '../store/hooks';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket';
import { completedTaskSchema, queueStateSchema, taskProgressUpdateSchema } from '../types/task';
import { OPERATION_ERROR_MESSAGES } from '../utils/errorMessages';
import { logger } from '../utils/logger';

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

const validateSocketPayload = <T>(
	schema: ZodSchema<T>,
	data: unknown,
	eventName: string
): T | null => {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error(`Socket event validation failed [${eventName}]:`, result.error.issues);
		return null;
	}
	return result.data;
};

export function useSocket(): void {
	const dispatch = useAppDispatch();
	const socketRef = useRef<TypedSocket | null>(null);
	const reconnectAttemptsRef = useRef(0);

	useEffect(() => {
		const socket = io(WS_URL, SOCKET_CONFIG) as TypedSocket;
		socketRef.current = socket;

		socket.on('connect', () => {
			logger.ws('←', 'connect', { id: socket.id });
			reconnectAttemptsRef.current = 0;
			dispatch(setConnectionStatus('connected'));
			dispatch(clearSocketConnectionError());
			logger.ws('→', 'join_queue');
			socket.emit('join_queue');
		});

		socket.on('disconnect', (reason) => {
			logger.ws('←', 'disconnect', { reason });
			dispatch(setConnectionStatus('disconnected'));
			// Reconnect if server forced disconnect
			if (reason === 'io server disconnect') {
				setTimeout(() => socket.connect(), 1000);
			}
		});

		socket.on('connect_error', (error) => {
			logger.error('Socket connection error', error);
			reconnectAttemptsRef.current++;
			dispatch(setConnectionStatus('error'));
			dispatch(
				setSocketConnectionError(
					reconnectAttemptsRef.current >= SOCKET_CONFIG.reconnectionAttempts
						? OPERATION_ERROR_MESSAGES.socketMaxRetries
						: OPERATION_ERROR_MESSAGES.socketConnection
				)
			);
		});

		socket.on('queue_update', (state) => {
			logger.ws('←', 'queue_update', { tasks: state.tasks.length });
			const validatedPayload = validateSocketPayload(queueStateSchema, state, 'queue_update');
			if (validatedPayload) {
				dispatch(syncQueueState(validatedPayload));
			}
		});

		socket.on('task_progress', (task) => {
			logger.ws('←', 'task_progress', { id: task.id.slice(0, 8), progress: task.progress });
			const validatedPayload = validateSocketPayload(
				taskProgressUpdateSchema,
				task,
				'task_progress'
			);
			if (validatedPayload) {
				dispatch(
					updateTaskProgress({ id: validatedPayload.id, progress: validatedPayload.progress })
				);
			}
		});

		socket.on('task_completed', (task) => {
			logger.ws('←', 'task_completed', { id: task.id.slice(0, 8), name: task.name });
			const validatedPayload = validateSocketPayload(completedTaskSchema, task, 'task_completed');
			if (validatedPayload) {
				dispatch(completeTask(validatedPayload));
			}
		});

		socket.on('server_shutdown', ({ message }) => {
			logger.ws('←', 'server_shutdown', { message });
			dispatch(setError('Server is shutting down. Connection will be lost.'));
			dispatch(setConnectionStatus('disconnected'));
		});

		dispatch(setConnectionStatus('connecting'));
		socket.connect();

		return () => {
			socket.removeAllListeners();
			socket.disconnect();
		};
	}, [dispatch]);
}
