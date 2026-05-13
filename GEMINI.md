# GigFlow Project GEMINI Instructions

## 1. Workflow

This project follows a standard development lifecycle:

1.  **Research:** Systematically map the codebase, validate assumptions, and empirically reproduce issues.
2.  **Strategy:** Formulate a grounded plan based on research, outlining changes and testing.
3.  **Execution:** For each sub-task, follow a **Plan -> Act -> Validate** cycle:
    *   **Plan:** Define specific implementation and testing strategy.
    *   **Act:** Apply targeted, surgical changes.
    *   **Validate:** Rigorously test changes and ensure adherence to workspace standards.

All changes require thorough validation, including unit tests and adherence to project conventions.

## 2. What Work is Done

GigFlow is a MERN freelance marketplace connecting skilled freelancers with clients. Key functionalities include:
- Gig creation, discovery, and management.
- Bid submission and management.
- User profiles with roles, skills, and ratings.
- Real-time chat and notifications.
- Secure payment processing (simulated via escrow).

## 3. Tech Stack

**Frontend:**
- **Framework:** React
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS, Vanilla CSS
- **API Client:** Axios

**Backend:**
- **Framework:** Node.js with Express.js
- **Database:** MongoDB
- **Real-time:** Socket.IO
- **Authentication:** JWT with HTTP-only cookies
- **Validation:** Zod
- **Logging:** Winston
- **Security:** Helmet, express-rate-limit, CORS

**DevOps & Engineering:**
- **Containerization:** Docker, docker-compose.yml
- **Testing:** Jest, Supertest (Backend), Vitest, React Testing Library (Frontend)
- **CI/CD:** GitHub Actions
- **Documentation:** Swagger/OpenAPI
