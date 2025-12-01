import { describe, expect, it } from 'vitest';
import { addTaskSchema } from './task.model.js';

describe('Task Model Validation', () => {
	describe('name validation', () => {
		it('should accept valid name', () => {
			const result = addTaskSchema.safeParse({ name: 'Valid Task', priority: 5 });
			expect(result.success).toBe(true);
		});

		it('should reject empty name', () => {
			const result = addTaskSchema.safeParse({ name: '', priority: 5 });
			expect(result.success).toBe(false);
		});

		it('should reject whitespace-only name', () => {
			const result = addTaskSchema.safeParse({ name: '   ', priority: 5 });
			expect(result.success).toBe(false);
		});

		it('should trim whitespace from name', () => {
			const result = addTaskSchema.safeParse({ name: '  Trimmed  ', priority: 5 });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('Trimmed');
			}
		});
	});

	describe('priority validation', () => {
		it('should accept priority within range (1-10)', () => {
			expect(addTaskSchema.safeParse({ name: 'Task', priority: 1 }).success).toBe(true);
			expect(addTaskSchema.safeParse({ name: 'Task', priority: 10 }).success).toBe(true);
			expect(addTaskSchema.safeParse({ name: 'Task', priority: 5 }).success).toBe(true);
		});

		it('should reject priority below 1', () => {
			const result = addTaskSchema.safeParse({ name: 'Task', priority: 0 });
			expect(result.success).toBe(false);
		});

		it('should reject priority above 10', () => {
			const result = addTaskSchema.safeParse({ name: 'Task', priority: 11 });
			expect(result.success).toBe(false);
		});

		it('should reject non-integer priority', () => {
			const result = addTaskSchema.safeParse({ name: 'Task', priority: 5.5 });
			expect(result.success).toBe(false);
		});
	});
});
