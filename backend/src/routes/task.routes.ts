import { Router } from 'express';
import {
	addTask,
	clearCompletedTasks,
	getCompletedTasks,
	getTasks
} from '../controllers/task.controller';

const router = Router();

/**
 * Task Routes
 *
 * GET  /api/tasks           - Get all tasks in queue
 * POST /api/tasks           - Add new task to queue
 * GET  /api/tasks/completed - Get completed tasks
 * DELETE /api/tasks/completed - Clear completed tasks
 */

// Get all tasks in queue
router.get('/tasks', getTasks);

// Add new task to queue
router.post('/tasks', addTask);

// Get completed tasks
router.get('/tasks/completed', getCompletedTasks);

// Clear completed tasks
router.delete('/tasks/completed', clearCompletedTasks);

export default router;
