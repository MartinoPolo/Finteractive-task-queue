import type { Request, Response } from 'express';
import { createTaskSchema, type Task } from '../models/task.model';

/**
 * GET /api/tasks
 * Get all tasks in the queue sorted by priority
 */
export const getTasks = (req: Request, res: Response) => {
	try {
		// const tasks = queueService.getTasks()
		const tasks: Task[] = []; // TODO: implement
		res.json({
			success: true,
			data: tasks
			//   currentTaskId: queueService.getCurrentTask()?.id ?? null
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

		// const task = queueService.addTask(result.data)
		// TODO implement
		const task: Task = {
			id: 'temp-id',
			name: result.data.name,
			priority: result.data.priority,
			progress: 0,
			createdAt: new Date()
		};

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
		// const completedTasks = queueService.getCompletedTasks();
		const completedTasks: Task[] = []; // TODO: implement
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
		// queueService.clearCompletedTasks();
		// TODO implement
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
