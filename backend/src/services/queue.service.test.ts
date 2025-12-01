import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as queueService from './queue.service.js';

describe('Queue Service', () => {
	beforeEach(() => {
		queueService.reset();
		queueService.configure({
			agingFactor: 60,
			progressIncrementMin: 10,
			progressIncrementMax: 20,
			processingInterval: 5000
		});
	});

	afterEach(() => {
		queueService.stopProcessing();
	});

	describe('addTask', () => {
		it('should create a task with correct properties', () => {
			const task = queueService.addTask({ name: 'Test Task', priority: 5 });

			expect(task).toMatchObject({
				name: 'Test Task',
				priority: 5,
				progress: 0
			});
			expect(task.id).toBeDefined();
			expect(task.createdAt).toBeInstanceOf(Date);
		});

		it('should add task to queue', () => {
			queueService.addTask({ name: 'Task 1', priority: 3 });
			queueService.addTask({ name: 'Task 2', priority: 7 });

			const tasks = queueService.getTasks();
			expect(tasks).toHaveLength(2);
		});
	});

	describe('getTasks (priority sorting)', () => {
		it('should return tasks sorted by priority (highest first)', () => {
			queueService.addTask({ name: 'Low', priority: 1 });
			queueService.addTask({ name: 'High', priority: 10 });
			queueService.addTask({ name: 'Medium', priority: 5 });

			const tasks = queueService.getTasks();
			expect(tasks[0].name).toBe('High');
			expect(tasks[1].name).toBe('Medium');
			expect(tasks[2].name).toBe('Low');
		});

		it('should boost priority of older tasks (aging)', () => {
			// Configure aggressive aging for testing
			queueService.configure({ agingFactor: 1 });

			const oldTask = queueService.addTask({ name: 'Old Low Priority', priority: 1 });
			// Simulate old task by backdating createdAt
			(oldTask as unknown as { createdAt: Date }).createdAt = new Date(Date.now() - 120000); // 2 minutes old

			queueService.addTask({ name: 'New High Priority', priority: 5 });

			const tasks = queueService.getTasks();
			// Old task with priority 1 + 120 seconds aging = effective priority > 5
			expect(tasks[0].name).toBe('Old Low Priority');
		});
	});

	describe('getCurrentTask', () => {
		it('should return first added task when queue was empty (non-preemptive)', () => {
			// First task added to empty queue becomes the current processing task
			const firstTask = queueService.addTask({ name: 'Low', priority: 1 });
			queueService.addTask({ name: 'High', priority: 10 });

			const current = queueService.getCurrentTask();
			// Non-preemptive: first task keeps processing even if higher priority arrives
			expect(current?.id).toBe(firstTask.id);
			expect(current?.name).toBe('Low');
		});

		it('should return null when queue is empty', () => {
			expect(queueService.getCurrentTask()).toBeNull();
		});
	});

	describe('getQueueState', () => {
		it('should return complete queue state', () => {
			queueService.addTask({ name: 'Task', priority: 5 });

			const state = queueService.getQueueState();

			expect(state).toHaveProperty('tasks');
			expect(state).toHaveProperty('completedTasks');
			expect(state).toHaveProperty('currentTaskId');
			expect(state.tasks).toHaveLength(1);
		});
	});

	describe('task processing', () => {
		it('should increment progress when processing', async () => {
			vi.useFakeTimers();
			queueService.configure({ processingInterval: 100 });

			const task = queueService.addTask({ name: 'Process Me', priority: 5 });
			queueService.startProcessing();

			vi.advanceTimersByTime(100);

			const tasks = queueService.getTasks();
			const updatedTask = tasks.find((t) => t.id === task.id);
			expect(updatedTask?.progress).toBeGreaterThan(0);

			vi.useRealTimers();
		});

		it('should move task to completed when progress reaches 100', async () => {
			vi.useFakeTimers();
			queueService.configure({
				processingInterval: 50,
				progressIncrementMin: 100,
				progressIncrementMax: 100
			});

			queueService.addTask({ name: 'Quick Task', priority: 5 });
			queueService.startProcessing();

			vi.advanceTimersByTime(50);

			expect(queueService.getTasks()).toHaveLength(0);
			expect(queueService.getCompletedTasks()).toHaveLength(1);
			expect(queueService.getCompletedTasks()[0].completedAt).toBeDefined();

			vi.useRealTimers();
		});
	});

	describe('clearCompletedTasks', () => {
		it('should remove all completed tasks', async () => {
			vi.useFakeTimers();
			queueService.configure({
				processingInterval: 50,
				progressIncrementMin: 100,
				progressIncrementMax: 100
			});

			queueService.addTask({ name: 'Task 1', priority: 5 });
			queueService.addTask({ name: 'Task 2', priority: 5 });
			queueService.startProcessing();

			vi.advanceTimersByTime(100);

			expect(queueService.getCompletedTasks().length).toBeGreaterThan(0);

			queueService.clearCompletedTasks();
			expect(queueService.getCompletedTasks()).toHaveLength(0);

			vi.useRealTimers();
		});
	});

	describe('processing control', () => {
		it('should track processing state correctly', () => {
			expect(queueService.isProcessing()).toBe(false);

			queueService.startProcessing();
			expect(queueService.isProcessing()).toBe(true);

			queueService.stopProcessing();
			expect(queueService.isProcessing()).toBe(false);
		});

		it('should not start multiple processing intervals', () => {
			queueService.startProcessing();
			queueService.startProcessing();

			// Should still only have one interval (no error thrown)
			expect(queueService.isProcessing()).toBe(true);
		});
	});
});
