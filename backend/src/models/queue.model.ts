import type { CompletedTask, Task } from './task.model';

export interface QueueState {
	tasks: Task[];
	completedTasks: CompletedTask[];
	currentTaskId: string | null;
}
