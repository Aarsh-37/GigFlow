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
- **Auth Fixes:** Corrected role enum in `registerSchema` to match the new architecture (`hirer`, `intern`).
- **Path Fixes:** Updated inconsistent API path references from `/api` to `/api/v1` in `passportConfig.js`, `swaggerDef.js`, and frontend `Login`/`Register` pages.
- **OAuth:** Added `GOOGLE_CALLBACK_URL` to `.env` to allow flexible configuration and resolve `redirect_uri_mismatch` errors.
- **Dashboard Fixes:** 
    - Fixed missing data in `dashboardController.js` (calculated `totalEarned` for interns and `totalSpent` for hirers).
    - Improved `activeInterns` data for hirers to show intern details instead of just gig titles.
    - Fixed UI bugs in `Dashboard.jsx` where application data was incorrectly referenced.
    - Added `morgan` middleware for better request logging in development.
- **Feed & Profile Fixes:**
    - Fixed `fetchGigs` service logic in the backend to correctly handle pagination and filters from a single query object.
    - Resolved data extraction issues in `gigSlice`, `profileSlice`, `Login`, `Register`, and `Profile` pages to correctly handle the backend's nested response format.
    - Standardized profile and internship-related API endpoints in the frontend for better consistency.
- **Post Gig Fix:** Fixed validation error in `CreateGig.jsx` by sending a mandatory `tags` array to satisfy the strict schema requirement.
- **Feed Fix:** Resolved `TypeError: gigService.fetchGigs(...).lean is not a function` by removing the incorrect `.lean()` call in `getGigs` controller, as the service already returns plain objects.
- **Documentation:** Corrected `VITE_API_URL` in `frontend/.env.example`.
