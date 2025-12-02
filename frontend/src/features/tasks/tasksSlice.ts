import {
	createAsyncThunk,
	createSelector,
	createSlice,
	type PayloadAction
} from '@reduxjs/toolkit';
import type { ZodSchema } from 'zod';
import taskApi from '../../services/taskApi';
import type { ConnectionStatus } from '../../types/socket';
import {
	completedTaskSchema,
	queueStateSchema,
	taskProgressUpdateSchema,
	taskSchema,
	type AddTaskInput,
	type CompletedTask,
	type QueueState,
	type Task,
	type TaskProgressUpdate
} from '../../types/task';
import { getUserFriendlyErrorMessage } from '../../utils/errorMessages';

export interface TasksState {
	queue: Task[];
	completed: CompletedTask[];
	currentTaskId: string | null;
	isCreatingTask: boolean;
	isClearingCompleted: boolean;
	error: string | null;
	isSocketConnectionError: boolean;
	connectionStatus: ConnectionStatus;
}

const initialState: TasksState = {
	queue: [],
	completed: [],
	currentTaskId: null,
	isCreatingTask: false,
	isClearingCompleted: false,
	error: null,
	isSocketConnectionError: false,
	connectionStatus: 'disconnected'
};

/**
 * Validates reducer payload and logs errors if validation fails.
 * This is a defense-in-depth measure - primary validation happens at API/socket layer.
 */
const validatePayload = <T>(schema: ZodSchema<T>, data: unknown, context: string): T | null => {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error(`Reducer payload validation failed [${context}]:`, result.error.issues);
		return null;
	}
	return result.data;
};

const resolveCurrentTaskId = (tasks: Task[], currentTaskId: string | null): string | null => {
	if (currentTaskId && tasks.some((t) => t.id === currentTaskId)) {
		return currentTaskId;
	}
	return tasks[0]?.id ?? null;
};

// Async Thunks

/**
 * Create a new task
 */
export const createTask = createAsyncThunk(
	'tasks/createTask',
	async (input: AddTaskInput, { rejectWithValue }) => {
		try {
			const task = await taskApi.addTask(input);
			return task;
		} catch (error) {
			const message = getUserFriendlyErrorMessage(error, 'createTask');
			return rejectWithValue(message);
		}
	}
);

/**
 * Clear all completed tasks
 */
export const clearCompletedTasks = createAsyncThunk(
	'tasks/clearCompletedTasks',
	async (_, { rejectWithValue }) => {
		try {
			await taskApi.clearCompletedTasks();
		} catch (error) {
			const message = getUserFriendlyErrorMessage(error, 'clearCompleted');
			return rejectWithValue(message);
		}
	}
);

const tasksSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		// Sync full queue state from socket
		syncQueueState: (state, action: PayloadAction<QueueState>) => {
			const validated = validatePayload(queueStateSchema, action.payload, 'syncQueueState');
			if (!validated) {
				return;
			}
			const { tasks, completedTasks, currentTaskId } = validated;
			state.queue = tasks;
			state.completed = completedTasks;
			state.currentTaskId = resolveCurrentTaskId(tasks, currentTaskId);
		},
		addTask: (state, action: PayloadAction<Task>) => {
			const validated = validatePayload(taskSchema, action.payload, 'addTask');
			if (!validated) {
				return;
			}
			// Only add if not already in queue (prevent duplicates from socket)
			if (!state.queue.some((t) => t.id === validated.id)) {
				state.queue.push(validated);
			}
		},
		updateTaskProgress: (state, action: PayloadAction<TaskProgressUpdate>) => {
			const validated = validatePayload(
				taskProgressUpdateSchema,
				action.payload,
				'updateTaskProgress'
			);
			if (!validated) {
				return;
			}
			const { id, progress } = validated;
			const task = state.queue.find((t) => t.id === id);
			if (task) {
				task.progress = progress;
			}
		},
		completeTask: (state, action: PayloadAction<CompletedTask>) => {
			const validated = validatePayload(completedTaskSchema, action.payload, 'completeTask');
			if (!validated) {
				return;
			}
			const completedId = validated.id;
			state.queue = state.queue.filter((t) => t.id !== completedId);
			if (state.currentTaskId === completedId) {
				state.currentTaskId = state.queue[0]?.id ?? null;
			}
			// Only add if not already completed (prevent duplicates from socket)
			if (!state.completed.some((t) => t.id === completedId)) {
				state.completed.unshift(validated);
			}
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isSocketConnectionError = false;
		},
		setSocketConnectionError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
			state.isSocketConnectionError = action.payload !== null;
		},
		clearSocketConnectionError: (state) => {
			if (state.isSocketConnectionError) {
				state.error = null;
				state.isSocketConnectionError = false;
			}
		},
		setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
			state.connectionStatus = action.payload;
		}
	},
	extraReducers: (builder) => {
		// createTask
		builder
			.addCase(createTask.pending, (state) => {
				state.isCreatingTask = true;
				state.error = null;
			})
			.addCase(createTask.fulfilled, (state) => {
				state.isCreatingTask = false;
				// Task will be added via socket event
			})
			.addCase(createTask.rejected, (state, action) => {
				state.isCreatingTask = false;
				state.error = action.payload as string;
			});

		// clearCompletedTasks
		builder
			.addCase(clearCompletedTasks.pending, (state) => {
				state.isClearingCompleted = true;
				state.error = null;
			})
			.addCase(clearCompletedTasks.fulfilled, (state) => {
				state.isClearingCompleted = false;
				state.completed = [];
			})
			.addCase(clearCompletedTasks.rejected, (state, action) => {
				state.isClearingCompleted = false;
				state.error = action.payload as string;
			});
	}
});

export const {
	syncQueueState,
	addTask,
	updateTaskProgress,
	completeTask,
	setError,
	setSocketConnectionError,
	clearSocketConnectionError,
	setConnectionStatus
} = tasksSlice.actions;

export default tasksSlice.reducer;

import type { RootState } from '../../store/store';

export const selectQueue = (state: RootState) => state.tasks.queue;
export const selectCompleted = (state: RootState) => state.tasks.completed;
export const selectCurrentTaskId = (state: RootState) => state.tasks.currentTaskId;
export const selectIsCreatingTask = (state: RootState) => state.tasks.isCreatingTask;
export const selectIsClearingCompleted = (state: RootState) => state.tasks.isClearingCompleted;
export const selectError = (state: RootState) => state.tasks.error;

export const selectCurrentTask = createSelector(
	[selectQueue, selectCurrentTaskId],
	(queue, currentTaskId) =>
		currentTaskId ? queue.find((task) => task.id === currentTaskId) ?? null : null
);

export const selectPendingTasks = createSelector(
	[selectQueue, selectCurrentTaskId],
	(queue, currentTaskId) =>
		currentTaskId ? queue.filter((task) => task.id !== currentTaskId) : queue
);
