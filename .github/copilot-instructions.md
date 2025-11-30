# Copilot Instructions

## Project Overview

Full-stack TypeScript priority queue simulation with real-time WebSocket communication.

## Structure

- **Monorepo** with yarn workspaces: `backend/` and `frontend/`
- Package manager: **yarn**

## Backend

- Use **Node.js** with **Express 4.x** for REST API
- Use **Socket.IO 4.x** for WebSocket real-time updates
- Use **TypeScript** with strict mode enabled
- Use **Zod** for input validation
- In-memory storage (no database)
- Follow controller → service → model architecture

## Frontend

- Use **React 19** with functional components and modern hooks patterns
- Use **TypeScript** with strict mode enabled
- Use **MUI (Material-UI) 7.x** as UI library
- Use **Redux Toolkit 2.x** for state management with `@reduxjs/toolkit`
- Use **Vite** for bundling and dev server
- Use **Socket.IO Client** for real-time updates

## Testing

- Use **Vitest** for unit testing (both backend and frontend)
- Use **@testing-library/react** for React component tests
- Use **supertest** for API endpoint tests

## Commands

```bash
yarn install          # Install all dependencies
yarn dev              # Run both backend and frontend
yarn dev:backend      # Run backend only
yarn dev:frontend     # Run frontend only
yarn test             # Run all tests
yarn lint             # Run linting
yarn typecheck        # Type check all packages
```
