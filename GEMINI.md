# GigFlow Architecture & Database Overview

This document outlines the architecture, database structure, and connectivity for the GigFlow Internship Hiring Platform.

## 1. Backend Architecture
GigFlow follows a modular **Controller-Service-Model** architecture using Node.js and Express.js.

*   **Entry Point:** `server.js` (Express + Socket.IO)
*   **Controllers (`/controllers`):** Request/Response handling.
*   **Services (`/services`):** Business logic layer.
*   **Models (`/models`):** Mongoose schemas.
*   **Routes (`/routes`):** API route definitions and middleware orchestration.
*   **Middleware (`/middleware`):** Auth, RBAC (`authorizeRoles`), Validation, and Error handling.

### Tech Stack
*   **Framework:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose ODM
*   **Auth:** JWT (HTTP-only cookies), Passport.js (Google OAuth)
*   **Real-time:** Socket.IO
*   **Async Tasks:** BullMQ
*   **File Storage:** Cloudinary

## 2. Database Models & Connectivity

| Model | Relationships | Primary API Route |
| :--- | :--- | :--- |
| **User** | Central entity | `/api/v1/auth`, `/api/v1/users` |
| **Gig** | `ownerId` -> User | `/api/v1/gigs` |
| **Application** | `internId` -> User, `gigId` -> Gig | `/api/v1/applications` |
| **Message** | `sender`/`receiver` -> User | `/api/v1/chat` |
| **Notification**| `recipient` -> User | `/api/v1/notifications` |
| **Review** | `reviewer`/`reviewee` -> User, `gigId` -> Gig | `/api/v1/reviews` |
| **Dispute** | `raisedBy` -> User, `gigId` -> Gig | `/api/v1/disputes` |

## 3. RBAC (Role-Based Access Control)
Roles are centralized in `backend/utils/constants.js`:
*   `ADMIN`: Full platform control.
*   `HIRER`: Can create/manage gigs, hire/reject applicants.
*   `INTERN`: Can browse gigs, apply to internships.

Middleware used: `protect` (JWT verification), `authorizeRoles(...roles)` (Middleware-based RBAC).

## 4. Frontend Connectivity
*   **Axios:** Configured with `withCredentials: true` via `frontend/src/utils/api.js` for cookie-based auth.
*   **State Management:** Redux Toolkit manages global state (`authSlice`, `applicationSlice`, `gigSlice`).
*   **Routing:** Protected Routes (`HirerRoute`, `InternRoute`, `AdminRoute`) prevent unauthorized URL access.
*   **Real-time:** Socket.IO client connects and joins user-specific rooms based on authenticated `userId`.

## 5. Recent Fixes & Improvements
- **Backend Startup:** Fixed `ENOENT` error in `server.js` by replacing manual `.env` path logic with `dotenv.config()`.
- **Infrastructure:** Added Redis service to `docker-compose.yml` and linked it to the backend via `REDIS_URL`.
- **Resilience:** Implemented Redis error handling and retry strategy in `bullmq.js` to prevent crashes and improve logging.
- **Environment:** Updated `.env.example` to include `REDIS_URL`.
