# Production-Grade MERN Task Manager - Implementation Plan

This document serves as the source of truth for building, verifying, and reviewing the Task Manager assignment pack.

## Core Requirements & Stack
- Backend: Node.js, Express, TypeScript, Mongoose, Zod, bcrypt, JWT, Vitest, Supertest, mongodb-memory-server.
- Frontend: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, React Router, Vitest, React Testing Library.

## Strict Rules & Ownership Model
1. Every task query filters on `{ _id: taskId, owner: authenticatedUserId }`.
2. Task owner ID is NEVER accepted from client request body.
3. Accessing another user's task returns 404 Not Found.
4. Passwords and hashes are omitted from JSON outputs.
5. Standardized response envelope `{ success, data, message, error, pagination }`.
