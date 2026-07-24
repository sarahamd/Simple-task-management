# Task Flow - Production-Grade MERN Task Manager with TypeScript

Task Flow is a full-stack Task Management application engineered with Node.js, Express, MongoDB, React 19, TypeScript, Zod validation, JWT authentication, and Tailwind CSS.

---

## Technical Stack & Architecture

### Backend
- **Node.js & Express**: Modular routing with thin controllers.
- **TypeScript**: Strict type safety across models, schemas, and controllers.
- **Mongoose & MongoDB**: Schema indexing on `owner`, `status`, `priority`, and `createdAt`.
- **Security**: JWT Bearer token authentication, password hashing with `bcrypt`, security headers with `helmet`, CORS configuration.
- **Input Validation**: Zod validation schemas for registration, login, task creation, updates, and paginated query params.
- **Error Handling**: Custom `AppError` class and global error middleware handling Zod errors, CastErrors, Duplicate key errors (409), and JWT errors.
- **Cross-User Ownership Isolation**: All task reads, updates, and deletes strictly execute queries of form `{ _id: taskId, owner: userId }`, guaranteeing `404 Not Found` for unauthorized access attempt.

### Frontend
- **React 19 & Vite**: Ultra-fast build toolchain.
- **TypeScript**: End-to-end type safety with shared interfaces.
- **TanStack Query (React Query)**: Declarative state management, caching, and mutation invalidations.
- **React Hook Form & Zod**: Form handling with client-side validation.
- **Tailwind CSS**: Glassmorphism UI, custom dark theme, and mobile responsiveness down to 320px viewport.
- **Lucide Icons**: Clean UI iconography.

---

## Project Structure

```text
task-manager/
├── client/
│   ├── src/
│   │   ├── api/            # Axios client with JWT interceptor & 401 handler
│   │   ├── components/     # Navbar, TaskCard, TaskModal, Filters, Skeleton, EmptyState
│   │   ├── context/        # AuthContext & useAuth hook
│   │   ├── pages/          # LoginPage, RegisterPage, DashboardPage
│   │   ├── tests/          # Vitest & React Testing Library unit tests
│   │   └── types/          # Shared TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/         # Mongoose DB connection module
│   │   ├── controllers/    # Auth and Task thin controllers
│   │   ├── middleware/     # Auth JWT & Global Error Handler
│   │   ├── models/         # User & Task Mongoose schemas
│   │   ├── routes/         # Health, Auth, and Task routes
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # Auth & Task business logic layer
│   │   ├── tests/          # Supertest & mongodb-memory-server integration tests
│   │   └── utils/          # AppError & ApiResponse standardized envelope
│   ├── package.json
│   └── tsconfig.json
├── .github/workflows/ci.yml
├── Task-Manager.postman_collection.json
├── Local.postman_environment.json
├── QA_TESTING_GUIDE.md
├── ANTIGRAVITY_IMPLEMENTATION_PLAN.md
├── ANTIGRAVITY_MASTER_PROMPT.txt
└── package.json
```

---

## Quick Start & Fresh Clone Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance (local or MongoDB Atlas URI)

### 2. Setup Project
```bash
git clone <repository-url>
cd task-manager

# Install all workspace dependencies
npm run install:all

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run Quality Verification Suite
```bash
# Run ESLint across workspace
npm run lint

# Check TypeScript type safety
npm run typecheck

# Execute server and client unit/integration tests
npm run test

# Production build
npm run build
```

### 4. Development Server
```bash
# Starts both server (port 5000) and client (port 3000) concurrently
npm run dev
```

---

## Core Requirements Checklist

- [x] **TypeScript**: Server & Client built with strict TypeScript mode.
- [x] **Zod Validation**: Validates auth input, task input, and query parameters.
- [x] **Thin Controllers**: Business logic isolated in `AuthService` and `TaskService`.
- [x] **Password Hashing**: `bcrypt` with 10 salt rounds and pre-save hooks.
- [x] **JWT Bearer Auth**: Token-based authentication with protected route guards.
- [x] **Strict Ownership Isolation**: `{ _id: taskId, owner: userId }` query filter returning 404 for unauthorized access.
- [x] **Search & Filters**: Case-insensitive title regex search, status filter, priority filter, sort order, and pagination.
- [x] **Standardized API Envelope**: `{ success, data, message, error, pagination }`.
- [x] **Integration & Unit Tests**: Supertest + mongodb-memory-server for server; Vitest + RTL for client.
- [x] **Postman & QA Documentation**: Collection, environment, and manual QA guide included.
- [x] **CI Pipeline**: GitHub Actions workflow.

---

## Security Audit & Known Decisions

1. **Query-Level Security**: Ownership checks occur at the database query level (`Task.findOne({ _id, owner })`) rather than in memory. This eliminates TOCTOU (Time-of-check to time-of-use) vulnerabilities and prevents exposing task existence to unauthorized users.
2. **Password Sanitization**: Mongoose `toJSON` transforms automatically strip `password` and `__v` from all JSON responses.
3. **No Owner ID Input**: The server ignores any owner ID sent by the client and strictly assigns `owner = req.user.id`.
