# Task Flow - Assessment-Ready MERN Task Manager with TypeScript

Task Flow is a production-style full-stack Task Management application engineered with Node.js, Express, MongoDB, React 19, TypeScript, Zod validation, JWT authentication, and Tailwind CSS.

---

## Technical Stack & Architecture

### Backend
- **Node.js & Express (v4.21.2)**: Modular routing with thin controllers.
- **TypeScript**: Strict type safety across models, schemas, and controllers with no `any` leaks.
- **Mongoose & MongoDB**: Compound schema indexing on `(owner, status)`, `(owner, priority)`, and `(owner, createdAt)`.
- **Security**: Helmet headers, CORS origin restrictions, Express body limit (10kb), JWT Bearer token authentication, password hashing with `bcrypt` (10 rounds).
- **Input Validation**: Zod validation schemas with `.strict()` mode for update parameters, validating registration, login, task creation, updates, and query parameters.
- **Error Handling**: Custom `AppError` class and global error middleware handling Zod validation errors, CastErrors (invalid ObjectIds), Duplicate key errors (409 conflict), and JWT expiration.
- **Strict Ownership Isolation**: All task reads, updates, and deletes strictly execute queries of the form `{ _id: taskId, owner: userId }`, guaranteeing generic `404 Not Found` for unauthorized cross-user access attempts.
- **Regex Search Safety**: Title search safely escapes regular-expression special characters (`.*+?^${}()|[\]\\`).

### Frontend
- **React 19 & Vite**: Ultra-fast build toolchain.
- **TypeScript**: End-to-end type safety with shared interfaces.
- **TanStack Query (React Query v5)**: Declarative server state management, caching, and mutation invalidations.
- **React Hook Form & Zod**: Form state handling with client-side validation.
- **React Error Boundary**: Top-level `ErrorBoundary` component catching unexpected UI runtime errors.
- **Tailwind CSS**: Custom dark theme design system, glassmorphism card layouts, skeleton loaders, and responsive layouts down to 320px mobile viewports.
- **Lucide Icons**: Clean UI iconography.
- **Attachments**: Multipart file selection, owner-protected downloads, removal controls, and file validation.

---

## Project Structure

```text
task-manager/
├── client/
│   ├── src/
│   │   ├── api/            # Axios client with Bearer token interceptor & 401 handler
│   │   ├── components/     # Navbar, TaskCard, TaskModal, TaskFilters, Pagination, SkeletonLoader, EmptyState, ErrorBoundary
│   │   ├── context/        # AuthContext & useAuth hook
│   │   ├── pages/          # LoginPage, RegisterPage, DashboardPage
│   │   ├── tests/          # Vitest & React Testing Library component tests
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

## Feature List

### Core Features
- User registration with normalized email & password hashing.
- User login returning JWT Bearer token.
- Profile fetch (`/api/auth/me`) with token validation.
- Task CRUD operations with strict owner scoping (`{ _id, owner }`).
- Search tasks by title with regex character escaping.
- Filter tasks by status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) and priority (`LOW`, `MEDIUM`, `HIGH`).
- Paginated task lists with sort order (`createdAt`, `dueDate`, `priority`, `status`, `title`).
- Standardized API envelope response (`{ success, data, message, error, pagination }`).
- Dark mode responsive UI with React 19, Tailwind CSS, TanStack Query, and React Hook Form.
- Secure task attachments with authenticated upload, download, and removal.
- Relative reminders using seconds, minutes, hours, or days before a task is due.

### Bonus Features
- Automatic in-memory MongoDB fallback test server for Postman / Newman verification.
- GitHub Actions CI workflow for automated linting, typechecking, and testing.
- Top-level React `ErrorBoundary` component.
- Kanban board with drag-and-drop status changes.
- Task attachments with persistent file storage.
- Relative in-app and browser reminders.
- Docker Compose setup for the client, API, MongoDB, and uploaded files.

---

## Environment Variables

| Variable | Scope | Description | Default / Example |
|---|---|---|---|
| `PORT` | Server | HTTP Server Listening Port | `5000` |
| `MONGODB_URI` | Server | MongoDB Connection String | `mongodb://localhost:27017/task_manager` |
| `JWT_SECRET` | Server | Secret key for signing JWT tokens | Required in production |
| `JWT_EXPIRES_IN` | Server | JWT token expiration duration | `7d` |
| `CLIENT_URL` | Server | Allowed CORS Origin URL | `http://localhost:3000` |
| `UPLOAD_DIR` | Server | Persistent task attachment directory | `uploads` |
| `VITE_API_BASE_URL` | Client | API Base URL for frontend Axios | `/api` |

---

## Prerequisites & Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Local MongoDB or MongoDB Atlas instance

### 2. Setup
```bash
git clone <repository-url>
cd task-manager

# Install dependencies across root, server, and client
npm run install:all

# Configure environment files from templates
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Verification Commands
```bash
# Run ESLint across client and server
npm run lint

# Run TypeScript compiler check
npm run typecheck

# Run full Vitest test suite (34 server + 31 client = 65 tests)
npm run test

# Run production build
npm run build
```

### 4. Running Postman Collection via Newman
```bash
# Start backend server or test server on port 5000, then run:
npx --yes newman run Task-Manager.postman_collection.json -e Local.postman_environment.json
```

### 5. Running Local Development Server
```bash
npm run dev
```

### 6. Running with Docker

Docker Compose runs the React/Nginx client, Express API, and MongoDB. Database data
and uploaded attachments are persisted in named volumes.

```bash
cp .env.example .env
# Replace JWT_SECRET in .env with a long random value.
docker compose up --build
```

Open `http://localhost:3000`. Stop the stack with:

```bash
docker compose down
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health Check | No |
| `POST` | `/api/auth/register` | Register New User | No |
| `POST` | `/api/auth/login` | Login User & Receive JWT | No |
| `GET` | `/api/auth/me` | Get Authenticated Profile | Yes |
| `GET` | `/api/tasks` | Search, Filter & Paginate Tasks | Yes |
| `POST` | `/api/tasks` | Create New Task | Yes |
| `GET` | `/api/tasks/:id` | Get Task by ID (Owner-scoped) | Yes |
| `PATCH` | `/api/tasks/:id` | Update Task (Owner-scoped) | Yes |
| `DELETE` | `/api/tasks/:id` | Delete Task (Owner-scoped) | Yes |
| `POST` | `/api/tasks/:id/attachments` | Upload up to 5 task attachments | Yes |
| `GET` | `/api/tasks/:id/attachments/:attachmentId` | Download an owner-scoped attachment | Yes |
| `DELETE` | `/api/tasks/:id/attachments/:attachmentId` | Remove an owner-scoped attachment | Yes |

---

## Security Decisions & Deployment Info

1. **Query-Level Security**: Ownership checks occur at the database query level (`Task.findOne({ _id, owner })`). Cross-user attempts return `404 Not Found`, eliminating timing side-channel attacks and TOCTOU vulnerabilities.
2. **Password & Data Protection**: Mongoose `toJSON` transform automatically strips `password` and `__v` from JSON responses. Passwords are never logged.
3. **Strict Client Input Handling**: Client-provided owner IDs are ignored; task ownership is strictly bound to `req.user.id`.
4. **Attachment Safety**: Downloads require JWT authentication and task ownership. Files use randomized stored names, an allowlist of file types, a 5 MB per-file limit, and a maximum of five files per task.
5. **Deployment Status**: Not publicly deployed; Docker Compose provides a reproducible local deployment.
6. **Test Credentials**: Not required (new reviewers can register freshly via UI or API).

---

## Submission Disclosures & Metrics

- **Known Issues / Incomplete Items**: No public live deployment. Browser reminders require the app/browser to be running; closed-browser push delivery would require a push subscription service.
- **Actual Time Spent**: ~6 hours.
- **AI Tool Disclosure**: Built with Antigravity AI assistant pair programming guidance.
