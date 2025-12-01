import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import api from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	const createSuccessResponse = <T>(data: T) => ({
		ok: true,
		status: 200,
		json: () => Promise.resolve({ success: true, data })
	});

	const createErrorResponse = (status: number, error: string) => ({
		ok: false,
		status,
		json: () => Promise.resolve({ success: false, error })
	});

	describe('getTasks', () => {
		it('fetches and returns validated tasks', async () => {
			const tasks = [
				{
					id: 'task-1',
					name: 'Test Task',
					priority: 5,
					progress: 50,
					createdAt: '2024-01-01T12:00:00.000Z'
				}
			];
			mockFetch.mockResolvedValueOnce(createSuccessResponse(tasks));

			const result = await api.getTasks();

			expect(result).toEqual(tasks);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tasks'),
				expect.objectContaining({ headers: { 'Content-Type': 'application/json' } })
			);
		});

		it('throws ApiError on HTTP error (non-retryable)', async () => {
			// 400 errors are not retryable, so this throws immediately
			mockFetch.mockResolvedValueOnce(createErrorResponse(400, 'Bad Request'));

			await expect(api.getTasks()).rejects.toThrow(ApiError);
		});
	});

	describe('addTask', () => {
		it('sends POST request and returns created task', async () => {
			const newTask = {
				id: 'task-1',
				name: 'New Task',
				priority: 5,
				progress: 0,
				createdAt: '2024-01-01T12:00:00.000Z'
			};
			mockFetch.mockResolvedValueOnce(createSuccessResponse(newTask));

			const result = await api.addTask({ name: 'New Task', priority: 5 });

			expect(result).toEqual(newTask);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tasks'),
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ name: 'New Task', priority: 5 })
				})
			);
		});
	});

	describe('clearCompletedTasks', () => {
		it('sends DELETE request', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ success: true })
			});

			await api.clearCompletedTasks();

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/tasks/completed'),
				expect.objectContaining({ method: 'DELETE' })
			);
		});
	});

	describe('response validation', () => {
		it('throws on invalid response format', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ invalid: 'response' })
			});

			await expect(api.getTasks()).rejects.toThrow('Invalid response format');
		});

		it('throws on invalid task data in response', async () => {
			const invalidTasks = [{ id: 'task-1', name: 'Task', priority: 'not-a-number' }];
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ success: true, data: invalidTasks })
			});

			await expect(api.getTasks()).rejects.toThrow('Invalid response format');
		});
	});

	describe('error handling', () => {
		it('includes status code in ApiError', async () => {
			mockFetch.mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));

			try {
				await api.getTasks();
				expect.fail('Should have thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(ApiError);
				expect((error as ApiError).statusCode).toBe(404);
				expect((error as ApiError).message).toBe('Not Found');
			}
		});
	});
});
