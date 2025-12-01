import { Router } from 'express';
import {
	addTask,
	clearCompletedTasks,
	getCompletedTasks,
	getQueueState,
	getTasks
} from '../controllers/task.controller';

const router = Router();

router.get('/tasks', getTasks);
router.post('/tasks', addTask);
router.get('/tasks/completed', getCompletedTasks);
router.delete('/tasks/completed', clearCompletedTasks);
router.get('/queue/state', getQueueState);

export default router;
