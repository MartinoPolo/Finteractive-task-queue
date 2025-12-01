import z from 'zod';

export interface Task {
	id: string;
	name: string;
	priority: number; // higher = more important
	progress: number; // 0-100 as percents
	createdAt: Date;
}

export interface CompletedTask extends Task {
	completedAt: Date;
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
