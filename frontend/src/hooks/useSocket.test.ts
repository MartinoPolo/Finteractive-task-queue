import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import tasksReducer from '../features/tasks/tasksSlice';

// Mock socket.io-client
const mockSocket = {
	on: vi.fn(),
	emit: vi.fn(),
	connect: vi.fn(),
	disconnect: vi.fn(),
	removeAllListeners: vi.fn(),
	id: 'test-socket-id'
};

vi.mock('socket.io-client', () => ({
	io: vi.fn(() => mockSocket)
}));

// Import after mocking
import { useSocket } from './useSocket';

const createTestStore = () =>
	configureStore({
		reducer: { tasks: tasksReducer }
	});

type TestStore = ReturnType<typeof createTestStore>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findMockHandler = (eventName: string): ((...args: any[]) => void) | undefined => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const call = (mockSocket.on.mock.calls as any[]).find((c) => c[0] === eventName);
	return call?.[1];
};

describe('useSocket', () => {
	let store: TestStore;

	beforeEach(() => {
		vi.clearAllMocks();
		store = createTestStore();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	const createWrapper = (testStore: TestStore) => {
		return function Wrapper({ children }: { children: ReactNode }) {
			return React.createElement(Provider, { store: testStore, children });
		};
	};

	it('connects to socket on mount', () => {
		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		expect(mockSocket.connect).toHaveBeenCalled();
	});

	it('registers event listeners on mount', () => {
		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith('queue_update', expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith('task_progress', expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith('task_completed', expect.any(Function));
		expect(mockSocket.on).toHaveBeenCalledWith('task_added', expect.any(Function));
	});

	it('sets connection status to connecting on mount', () => {
		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		expect(store.getState().tasks.connectionStatus).toBe('connecting');
	});

	it('dispatches syncQueueState on queue_update event', () => {
		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		const handler = findMockHandler('queue_update');

		// Simulate queue_update event with valid data
		const queueState = {
			tasks: [
				{
					id: 'task-1',
					name: 'Test',
					priority: 5,
					progress: 50,
					createdAt: '2024-01-01T12:00:00.000Z'
				}
			],
			completedTasks: [],
			currentTaskId: 'task-1'
		};
		handler?.(queueState);

		expect(store.getState().tasks.queue).toHaveLength(1);
		expect(store.getState().tasks.queue[0].id).toBe('task-1');
	});

	it('dispatches updateTaskProgress on task_progress event', () => {
		// Pre-populate store with a task
		store.dispatch({
			type: 'tasks/syncQueueState',
			payload: {
				tasks: [
					{
						id: 'task-1',
						name: 'Test',
						priority: 5,
						progress: 0,
						createdAt: '2024-01-01T12:00:00.000Z'
					}
				],
				completedTasks: [],
				currentTaskId: 'task-1'
			}
		});

		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		const handler = findMockHandler('task_progress');
		handler?.({ id: 'task-1', progress: 75 });

		expect(store.getState().tasks.queue[0].progress).toBe(75);
	});

	it('disconnects and cleans up on unmount', () => {
		const { unmount } = renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		unmount();

		expect(mockSocket.removeAllListeners).toHaveBeenCalled();
		expect(mockSocket.disconnect).toHaveBeenCalled();
	});

	it('dispatches setConnectionStatus on connect event', () => {
		renderHook(() => useSocket(), { wrapper: createWrapper(store) });

		const handler = findMockHandler('connect');
		handler?.();

		expect(store.getState().tasks.connectionStatus).toBe('connected');
		expect(mockSocket.emit).toHaveBeenCalledWith('join_queue');
	});
});
