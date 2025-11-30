import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Task {
	id: string;
	name: string;
	priority: number;
	progress: number;
	createdAt: string;
	completedAt?: string;
}

export interface TasksState {
	queue: Task[];
	completed: Task[];
	currentTask: Task | null;
	isLoading: boolean;
	error: string | null;
}

const initialState: TasksState = {
	queue: [],
	completed: [],
	currentTask: null,
	isLoading: false,
	error: null
};

const tasksSlice = createSlice({
	name: 'tasks',
	initialState,
	reducers: {
		setQueue: (state, action: PayloadAction<Task[]>) => {
			state.queue = action.payload;
		},
		setCompleted: (state, action: PayloadAction<Task[]>) => {
			state.completed = action.payload;
		},
		setCurrentTask: (state, action: PayloadAction<Task | null>) => {
			state.currentTask = action.payload;
		},
		addTask: (state, action: PayloadAction<Task>) => {
			state.queue.push(action.payload);
		},
		updateTaskProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
			const { id, progress } = action.payload;
			if (state.currentTask?.id === id) {
				state.currentTask.progress = progress;
			}
			const queueTask = state.queue.find((t) => t.id === id);
			if (queueTask) {
				queueTask.progress = progress;
			}
		},
		completeTask: (state, action: PayloadAction<Task>) => {
			state.queue = state.queue.filter((t) => t.id !== action.payload.id);
			if (state.currentTask?.id === action.payload.id) {
				state.currentTask = null;
			}
			state.completed.unshift(action.payload);
		},
		clearCompleted: (state) => {
			state.completed = [];
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		}
	}
});

export const {
	setQueue,
	setCompleted,
	setCurrentTask,
	addTask,
	updateTaskProgress,
	completeTask,
	clearCompleted,
	setLoading,
	setError
} = tasksSlice.actions;

export default tasksSlice.reducer;
