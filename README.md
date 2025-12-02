# Task Queue Simulation

Full-stack TypeScript priority queue simulation with real-time WebSocket communication.

## Quick Start

```bash
# Install all dependencies
yarn install

# Run both backend and frontend
yarn dev
```

- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

## Tech Stack

### Backend

- Node.js + Express 4 (REST API)
- Socket.IO 4 (WebSocket)
- TypeScript, Zod validation
- In-memory storage (no database)

### Frontend

- React 19 + MUI 7
- Redux Toolkit 2
- Socket.IO Client
- Vite 7, TypeScript

## Features

- **Priority Queue**: Tasks processed by priority (1-10, higher = more urgent)
- **Aging Prevention**: Lower priority tasks gain priority over time
- **Real-time Updates**: Live progress tracking via WebSocket
- **Task Management**: Create tasks, view queue, track completed tasks
- **Connection Status**: Visual indicator with auto-reconnect

## Scripts

| Command             | Description               |
| ------------------- | ------------------------- |
| `yarn dev`          | Run backend + frontend    |
| `yarn dev:backend`  | Run backend only          |
| `yarn dev:frontend` | Run frontend only         |
| `yarn build`        | Build all packages        |
| `yarn test`         | Run all tests             |
| `yarn lint`         | Lint all packages         |
| `yarn typecheck`    | Type check all packages   |
| `yarn docker:build` | Build and run with Docker |
| `yarn docker:down`  | Stop Docker containers    |

## API Overview

| Method   | Endpoint               | Description           |
| -------- | ---------------------- | --------------------- |
| `GET`    | `/api/tasks`           | Get pending tasks     |
| `POST`   | `/api/tasks`           | Create task           |
| `GET`    | `/api/tasks/completed` | Get completed tasks   |
| `DELETE` | `/api/tasks/completed` | Clear completed tasks |
| `GET`    | `/api/queue/state`     | Get full queue state  |

## WebSocket Events

| Event            | Direction | Description          |
| ---------------- | --------- | -------------------- |
| `join_queue`     | → Server  | Subscribe to updates |
| `queue_update`   | ← Server  | Full queue state     |
| `task_progress`  | ← Server  | Task progress update |
| `task_completed` | ← Server  | Task finished        |

## Project Structure

```
├── backend/         # Express + Socket.IO server
├── frontend/        # React + MUI client
├── docker-compose.yml
└── package.json     # Workspace root
```

See individual package READMEs for detailed documentation:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## License

MIT
