import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { ConnectionStatus } from '../../types/socket';
import type { AddTaskInput, CompletedTask, QueueState, Task } from '../../types/task';
import { getUserFriendlyErrorMessage } from '../../utils/errorMessages';

export interface TasksState {
	queue: Task[];
	completed: CompletedTask[];
	currentTaskId: string | null;
	isCreatingTask: boolean;
	isClearingCompleted: boolean;
	error: string | null;
	connectionStatus: ConnectionStatus;
}

const initialState: TasksState = {
	queue: [],
	completed: [],
	currentTaskId: null,
	isCreatingTask: false,
	isClearingCompleted: false,
	error: null,
	connectionStatus: 'disconnected'
};

// Helper to determine current task ID from queue state
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
			const task = await api.addTask(input);
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
			await api.clearCompletedTasks();
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
			const { tasks, completedTasks, currentTaskId } = action.payload;
			state.queue = tasks;
			state.completed = completedTasks;
			state.currentTaskId = resolveCurrentTaskId(tasks, currentTaskId);
		},
		addTask: (state, action: PayloadAction<Task>) => {
			// Only add if not already in queue (prevent duplicates from socket)
			if (!state.queue.some((t) => t.id === action.payload.id)) {
				state.queue.push(action.payload);
			}
		},
		updateTaskProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
			const { id, progress } = action.payload;
			const task = state.queue.find((t) => t.id === id);
			if (task) {
				task.progress = progress;
			}
		},
		completeTask: (state, action: PayloadAction<CompletedTask>) => {
			const completedId = action.payload.id;
			state.queue = state.queue.filter((t) => t.id !== completedId);
			if (state.currentTaskId === completedId) {
				state.currentTaskId = state.queue[0]?.id ?? null;
			}
			// Only add if not already completed (prevent duplicates from socket)
			if (!state.completed.some((t) => t.id === completedId)) {
				state.completed.unshift(action.payload);
			}
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
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
	setConnectionStatus
} = tasksSlice.actions;

export default tasksSlice.reducer;

// ============================================================================
// Selectors
// ============================================================================
import type { RootState } from '../../store/store';

// Base selectors
export const selectQueue = (state: RootState) => state.tasks.queue;
export const selectCompleted = (state: RootState) => state.tasks.completed;
export const selectCurrentTaskId = (state: RootState) => state.tasks.currentTaskId;
export const selectIsCreatingTask = (state: RootState) => state.tasks.isCreatingTask;
export const selectIsClearingCompleted = (state: RootState) => state.tasks.isClearingCompleted;
export const selectError = (state: RootState) => state.tasks.error;
export const selectConnectionStatus = (state: RootState) => state.tasks.connectionStatus;

export const selectCurrentTask = (state: RootState) => {
	const { queue, currentTaskId } = state.tasks;
	return currentTaskId ? queue.find((task) => task.id === currentTaskId) ?? null : null;
};

export const selectPendingTasks = (state: RootState) => {
	const { queue, currentTaskId } = state.tasks;
	return currentTaskId ? queue.filter((task) => task.id !== currentTaskId) : queue;
};
