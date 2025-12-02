# Task Queue Backend

Express + Socket.IO backend for priority queue simulation with real-time updates.

## Quick Start

```bash
yarn install
yarn dev
```

Server runs at `http://localhost:3000`

## Tech Stack

- **Node.js** with **Express 4** for REST API
- **Socket.IO 4** for WebSocket real-time updates
- **TypeScript** with strict mode
- **Zod** for input validation
- **Vitest** + **Supertest** for testing
- **In-memory storage** (no database required)

## Scripts

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `yarn dev`       | Start dev server with hot reload |
| `yarn build`     | Compile TypeScript               |
| `yarn start`     | Run production build             |
| `yarn test:unit` | Run unit tests once              |

## Environment Variables

| Variable                  | Default | Description                                                 |
| ------------------------- | ------- | ----------------------------------------------------------- |
| `PORT`                    | `3000`  | Server port                                                 |
| `AGING_FACTOR`            | `60`    | Seconds before task gains +1 priority (prevents starvation) |
| `PROGRESS_INCREMENT_MIN`  | `10`    | Min progress increment per tick                             |
| `PROGRESS_INCREMENT_MAX`  | `20`    | Max progress increment per tick                             |
| `PROCESSING_INTERVAL`     | `5000`  | Task processing interval (ms)                               |
| `RATE_LIMIT_WINDOW_MS`    | `60000` | Rate limit window (ms)                                      |
| `RATE_LIMIT_MAX_REQUESTS` | `100`   | Max requests per window                                     |

## API Endpoints

Base URL: `/api`

### GET `/tasks`

Get all tasks in the queue, sorted by effective priority (base priority + aging bonus).

**Example Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"name": "Process payment",
			"priority": 8,
			"progress": 45,
			"createdAt": "2025-01-15T10:30:00.000Z"
		}
	],
	"currentTaskId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### POST `/tasks`

Add a new task to the queue.

**Example Request Body:**

```json
{
	"name": "Task name",
	"priority": 5
}
```

| Field      | Type     | Required | Description                         |
| ---------- | -------- | -------- | ----------------------------------- |
| `name`     | `string` | Yes      | Non-empty task name                 |
| `priority` | `number` | Yes      | Integer 1-10 (higher = more urgent) |

**Example Response (201):**

```json
{
	"success": true,
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440000",
		"name": "Task name",
		"priority": 5,
		"progress": 0,
		"createdAt": "2025-01-15T10:30:00.000Z"
	}
}
```

**Example Error Response (400):**

```json
{
	"success": false,
	"error": "Priority must be at least 1"
}
```

### GET `/tasks/completed`

Get all completed tasks.

**Example Response:**

```json
{
	"success": true,
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440000",
			"name": "Process payment",
			"priority": 8,
			"progress": 100,
			"createdAt": "2025-01-15T10:30:00.000Z",
			"completedAt": "2025-01-15T10:35:00.000Z"
		}
	]
}
```

### DELETE `/tasks/completed`

Clear all completed tasks from history.

**Example Response:**

```json
{
	"success": true,
	"message": "Completed tasks cleared"
}
```

## WebSocket Events

Connect to `ws://localhost:3000`

### Client → Server

#### `join_queue`

Subscribe to real-time queue updates. Call this after connecting to receive the current queue state and all subsequent updates.

```javascript
socket.emit('join_queue');
```

### Server → Client

#### `queue_update`

Emitted when client joins or when major queue changes occur. Contains the full queue state.

```typescript
{
  tasks: Task[];           // All pending tasks sorted by priority
  completedTasks: Task[];  // Completed tasks history
  currentTaskId: string | null;  // ID of task being processed
}
```

#### `task_progress`

Emitted periodically while a task is being processed.

```typescript
{
	id: string;
	name: string;
	priority: number;
	progress: number; // 0-100 percentage
	createdAt: string;
}
```

#### `task_completed`

Emitted when a task finishes processing (progress reaches 100).

```typescript
{
	id: string;
	name: string;
	priority: number;
	progress: 100;
	createdAt: string;
	completedAt: string; // ISO timestamp
}
```

#### `server_shutdown`

Emitted when the server is gracefully shutting down.

```typescript
{
	message: 'Server is shutting down';
}
```

## Docker

```bash
# Build and run with docker-compose
yarn docker:up

# Stop
yarn docker:down
```
