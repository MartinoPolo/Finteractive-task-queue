import type { ZodSchema } from 'zod';
import {
	ApiError,
	addTaskResponseSchema,
	clearCompletedResponseSchema,
	getCompletedTasksResponseSchema,
	getTasksResponseSchema,
	type ApiResponse
} from '../types/api';
import type { AddTaskInput, CompletedTask, Task } from '../types/task';
import { logger } from '../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RetryConfig {
	maxRetries: number;
	baseDelayMs: number;
	maxDelayMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 3,
	baseDelayMs: 1000,
	maxDelayMs: 10000
};

const SECONDS_TO_MS = 1000;
const DEFAULT_RATE_LIMIT_DELAY_SECONDS = 5;

/** Jitter factor to randomize retry delays and prevent thundering herd */
const JITTER_FACTOR = 0.3;

/**
 * Calculates exponential backoff delay with jitter.
 *
 * Uses the formula: min(baseDelay * 2^attempt + jitter, maxDelay)
 * Jitter adds randomness (0-30%) to prevent synchronized retries.
 */
const calculateBackoffDelay = (attempt: number, config: RetryConfig): number => {
	const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
	const jitter = Math.random() * JITTER_FACTOR * exponentialDelay;
	return Math.min(exponentialDelay + jitter, config.maxDelayMs);
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const validateResponse = <T>(schema: ZodSchema<T>, data: unknown, context: string): T => {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error(`API response validation failed [${context}]:`, result.error.issues);
		throw new ApiError(`Invalid response format from ${context}`, 500);
	}
	return result.data;
};

const isRetryableError = (error: unknown): boolean => {
	if (error instanceof ApiError) {
		const isServerError = error.statusCode >= 500;
		const isRateLimited = error.statusCode === 429;
		return isServerError || isRateLimited;
	}

	const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
	return isNetworkError;
};

const getRetryDelay = (error: unknown, attempt: number, config: RetryConfig): number => {
	if (error instanceof ApiError && error.retryAfter) {
		return error.retryAfter * SECONDS_TO_MS;
	}
	return calculateBackoffDelay(attempt, config);
};

interface RateLimitResponse {
	error?: string;
	retryAfter?: number;
}

const handleRateLimitResponse = async (response: Response): Promise<never> => {
	const data: RateLimitResponse = await response.json().catch(() => ({}));
	const retryAfter = data.retryAfter ?? DEFAULT_RATE_LIMIT_DELAY_SECONDS;
	throw new ApiError(data.error ?? 'Rate limit exceeded', 429, retryAfter);
};

const handleErrorResponse = async (response: Response): Promise<never> => {
	const data: ApiResponse<unknown> = await response.json().catch(() => ({}));
	const errorMessage = data.error ?? `HTTP error ${response.status}`;
	throw new ApiError(errorMessage, response.status);
};

/**
 * Performs an HTTP request with automatic retry logic.
 *
 * Features:
 * - Exponential backoff with jitter
 * - Respects server's retry-after header for rate limits
 * - Retries only on transient errors (5xx, 429, network failures)
 *
 * Returns unknown - callers should validate the response with Zod schemas.
 */
async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<unknown> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				}
			});

			if (response.status === 429) {
				await handleRateLimitResponse(response);
			}

			if (!response.ok) {
				await handleErrorResponse(response);
			}

			return await response.json();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			const isLastAttempt = attempt === retryConfig.maxRetries;
			const shouldRetry = isRetryableError(error) && !isLastAttempt;

			if (!shouldRetry) {
				throw lastError;
			}

			const delayMs = getRetryDelay(error, attempt, retryConfig);
			const attemptInfo = `attempt ${attempt + 1}/${retryConfig.maxRetries}`;

			console.warn(`API request failed, retrying in ${Math.round(delayMs)}ms (${attemptInfo})...`);
			await sleep(delayMs);
		}
	}

	// Unreachable: loop always throws on last attempt
	throw lastError ?? new Error('Unknown error');
}

export const taskApi = {
	/**
	 * GET /api/tasks - Get all tasks in queue
	 */
	async getTasks(): Promise<Task[]> {
		logger.http('GET', `${API_BASE_URL}/api/tasks`);
		const rawResponse = await fetchWithRetry(`${API_BASE_URL}/api/tasks`);
		const response = validateResponse(getTasksResponseSchema, rawResponse, 'getTasks');
		if (!response.success) {
			throw new ApiError(response.error || 'Failed to fetch tasks', 500);
		}
		return response.data || [];
	},

	/**
	 * POST /api/tasks - Add new task to queue
	 */
	async addTask(input: AddTaskInput): Promise<Task> {
		logger.http('POST', `${API_BASE_URL}/api/tasks`, input);
		const rawResponse = await fetchWithRetry(`${API_BASE_URL}/api/tasks`, {
			method: 'POST',
			body: JSON.stringify(input)
		});
		const response = validateResponse(addTaskResponseSchema, rawResponse, 'addTask');
		if (!response.success) {
			throw new ApiError(response.error || 'Failed to create task', 500);
		}
		if (!response.data) {
			throw new ApiError('No task data returned', 500);
		}
		return response.data;
	},

	/**
	 * GET /api/tasks/completed - Get completed tasks
	 */
	async getCompletedTasks(): Promise<CompletedTask[]> {
		logger.http('GET', `${API_BASE_URL}/api/tasks/completed`);
		const rawResponse = await fetchWithRetry(`${API_BASE_URL}/api/tasks/completed`);
		const response = validateResponse(
			getCompletedTasksResponseSchema,
			rawResponse,
			'getCompletedTasks'
		);
		if (!response.success) {
			throw new ApiError(response.error || 'Failed to fetch completed tasks', 500);
		}
		return response.data || [];
	},

	/**
	 * DELETE /api/tasks/completed - Clear completed tasks
	 */
	async clearCompletedTasks(): Promise<void> {
		logger.http('DELETE', `${API_BASE_URL}/api/tasks/completed`);
		const rawResponse = await fetchWithRetry(`${API_BASE_URL}/api/tasks/completed`, {
			method: 'DELETE'
		});
		const response = validateResponse(
			clearCompletedResponseSchema,
			rawResponse,
			'clearCompletedTasks'
		);
		if (!response.success) {
			throw new ApiError(response.error || 'Failed to clear completed tasks', 500);
		}
	}
};

export default taskApi;
