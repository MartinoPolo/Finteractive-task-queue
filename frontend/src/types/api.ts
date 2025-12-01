import type { CompletedTask, QueueState, Task } from './task';

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface GetTasksResponse extends ApiResponse<Task[]> {
	currentTaskId?: string | null;
}
export interface AddTaskResponse extends ApiResponse<Task> {}
export interface GetCompletedTasksResponse extends ApiResponse<CompletedTask[]> {}
export interface ClearCompletedResponse extends ApiResponse<void> {
	message?: string;
}
export interface GetQueueStateResponse extends ApiResponse<QueueState> {}

export interface RateLimitErrorResponse {
	success: false;
	error: string;
	retryAfter: number;
}

export class ApiError extends Error {
	constructor(message: string, public statusCode: number, public retryAfter?: number) {
		super(message);
		this.name = 'ApiError';
	}
}
