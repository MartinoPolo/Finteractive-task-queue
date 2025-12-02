import type { Request, Response } from 'express';
import { addTaskSchema } from '../models/task.model';
import * as queueService from '../services/queue.service.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/tasks
 * Get all tasks in the queue sorted by priority
 */
export const getTasks = (_req: Request, res: Response) => {
	logger.http('GET', '/api/tasks');
	try {
		const tasks = queueService.getTasks();
		logger.httpRes('GET', '/api/tasks', 200);
		res.json({
			success: true,
			data: tasks,
			currentTaskId: queueService.getCurrentTask()?.id ?? null
		});
	} catch (error) {
		logger.error('Error getting tasks', error);
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve tasks'
		});
	}
};

/**
 * POST /api/tasks
 * Add a new task to the queue
 */
export const addTask = (req: Request, res: Response) => {
	logger.http('POST', '/api/tasks', req.body);
	try {
		const result = addTaskSchema.safeParse(req.body);

		if (!result.success) {
			logger.httpRes('POST', '/api/tasks', 400);
			res.status(400).json({
				success: false,
				error: result.error.issues.map((issue) => issue.message).join(', ')
			});
			return;
		}

		const task = queueService.addTask(result.data);
		logger.httpRes('POST', '/api/tasks', 201);
		res.status(201).json({
			success: true,
			data: task
		});
	} catch (error) {
		logger.error('Error adding task', error);
		res.status(500).json({
			success: false,
			error: 'Failed to add task'
		});
	}
};

/**
 * GET /api/tasks/completed
 * Get all completed tasks
 */
export const getCompletedTasks = (_req: Request, res: Response) => {
	logger.http('GET', '/api/tasks/completed');
	try {
		const completedTasks = queueService.getCompletedTasks();
		logger.httpRes('GET', '/api/tasks/completed', 200);
		res.json({
			success: true,
			data: completedTasks
		});
	} catch (error) {
		logger.error('Error getting completed tasks', error);
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve completed tasks'
		});
	}
};

/**
 * DELETE /api/tasks/completed
 * Clear all completed tasks
 */
export const clearCompletedTasks = (_req: Request, res: Response) => {
	logger.http('DELETE', '/api/tasks/completed');
	try {
		queueService.clearCompletedTasks();
		logger.httpRes('DELETE', '/api/tasks/completed', 200);
		res.json({
			success: true,
			message: 'Completed tasks cleared'
		});
	} catch (error) {
		logger.error('Error clearing completed tasks', error);
		res.status(500).json({
			success: false,
			error: 'Failed to clear completed tasks'
		});
	}
};
