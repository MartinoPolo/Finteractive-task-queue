import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import * as queueService from '../services/queue.service.js';

const app = createApp();

describe('Task Controller', () => {
	beforeEach(() => {
		queueService.reset();
	});

	afterEach(() => {
		queueService.stopProcessing();
	});

	describe('GET /api/tasks', () => {
		it('should return empty array when no tasks', async () => {
			const res = await request(app).get('/api/tasks');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data).toEqual([]);
		});

		it('should return tasks sorted by priority', async () => {
			queueService.addTask({ name: 'Low', priority: 1 });
			queueService.addTask({ name: 'High', priority: 10 });

			const res = await request(app).get('/api/tasks');

			expect(res.body.data[0].name).toBe('High');
			expect(res.body.data[0].priority).toBe(10);
			expect(res.body.data[1].name).toBe('Low');
			expect(res.body.data[1].priority).toBe(1);
		});
	});

	describe('POST /api/tasks', () => {
		it('should create task with valid input', async () => {
			const res = await request(app).post('/api/tasks').send({ name: 'New Task', priority: 5 });

			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.data.name).toBe('New Task');
			expect(res.body.data.priority).toBe(5);
		});

		it('should reject empty name', async () => {
			const res = await request(app).post('/api/tasks').send({ name: '', priority: 5 });

			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		it('should reject priority out of range', async () => {
			const res = await request(app).post('/api/tasks').send({ name: 'Task', priority: 11 });

			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		it('should reject non-integer priority', async () => {
			const res = await request(app).post('/api/tasks').send({ name: 'Task', priority: 5.5 });

			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});
	});

	describe('GET /api/tasks/completed', () => {
		it('should return empty array when no completed tasks', async () => {
			const res = await request(app).get('/api/tasks/completed');

			expect(res.status).toBe(200);
			expect(res.body.data).toEqual([]);
		});
	});

	describe('DELETE /api/tasks/completed', () => {
		it('should clear completed tasks', async () => {
			const res = await request(app).delete('/api/tasks/completed');

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});
	});

	describe('GET /api/queue/state', () => {
		it('should return complete queue state', async () => {
			queueService.addTask({ name: 'Task', priority: 5 });

			const res = await request(app).get('/api/queue/state');

			expect(res.status).toBe(200);
			expect(res.body.data).toHaveProperty('tasks');
			expect(res.body.data).toHaveProperty('completedTasks');
			expect(res.body.data).toHaveProperty('currentTaskId');
		});
	});
});
