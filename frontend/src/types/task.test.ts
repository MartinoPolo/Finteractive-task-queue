import { describe, expect, it } from 'vitest';
import {
	addTaskSchema,
	completedTaskSchema,
	getPriorityLevel,
	queueStateSchema,
	taskProgressUpdateSchema,
	taskSchema
} from './task';

describe('taskSchema', () => {
	const validTask = {
		id: 'task-1',
		name: 'Test Task',
		priority: 5,
		progress: 50,
		createdAt: '2024-01-01T12:00:00.000Z'
	};

	it('validates a valid task object', () => {
		const result = taskSchema.safeParse(validTask);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(validTask);
		}
	});

	it('rejects task with priority out of range (< 1)', () => {
		const result = taskSchema.safeParse({ ...validTask, priority: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects task with priority out of range (> 10)', () => {
		const result = taskSchema.safeParse({ ...validTask, priority: 11 });
		expect(result.success).toBe(false);
	});

	it('rejects task with invalid createdAt date format', () => {
		const result = taskSchema.safeParse({ ...validTask, createdAt: 'not-a-date' });
		expect(result.success).toBe(false);
	});

	it('rejects task with empty name', () => {
		const result = taskSchema.safeParse({ ...validTask, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects task with progress > 100', () => {
		const result = taskSchema.safeParse({ ...validTask, progress: 150 });
		expect(result.success).toBe(false);
	});
});

describe('completedTaskSchema', () => {
	it('validates completed task with completedAt', () => {
		const completedTask = {
			id: 'task-1',
			name: 'Test Task',
			priority: 5,
			progress: 100,
			createdAt: '2024-01-01T12:00:00.000Z',
			completedAt: '2024-01-01T13:00:00.000Z'
		};
		const result = completedTaskSchema.safeParse(completedTask);
		expect(result.success).toBe(true);
	});

	it('rejects completed task without completedAt', () => {
		const task = {
			id: 'task-1',
			name: 'Test Task',
			priority: 5,
			progress: 100,
			createdAt: '2024-01-01T12:00:00.000Z'
		};
		const result = completedTaskSchema.safeParse(task);
		expect(result.success).toBe(false);
	});
});

describe('addTaskSchema', () => {
	it('validates valid input', () => {
		const result = addTaskSchema.safeParse({ name: 'New Task', priority: 5 });
		expect(result.success).toBe(true);
	});

	it('trims whitespace from name', () => {
		const result = addTaskSchema.safeParse({ name: '  Trimmed Task  ', priority: 5 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Trimmed Task');
		}
	});

	it('rejects non-integer priority', () => {
		const result = addTaskSchema.safeParse({ name: 'Task', priority: 5.5 });
		expect(result.success).toBe(false);
	});
});

describe('taskProgressUpdateSchema', () => {
	it('validates valid progress update', () => {
		const result = taskProgressUpdateSchema.safeParse({ id: 'task-1', progress: 75 });
		expect(result.success).toBe(true);
	});

	it('rejects negative progress', () => {
		const result = taskProgressUpdateSchema.safeParse({ id: 'task-1', progress: -10 });
		expect(result.success).toBe(false);
	});
});

describe('queueStateSchema', () => {
	it('validates full queue state', () => {
		const state = {
			tasks: [
				{
					id: 'task-1',
					name: 'Task 1',
					priority: 5,
					progress: 50,
					createdAt: '2024-01-01T12:00:00.000Z'
				}
			],
			completedTasks: [
				{
					id: 'task-2',
					name: 'Task 2',
					priority: 3,
					progress: 100,
					createdAt: '2024-01-01T10:00:00.000Z',
					completedAt: '2024-01-01T11:00:00.000Z'
				}
			],
			currentTaskId: 'task-1'
		};
		const result = queueStateSchema.safeParse(state);
		expect(result.success).toBe(true);
	});
});

describe('getPriorityLevel', () => {
	it('returns "high" for priority >= 7', () => {
		expect(getPriorityLevel(7)).toBe('high');
		expect(getPriorityLevel(10)).toBe('high');
	});

	it('returns "medium" for priority 4-6', () => {
		expect(getPriorityLevel(4)).toBe('medium');
		expect(getPriorityLevel(6)).toBe('medium');
	});

	it('returns "low" for priority < 4', () => {
		expect(getPriorityLevel(1)).toBe('low');
		expect(getPriorityLevel(3)).toBe('low');
	});
});
