# Task Queue Frontend

React + MUI frontend for real-time priority queue visualization.

## Quick Start

```bash
yarn install
yarn dev
```

App runs at `http://localhost:5173`

## Tech Stack

- **React 19** with functional components and hooks
- **TypeScript** with strict mode
- **MUI 7** (Material-UI) for UI components
- **Redux Toolkit 2** for state management
- **Socket.IO Client** for real-time WebSocket updates
- **Vite 7** for bundling and dev server
- **Vitest** + **React Testing Library** for testing
- **Zod** for runtime validation

## Features

- Real-time queue updates via WebSocket
- Task creation with priority levels (1-10)
- Live progress tracking for processing tasks
- Completed tasks history
- Connection status indicator
- Automatic retry with exponential backoff
- Input validation with user-friendly errors

## Scripts

| Command          | Description                |
| ---------------- | -------------------------- |
| `yarn dev`       | Start dev server           |
| `yarn build`     | Build for production       |
| `yarn preview`   | Preview production build   |
| `yarn test:unit` | Run unit tests             |
| `yarn lint`      | Run ESLint                 |
| `yarn typecheck` | Run TypeScript type checks |

## Environment Variables

| Variable       | Default                 | Description     |
| -------------- | ----------------------- | --------------- |
| `VITE_API_URL` | `http://localhost:3000` | Backend API URL |
| `VITE_WS_URL`  | `http://localhost:3000` | WebSocket URL   |
| `VITE_PORT`    | `5173`                  | Dev server port |

## API Services

The frontend consumes the backend REST API:

| Method   | Endpoint               | Description           |
| -------- | ---------------------- | --------------------- |
| `GET`    | `/api/tasks`           | Get all pending tasks |
| `POST`   | `/api/tasks`           | Create a new task     |
| `GET`    | `/api/tasks/completed` | Get completed tasks   |
| `DELETE` | `/api/tasks/completed` | Clear completed tasks |

## WebSocket Events

### Client → Server

- `join_queue` - Subscribe to queue updates

### Server → Client

- `queue_update` - Full queue state sync (also sent when task is added)
- `task_progress` - Task progress update
- `task_completed` - Task finished
- `server_shutdown` - Server shutting down

## Project Structure

```
src/
├── components/     # React UI components
│   ├── Common/     # Shared components
│   ├── Layout/     # Layout components
│   ├── Queue/      # Queue display components
│   └── Task/       # Task-related components
├── features/       # Redux slices
├── hooks/          # Custom React hooks
├── services/       # API client
├── store/          # Redux store config
├── theme/          # MUI theme
├── types/          # TypeScript types
└── utils/          # Utilities
```
