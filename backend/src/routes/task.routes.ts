import { Router } from 'express';
import {
	addTask,
	clearCompletedTasks,
	getCompletedTasks,
	getQueueState,
	getTasks
} from '../controllers/task.controller';

const router = Router();

// Get all tasks in queue
router.get('/tasks', getTasks);

// Add new task to queue
router.post('/tasks', addTask);

// Get completed tasks
router.get('/tasks/completed', getCompletedTasks);

// Clear completed tasks
router.delete('/tasks/completed', clearCompletedTasks);

// Get complete queue state in one request
router.get('/queue/state', getQueueState);

export default router;
