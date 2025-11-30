# Frontend Implementation Checklist

## Setup (Completed ✅)

- [x] Initialize React TypeScript project with Vite
- [x] Configure TypeScript strict mode (extends shared base config)
- [x] Set up MUI (Material UI) library
- [x] Set up Redux Toolkit with initial store structure
- [x] Configure Vitest for testing (extends shared base config)
- [x] Configure ESLint (shared config with React-specific rules)
- [x] Set up path aliases (@/)
- [x] Add root scripts for running both projects

## Shared Configuration

The following configurations are shared between backend and frontend:

- **tsconfig.json** - Base TypeScript config at root, extended by both projects
- **eslint.config.js** - Single ESLint config at root with React rules for frontend files

Note: Vitest configs are separate due to vite/vitest plugin type incompatibilities between environments (node vs jsdom). The base config exists at root but frontend uses its own standalone config.

## Next Steps

### 1. Services Layer

- [ ] Create `src/services/api.ts` - REST API client for task operations
- [ ] Create `src/services/socket.ts` - Socket.IO client for real-time updates
- [ ] Add error handling and retry logic
- [ ] Add connection status management

### 2. Type Definitions

- [ ] Create `src/types/task.ts` - Shared task types (sync with backend)
- [ ] Create `src/types/api.ts` - API response types
- [ ] Create `src/types/socket.ts` - WebSocket event types

### 3. Redux Store Enhancement

- [ ] Add async thunks for API calls (fetchTasks, createTask, etc.)
- [ ] Add socket event handlers that dispatch actions
- [ ] Add selectors for computed state (currentTask, sortedQueue, etc.)

### 4. Components

#### Layout Components

- [ ] `src/components/Layout/Header.tsx` - App header with title
- [ ] `src/components/Layout/MainLayout.tsx` - Main layout wrapper

#### Task Components

- [ ] `src/components/Task/TaskCard.tsx` - Individual task display with progress bar
- [ ] `src/components/Task/TaskForm.tsx` - Form to add new tasks (name, priority)
- [ ] `src/components/Task/TaskProgress.tsx` - Animated progress bar component
- [ ] `src/components/Task/PriorityBadge.tsx` - Color-coded priority indicator

#### Queue Components

- [ ] `src/components/Queue/CurrentTask.tsx` - Highlighted currently processing task
- [ ] `src/components/Queue/QueueList.tsx` - List of pending tasks sorted by priority
- [ ] `src/components/Queue/CompletedList.tsx` - List of completed tasks

#### Common Components

- [ ] `src/components/Common/LoadingSpinner.tsx`
- [ ] `src/components/Common/ErrorAlert.tsx`
- [ ] `src/components/Common/ConnectionStatus.tsx` - WebSocket connection indicator

### 5. Custom Hooks

- [ ] `src/hooks/useSocket.ts` - Socket.IO connection management
- [ ] `src/hooks/useTasks.ts` - Task operations wrapper
- [ ] `src/hooks/useConnectionStatus.ts` - Network status monitoring

### 6. Main App Integration

- [ ] Update `App.tsx` to compose all components
- [ ] Add socket connection initialization on mount
- [ ] Add initial data fetch on mount
- [ ] Add responsive layout (mobile/desktop)

### 7. Styling & UX

- [ ] Define MUI theme (colors for priority levels)
- [ ] Add CSS animations for progress updates
- [ ] Add pulsing animation for currently processing task
- [ ] Implement responsive breakpoints
- [ ] Add loading states for all async operations
- [ ] Add toast notifications for errors/success

### 8. Testing

- [ ] Unit tests for Redux reducers and selectors
- [ ] Unit tests for utility functions
- [ ] Component tests for TaskCard, TaskForm
- [ ] Integration tests for socket events
- [ ] Test error handling scenarios

### 9. Error Handling

- [ ] Network error recovery
- [ ] WebSocket reconnection logic
- [ ] Form validation errors
- [ ] API error display

### 10. Performance Optimization

- [ ] Memoize expensive computations (useMemo)
- [ ] Optimize re-renders (React.memo, useCallback)
- [ ] Consider virtualization for large task lists

## Running the Project

```bash
# Install dependencies (from root)
yarn install

# Run both backend and frontend
yarn dev

# Run only backend
yarn dev:backend

# Run only frontend
yarn dev:frontend

# Run tests
yarn test

# Run linting
yarn lint
```

## Environment Variables

Copy `.env.example` to `.env` in the frontend folder:

```
VITE_API_URL=http://localhost:4000
VITE_WS_URL=http://localhost:4000
```

## Priority Level Colors (Suggestion)

| Priority     | Color            | Badge |
| ------------ | ---------------- | ----- |
| High (7-10)  | Red (#f44336)    | 🔴    |
| Medium (4-6) | Orange (#ff9800) | 🟠    |
| Low (1-3)    | Green (#4caf50)  | 🟢    |
