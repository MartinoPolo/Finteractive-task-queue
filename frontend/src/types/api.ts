import z from 'zod';
import { completedTaskSchema, taskSchema } from './task';

const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema.optional(),
		error: z.string().optional(),
		message: z.string().optional()
	});

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export const getTasksResponseSchema = createApiResponseSchema(z.array(taskSchema)).extend({
	currentTaskId: z.string().nullable().optional()
});

export const addTaskResponseSchema = createApiResponseSchema(taskSchema);

export const getCompletedTasksResponseSchema = createApiResponseSchema(
	z.array(completedTaskSchema)
);

export const clearCompletedResponseSchema = createApiResponseSchema(z.undefined()).extend({
	message: z.string().optional()
});

export class ApiError extends Error {
	constructor(message: string, public statusCode: number, public retryAfter?: number) {
		super(message);
		this.name = 'ApiError';
	}
}
