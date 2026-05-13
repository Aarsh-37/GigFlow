# GigFlow Architecture Overview

## 1. Introduction

GigFlow is a full-stack freelance marketplace application designed with modern software engineering practices. It comprises a React frontend powered by Vite, communicating with a Node.js/Express.js backend that manages data persistence with MongoDB. Real-time features are enabled by Socket.IO, and the application is containerized using Docker for consistent development and deployment.

## 2. Architecture Diagram

*(Placeholder: An architecture diagram would visually represent the following components and their interactions.)*

## 3. Core Components

### Frontend (React + Vite)
-   **Framework:** React
-   **Build Tool:** Vite
-   **State Management:** Redux Toolkit (for global state like auth, notifications)
-   **Routing:** React Router DOM
-   **API Client:** Axios with interceptors for auth and error handling
-   **UI Styling:** Tailwind CSS, Vanilla CSS
-   **Real-time:** Socket.IO Client
-   **Testing:** Vitest, React Testing Library

### Backend (Node.js + Express.js)
-   **Framework:** Express.js
-   **Database:** MongoDB (Mongoose ODM)
-   **Real-time:** Socket.IO
-   **Authentication:** JWT (HTTP-only cookies), Passport.js (including Google OAuth)
-   **Validation:** Zod for schema validation
-   **Security:** Helmet, express-rate-limit, CORS configuration
-   **Logging:** Winston
-   **API Documentation:** Swagger/OpenAPI

### Database
-   **Type:** NoSQL
-   **Technology:** MongoDB
-   **ODM:** Mongoose

### Real-time Communication
-   **Technology:** Socket.IO
-   **Usage:** Real-time notifications, dashboard updates, chat functionality (planned).
-   **Security:** Authenticated via JWT, users join specific rooms (`userId`, `gig_id`).

### DevOps & Infrastructure
-   **Containerization:** Docker, Docker Compose for local development.
-   **CI/CD:** GitHub Actions (CI pipeline for build and test).
-   **Environment Management:** `.env` files with configuration in `docker-compose.yml`.

## 4. Key Architectural Patterns

-   **RESTful API:** Backend follows REST principles for client-server communication.
-   **MVC (Model-View-Controller):** Backend adheres to a separation of concerns with controllers handling logic, models interacting with the database, and routes defining endpoints.
-   **Event-Driven Architecture:** Socket.IO is used for real-time event broadcasting.
-   **Centralized Error Handling:** Express middleware handles errors uniformly.
-   **Centralized Validation:** Zod schemas are used via middleware for input validation.
-   **API Client Abstraction:** Axios instance with interceptors manages frontend API interactions.

## 5. Security Considerations

-   **Authentication:** JWT with HTTP-only cookies.
-   **Authorization:** Middleware (`protect`, `authorize`, `isGigOwner`, `isBidOwner`) restricts access to routes and actions.
-   **Input Validation & Sanitization:** Zod schemas with explicit sanitization for string inputs.
-   **Rate Limiting:** Applied globally and strictly for authentication endpoints.
-   **Security Headers:** Helmet middleware is used.
-   **CORS:** Configured with specific origins via `FRONTEND_URL`.
-   **Socket.IO Security:** JWT authentication and restricted room joining.

## 6. Scalability & Performance

-   **Database Indexing:** Indexes are applied to critical fields in User and Gig models.
-   **Pagination:** Implemented for the Gigs API.
-   **Containerization:** Docker enables easier scaling and deployment.

## 7. Future Enhancements

-   Implement robust feature additions (e.g., full dark mode, mobile hamburger menu).
-   Expand real-time features (e.g., chat).
-   Add comprehensive frontend tests.
-   Improve responsive design across all components.
