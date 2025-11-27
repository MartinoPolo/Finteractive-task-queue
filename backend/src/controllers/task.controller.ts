import type { Request, Response } from 'express';
import { createTaskSchema } from '../models/task.model';
import * as queueService from '../services/queue.service.js';

/**
 * GET /api/tasks
 * Get all tasks in the queue sorted by priority
 */
export const getTasks = (_req: Request, res: Response) => {
	try {
		const tasks = queueService.getTasks();
		res.json({
			success: true,
			data: tasks,
			currentTaskId: queueService.getCurrentTask()?.id ?? null
		});
	} catch (error) {
		console.error('Error getting tasks:', error);
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
	try {
		const result = createTaskSchema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({
				success: false,
				error: result.error.issues.map((issue) => issue.message).join(', ')
			});
			return;
		}

		const task = queueService.addTask(result.data);

		res.status(201).json({
			success: true,
			data: task
		});
	} catch (error) {
		console.error('Error adding task:', error);
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
	try {
		const completedTasks = queueService.getCompletedTasks();
		res.json({
			success: true,
			data: completedTasks
		});
	} catch (error) {
		console.error('Error getting completed tasks:', error);
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
	try {
		queueService.clearCompletedTasks();
		res.json({
			success: true,
			message: 'Completed tasks cleared'
		});
	} catch (error) {
		console.error('Error clearing completed tasks:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to clear completed tasks'
		});
	}
};

/**
 * GET /api/queue/state
 * Get complete queue state (tasks, completed, current)
 */
export const getQueueState = (_req: Request, res: Response): void => {
	try {
		const state = queueService.getQueueState();
		res.json({
			success: true,
			data: state
		});
	} catch (error) {
		console.error('Error getting queue state:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve queue state'
		});
	}
};
