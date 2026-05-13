# GigFlow – Professional Freelance Marketplace

GigFlow is a high-performance, full-stack freelancer marketplace built to demonstrate advanced engineering patterns, real-time systems, and robust business logic. It transitions beyond a simple job board into a production-hardened platform with secure transaction lifecycles and real-time communication.

---

## 🚀 "Stand Out" Advanced Features

### 💻 Real-Time Systems & Communication
- **Gig-Scoped Chat**: Private, real-time messaging channels that open automatically between a client and a freelancer only after a hire is confirmed. Powered by **Socket.IO** rooms.
- **Instant Synchronization**: Dashboards, stats, balances, and project statuses update in real-time across all open tabs using bidirectional socket event broadcasting.
- **Persistent Notifications**: A real-time notification center that stores and displays project milestones, new bids, and hiring decisions.

### 💰 Secure Economic Model (Escrow)
- **Automated Escrow**: Implements a mock transaction lifecycle where client funds are held in gig escrow upon hiring and released only when work is delivered and confirmed.
- **Virtual Balances**: Every user maintains a virtual wallet to track earnings and project deposits.
- **Relational Integrity**: Automatic updates to user stats (completed projects, average ratings) triggered by business logic events.

### 🛡️ Engineering & Production Quality
- **Schema Validation**: Robust input validation using **Zod** for all critical API endpoints (Auth, Gigs, Bids, Chat).
- **Security Hardening**: Integration of **Helmet** for secure headers, **CORS** strict origin control, and **Express Rate Limiting** to prevent brute-force attacks and spam.
- **Fault-Tolerant Configuration**: Backend designed to start gracefully even without optional credentials (like Google OAuth), providing clear developer feedback.
- **Testing Suite**: A stable foundation built with **Jest** and **Supertest** for unit and integration testing.
- **API Documentation**: Integrated **Swagger/OpenAPI** documentation for clear API understanding.
- **Docker Support**: Dockerized services for MongoDB, backend, and frontend using `docker-compose`.

---

## 🖼️ Visuals

### Screenshots
*(Placeholder for screenshots of key features like the dashboard, gig listings, chat interface, etc. These will be added after development.)*

### Live Demo
*(Placeholder for a link to the live deployed application. This will be added upon successful deployment.)*

---

## 🏗️ Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS** (Modern, responsive UI)
- **Redux Toolkit** (Global state management)
- **Framer Motion** (Subtle micro-animations)
- **Socket.IO-Client** (Real-time sync)
- **Vitest & React Testing Library** (Frontend testing)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Relational-style modeling)
- **Passport.js** (Standard & Google OAuth)
- **Socket.IO** (Event-driven architecture)
- **Zod** (Type-safe validation)
- **Jest & Supertest** (Backend testing)
- **Swagger/OpenAPI** (API documentation)

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Local or Atlas)
- **Docker** (for docker-compose setup)

### 2. Installation

#### Option A: Local Development (Manual Setup)
Clone the repository and install dependencies separately for backend and frontend:

```bash
# Clone the repository
git clone https://github.com/Aarsh-37/GigFlow.git
cd GigFlow

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

#### Option B: Docker Compose (Recommended)
For a streamlined setup with containerized services:

```bash
# Clone the repository
git clone https://github.com/Aarsh-37/GigFlow.git
cd GigFlow

# Ensure Docker is running
# Build and run services (MongoDB, Backend, Frontend)
docker-compose up --build
```

### 3. Environment Setup

#### Backend `.env`
Create a `.env` file in the `backend` directory and configure the following variables:

*   **`PORT`**: The port the backend server will run on (e.g., `5000`).
*   **`MONGO_URI`**: Your MongoDB connection string. For local development, `mongodb://localhost:27017/gigflow` is common. For production, use a MongoDB Atlas connection string. **Ensure this is strong and unique for production.**
*   **`JWT_SECRET`**: **Crucial for security.** This MUST be a long, random, and securely stored string. **NEVER commit this to version control directly.** Use environment variables or a secret management system in production.
*   **`FRONTEND_URL`**: The URL where your frontend application is running (e.g., `http://localhost:5173`). This is used for CORS configuration and redirects after login.
*   **`NODE_ENV`**: Set to `development` for local development, and `production` in production environments.
*   **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`**: (Optional) Your Google OAuth application credentials if you enable Google login.

#### Frontend `.env`
Create a `.env` file in the `frontend` directory and configure the following variable:

*   **`VITE_API_URL`**: The base URL of your backend API (e.g., `http://localhost:5000/api`). Ensure this points to the correct backend service when running in different environments (e.g., Docker, production).

---

## ▶️ Running the Project

### Option A: Local Development
Run both the backend and frontend development servers simultaneously.

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Option B: Docker Compose
If you have Docker installed and running:

```bash
# From the project root directory
docker-compose up --build
```
This command will build the Docker images (if needed) and start all services (MongoDB, backend, frontend).

---

## 🧪 Testing

### Backend Tests
Run the backend test suite (Jest):
```bash
cd backend
npm test
```

### Frontend Tests
*(Placeholder for frontend testing instructions. Will be updated once Vitest setup is confirmed.)*
```bash
cd frontend
npm test # (or specific command if different)
```

---

## 🤝 Contributing

Contributions are welcome! Please refer to the `CONTRIBUTING.md` file for guidelines on how to contribute to this project.

---

## 📜 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.
