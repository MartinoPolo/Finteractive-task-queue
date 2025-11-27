import type { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import type { QueueState } from '../models/queue.model';
import type { CompletedTask, CreateTaskInput, Task } from '../models/task.model';

let io: Server | null = null;
let tasks: Task[] = [];
let completedTasks: CompletedTask[] = [];
let processingIntervalId: NodeJS.Timeout | null = null;
let currentProcessingTaskId: string | null = null;

interface QueueServiceConfig {
	agingFactor: number;
	progressIncrementMin: number;
	progressIncrementMax: number;
	processingInterval: number;
}

let config: QueueServiceConfig = {
	agingFactor: Number(process.env.AGING_FACTOR ?? '60'),
	progressIncrementMin: Number(process.env.PROGRESS_INCREMENT_MIN ?? '10'),
	progressIncrementMax: Number(process.env.PROGRESS_INCREMENT_MAX ?? '20'),
	processingInterval: Number(process.env.PROCESSING_INTERVAL ?? '5000')
};

const broadcast = {
	queueUpdate: (state: QueueState): void => {
		io?.emit('queue_update', state);
	},
	taskProgress: (task: Task): void => {
		io?.emit('task_progress', task);
	},
	taskCompleted: (task: CompletedTask): void => {
		io?.emit('task_completed', task);
	},
	taskAdded: (task: Task): void => {
		io?.emit('task_added', task);
	}
};

export const setSocketServer = (socketServer: Server): void => {
	io = socketServer;
};

// Aging prevents starvation - older tasks gradually gain priority
const calculateEffectivePriority = (task: Task): number => {
	const ageInSeconds = (Date.now() - new Date(task.createdAt).getTime()) / 1000;
	return task.priority + Math.floor(ageInSeconds / config.agingFactor);
};

const getSortedTasks = (): Task[] => {
	return [...tasks].sort((a, b) => calculateEffectivePriority(b) - calculateEffectivePriority(a));
};

export const getTasks = (): Task[] => getSortedTasks();

export const getCurrentTask = (): Task | null => {
	// If a task is already being processed, continue with it (no preemption)
	if (currentProcessingTaskId) {
		const currentTask = tasks.find((t) => t.id === currentProcessingTaskId);
		if (currentTask) {
			return currentTask;
		}
		// Task was removed or completed, clear the tracking
		currentProcessingTaskId = null;
	}
	// Pick the highest priority task
	const sorted = getSortedTasks();
	return sorted[0] ?? null;
};

export const addTask = (input: CreateTaskInput): Task => {
	const task: Task = {
		id: uuidv4(), // v4 random uuid
		name: input.name,
		priority: input.priority,
		progress: 0,
		createdAt: new Date()
	};

	tasks.push(task);
	broadcast.taskAdded(task);

	return task;
};

export const getQueueState = (): QueueState => {
	return {
		tasks: getSortedTasks(),
		completedTasks: getCompletedTasks(),
		currentTaskId: currentProcessingTaskId
	};
};

export const getCompletedTasks = (): CompletedTask[] => {
	return [...completedTasks].sort(
		(a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
	);
};

export const clearCompletedTasks = (): void => {
	completedTasks = [];
	broadcast.queueUpdate(getQueueState());
};

const processCurrentTask = (): void => {
	if (tasks.length === 0) {
		currentProcessingTaskId = null;
		return;
	}

	const currentTask = getCurrentTask();
	if (!currentTask) {
		return;
	}

	currentProcessingTaskId = currentTask.id;

	const taskIndex = tasks.findIndex((t) => t.id === currentTask.id);
	if (taskIndex === -1) {
		currentProcessingTaskId = null;
		return;
	}

	const increment =
		Math.floor(Math.random() * (config.progressIncrementMax - config.progressIncrementMin + 1)) +
		config.progressIncrementMin;

	tasks[taskIndex].progress = Math.min(100, tasks[taskIndex].progress + increment);
	broadcast.taskProgress(tasks[taskIndex]);

	if (tasks[taskIndex].progress >= 100) {
		const completedTask: CompletedTask = {
			...tasks[taskIndex],
			progress: 100,
			completedAt: new Date()
		};

		tasks.splice(taskIndex, 1);
		completedTasks.push(completedTask);
		currentProcessingTaskId = null;
		broadcast.taskCompleted(completedTask);
	}

	broadcast.queueUpdate(getQueueState());
};

export const startProcessing = (): void => {
	if (processingIntervalId) {
		return;
	}

	processingIntervalId = setInterval(processCurrentTask, config.processingInterval);
	console.log(`Task processing started (interval: ${config.processingInterval}ms)`);
};

// For testing ? Maybe not needed
export const stopProcessing = (): void => {
	if (processingIntervalId) {
		clearInterval(processingIntervalId);
		processingIntervalId = null;
		console.log('Task processing stopped');
	}
};

export const configure = (newConfig: Partial<QueueServiceConfig>): void => {
	config = { ...config, ...newConfig };
};

export const reset = (): void => {
	tasks = [];
	completedTasks = [];
	currentProcessingTaskId = null;
	stopProcessing();
};
