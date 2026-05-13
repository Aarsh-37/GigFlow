# GigFlow Folder Structure

This document outlines the organizational structure of the GigFlow project, detailing the purpose of key directories and files.

## 1. Project Root

The root directory contains top-level configuration files, essential documentation, and top-level scripts.

-   `.env.example`: Example environment variables for backend and frontend.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `CONTRIBUTING.md`: Guidelines for contributors.
-   `docker-compose.yml`: Defines and configures multi-container Docker applications.
-   `package.json`: Root-level npm package information and scripts.
-   `README.md`: Project overview, setup, and usage instructions.
-   `ARCHITECTURE.md`: High-level overview of the project's architecture.
-   `FOLDER_STRUCTURE.md`: This document.
-   `.github/`: Contains GitHub-specific configuration, like workflows and issue/PR templates.
    -   `workflows/`: GitHub Actions CI/CD pipeline configurations.

## 2. Backend (`/backend`)

The `/backend` directory houses the Node.js/Express.js application.

-   **`config/`**: Application configuration files.
    -   `db.js`: Database connection logic (MongoDB).
    -   `logger.js`: Winston logger configuration.
    -   `passportConfig.js`: Passport.js configuration for authentication strategies.
-   **`controllers/`**: Handles request/response logic, interacting with services/models.
    -   `adminController.js`, `authController.js`, `bidController.js`, etc.
-   **`middleware/`**: Express middleware functions.
    -   `authMiddleware.js`: Protects routes using JWT.
    -   `errorMiddleware.js`: Centralized error handling.
    -   `validationMiddleware.js`: Zod-based request validation.
    -   `checkOwnership.js`: Middleware for ownership checks.
-   **`models/`**: Mongoose schemas defining data models.
    -   `User.js`, `Gig.js`, `Bid.js`, `Notification.js`, etc.
-   **`routes/`**: Defines API endpoints and links them to controllers.
    -   `authRoutes.js`, `gigRoutes.js`, `bidRoutes.js`, etc.
-   **`tests/`**: Backend unit and integration tests.
    -   `api.test.js`, `auth.test.js`, etc.
-   **`utils/`**: Reusable utility functions.
    -   `generateToken.js`: JWT generation.
    -   `notificationUtils.js`: Notification logic.
    -   `sendResponse.js`: Consistent API response formatting.
-   **Root backend files:** `server.js` (main application entry point), `Dockerfile`, `.babelrc`, `jest.config.js`, `package.json`, etc.

## 3. Frontend (`/frontend`)

The `/frontend` directory contains the React application.

-   **`public/`**: Static assets served directly.
    -   `vite.svg`: Example SVG.
-   **`src/`**: Core application source code.
    -   **`assets/`**: Static assets used within components.
    -   **`components/`**: Reusable UI components.
        -   `Chat.jsx`, `Navbar.jsx`, `LoadingSkeleton.jsx`, etc.
    -   **`pages/`**: Top-level components representing different application views/routes.
        -   `AdminPanel.jsx`, `CreateGig.jsx`, `Dashboard.jsx`, `LandingPage.jsx`, `ProfilePage.jsx`, etc.
    -   **`slices/`**: Redux Toolkit slices for state management.
        -   `authSlice.js`, `gigSlice.js`, `notificationSlice.js`, etc.
    *   **`utils/`**: Frontend utility functions.
        *   `api.js`: Centralized Axios API client.
        *   `socket.js`: Socket.IO client setup.
    *   `App.jsx`: Main application component, handles routing.
    *   `main.jsx`: Entry point for React application.
    *   `index.css`: Global styles.
    *   `store.js`: Redux store configuration.
-   **Root frontend files:** `index.html`, `vite.config.js`, `package.json`, `.gitignore`, `Dockerfile`, etc.

This structure promotes modularity, maintainability, and scalability for both frontend and backend development.
