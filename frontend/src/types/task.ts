import z from 'zod';

export interface Task {
	id: string;
	name: string;
	priority: number; // 1-10, higher = more important
	progress: number; // 0-100 as percents
	createdAt: string; // ISO date string (Date serialized)
}

export interface CompletedTask extends Task {
	completedAt: string; // ISO date string
}

export interface QueueState {
	tasks: Task[];
	completedTasks: CompletedTask[];
	currentTaskId: string | null;
}

export const addTaskSchema = z.object({
	name: z.string().trim().min(1, 'Task name must be a non-empty string'),
	priority: z
		.number()
		.int('Priority must be an integer')
		.min(1, 'Priority must be at least 1')
		.max(10, 'Priority must be at most 10')
});

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
