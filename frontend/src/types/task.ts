import z from 'zod';

export const taskSchema = z.object({
	id: z.string().min(1, 'Task ID is required'),
	name: z.string().min(1, 'Task name is required'),
	priority: z.number().int().min(1).max(10),
	progress: z.number().min(0).max(100),
	createdAt: z.iso.datetime({ message: 'Invalid createdAt date format' })
});

export const completedTaskSchema = taskSchema.extend({
	completedAt: z.iso.datetime({ message: 'Invalid completedAt date format' })
});

export const queueStateSchema = z.object({
	tasks: z.array(taskSchema),
	completedTasks: z.array(completedTaskSchema),
	currentTaskId: z.string().nullable()
});

export const taskProgressUpdateSchema = z.object({
	id: z.string().min(1, 'Task ID is required'),
	progress: z.number().min(0).max(100)
});

export const addTaskSchema = z.object({
	name: z.string().trim().min(1, 'Task name must be a non-empty string'),
	priority: z
		.number()
		.int('Priority must be an integer')
		.min(1, 'Priority must be at least 1')
		.max(10, 'Priority must be at most 10')
});

export type Task = z.infer<typeof taskSchema>;
export type CompletedTask = z.infer<typeof completedTaskSchema>;
export type QueueState = z.infer<typeof queueStateSchema>;
export type TaskProgressUpdate = z.infer<typeof taskProgressUpdateSchema>;
export type AddTaskInput = z.infer<typeof addTaskSchema>;

export type PriorityLevel = 'high' | 'medium' | 'low';

export const getPriorityLevel = (priority: number): PriorityLevel => {
	if (priority >= 7) {
		return 'high';
	}
	if (priority >= 4) {
		return 'medium';
	}
	return 'low';
};

export const PRIORITY_COLORS = {
	high: '#f44336', // Red
	medium: '#ff9800', // Orange
	low: '#4caf50' // Green
} as const;
