// WebSocket event types matching backend Socket.IO events

import type { CompletedTask, QueueState, Task } from './task';

export interface ClientToServerEvents {
	join_queue: () => void;
}

export interface ServerToClientEvents {
	queue_update: (state: QueueState) => void;
	task_progress: (task: Task) => void;
	task_completed: (task: CompletedTask) => void;
	task_added: (task: Task) => void;
	server_shutdown: (data: { message: string }) => void;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface SocketState {
	status: ConnectionStatus;
	error: string | null;
	reconnectAttempts: number;
}
