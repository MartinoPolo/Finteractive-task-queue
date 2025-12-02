import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import type { CompletedTask, Task } from '../../types/task';
import tasksReducer, {
	addTask,
	completeTask,
	selectCurrentTask,
	selectPendingTasks,
	syncQueueState,
	type TasksState,
	updateTaskProgress
} from './tasksSlice';

const createTask = (overrides: Partial<Task> = {}): Task => ({
	id: 'task-1',
	name: 'Test Task',
	priority: 5,
	progress: 0,
	createdAt: '2024-01-01T12:00:00.000Z',
	...overrides
});

const createCompletedTask = (overrides: Partial<CompletedTask> = {}): CompletedTask => ({
	...createTask(overrides),
	progress: 100,
	completedAt: '2024-01-01T13:00:00.000Z',
	...overrides
});

const getInitialState = (): TasksState => ({
	queue: [],
	completed: [],
	currentTaskId: null,
	isCreatingTask: false,
	isClearingCompleted: false,
	error: null,
	isSocketConnectionError: false,
	connectionStatus: 'disconnected'
});

const createStore = (preloadedState?: Partial<TasksState>) => {
	return configureStore({
		reducer: { tasks: tasksReducer },
		preloadedState: preloadedState
			? { tasks: { ...getInitialState(), ...preloadedState } }
			: undefined
	});
};

describe('tasksSlice reducers', () => {
	describe('syncQueueState', () => {
		it('updates full queue state', () => {
			const store = createStore();
			const task = createTask();
			const completed = createCompletedTask({ id: 'completed-1' });

			store.dispatch(
				syncQueueState({
					tasks: [task],
					completedTasks: [completed],
					currentTaskId: task.id
				})
			);

			const state = store.getState().tasks;
			expect(state.queue).toHaveLength(1);
			expect(state.completed).toHaveLength(1);
			expect(state.currentTaskId).toBe(task.id);
		});
	});

	describe('addTask', () => {
		it('adds task to queue', () => {
			const store = createStore();
			const task = createTask();

			store.dispatch(addTask(task));

			expect(store.getState().tasks.queue).toContainEqual(task);
		});

		it('prevents duplicate tasks', () => {
			const task = createTask();
			const store = createStore({ queue: [task] });

			store.dispatch(addTask(task));

			expect(store.getState().tasks.queue).toHaveLength(1);
		});
	});

	describe('updateTaskProgress', () => {
		it('updates task progress', () => {
			const task = createTask({ progress: 0 });
			const store = createStore({ queue: [task] });

			store.dispatch(updateTaskProgress({ id: task.id, progress: 50 }));

			expect(store.getState().tasks.queue[0].progress).toBe(50);
		});

		it('does nothing if task not found', () => {
			const store = createStore({ queue: [] });

			store.dispatch(updateTaskProgress({ id: 'nonexistent', progress: 50 }));

			expect(store.getState().tasks.queue).toHaveLength(0);
		});
	});

	describe('completeTask', () => {
		it('moves task from queue to completed', () => {
			const task = createTask();
			const completedTask = createCompletedTask({ id: task.id });
			const store = createStore({ queue: [task], currentTaskId: task.id });

			store.dispatch(completeTask(completedTask));

			const state = store.getState().tasks;
			expect(state.queue).toHaveLength(0);
			expect(state.completed).toHaveLength(1);
			expect(state.completed[0].id).toBe(task.id);
		});

		it('updates currentTaskId to next task when current is completed', () => {
			const task1 = createTask({ id: 'task-1' });
			const task2 = createTask({ id: 'task-2' });
			const completedTask = createCompletedTask(task1);
			const store = createStore({ queue: [task1, task2], currentTaskId: 'task-1' });

			store.dispatch(completeTask(completedTask));

			expect(store.getState().tasks.currentTaskId).toBe('task-2');
		});
	});
});

describe('tasksSlice selectors', () => {
	describe('selectCurrentTask', () => {
		it('returns current task when exists', () => {
			const task = createTask();
			const store = createStore({ queue: [task], currentTaskId: task.id });

			const currentTask = selectCurrentTask(store.getState());

			expect(currentTask).toEqual(task);
		});

		it('returns null when no current task', () => {
			const store = createStore({ queue: [], currentTaskId: null });

			const currentTask = selectCurrentTask(store.getState());

			expect(currentTask).toBeNull();
		});

		it('returns null when currentTaskId does not match any task', () => {
			const task = createTask();
			const store = createStore({ queue: [task], currentTaskId: 'nonexistent' });

			const currentTask = selectCurrentTask(store.getState());

			expect(currentTask).toBeNull();
		});
	});

	describe('selectPendingTasks', () => {
		it('excludes current task from pending', () => {
			const task1 = createTask({ id: 'task-1' });
			const task2 = createTask({ id: 'task-2' });
			const store = createStore({ queue: [task1, task2], currentTaskId: 'task-1' });

			const pending = selectPendingTasks(store.getState());

			expect(pending).toHaveLength(1);
			expect(pending[0].id).toBe('task-2');
		});

		it('returns all tasks when no current task', () => {
			const task1 = createTask({ id: 'task-1' });
			const task2 = createTask({ id: 'task-2' });
			const store = createStore({ queue: [task1, task2], currentTaskId: null });

			const pending = selectPendingTasks(store.getState());

			expect(pending).toHaveLength(2);
		});
	});
});
