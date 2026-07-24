# QA Testing & Verification Guide

This guide outlines manual and automated QA test scenarios to verify security, functionality, and UX boundaries of the Task Manager application.

---

## 1. Automated Verification Suite

Run the full automated check suite across both server and client workspace:

```bash
# Lint code
npm run lint

# Typecheck TypeScript definitions
npm run typecheck

# Run backend & frontend test suites
npm run test

# Production build
npm run build
```

---

## 2. Manual Cross-User Security Test (Mandatory Highest-Risk Check)

### Objective
Ensure tasks created by User A cannot be retrieved, updated, or deleted by User B. Every query MUST return `404 Not Found`.

### Steps
1. Register User A (`usera@example.com` / `password123`).
2. Create a task as User A (`POST /api/tasks`) -> Copy returned `_id` (`USER_A_TASK_ID`).
3. Register User B (`userb@example.com` / `password123`).
4. Using User B's Bearer JWT token, execute the following requests:
   - `GET /api/tasks/USER_A_TASK_ID` -> Must return **404 Not Found**
   - `PATCH /api/tasks/USER_A_TASK_ID` -> Must return **404 Not Found**
   - `DELETE /api/tasks/USER_A_TASK_ID` -> Must return **404 Not Found**
5. Authenticate back as User A and execute `GET /api/tasks/USER_A_TASK_ID`. Confirm task is untouched.

---

## 3. Postman Automated Collection Test

1. Open Postman.
2. Import `Task-Manager.postman_collection.json` and `Local.postman_environment.json`.
3. Select the `Local` environment.
4. Run the collection runner.
5. All tests (Auth, Task CRUD, Ownership security checks) should pass 100%.

---

## 4. UX & Responsive Design Testing

- Test layout on mobile viewports: **320px** (iPhone SE) and **390px** (iPhone 12/13/14).
- Confirm form input focus styles, status pill toggles, and modal dialog responsiveness.
- Verify loading skeleton states during slow network throttling.
