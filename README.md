# GigFlow – Real-Time Freelance Marketplace

GigFlow is a modern full-stack freelance marketplace platform built to simulate a real-world production-grade application.  
It enables freelancers and clients to collaborate through secure gig workflows, real-time notifications, escrow-style transactions, and scalable backend architecture.

The project focuses on:
- Real-time systems using Socket.IO
- Secure authentication & authorization
- Scalable REST API architecture
- Modern frontend development
- Production-ready backend practices
- Dockerized deployment workflow

---

# Features

## Real-Time Features
- Real-time notifications
- Live dashboard updates
- Socket.IO integration
- Instant project synchronization

## Authentication & Security
- JWT Authentication
- HTTP-only cookies
- Google OAuth Login
- Role-based authorization
- Protected routes
- Rate limiting
- Helmet security middleware
- Zod validation

## Freelance Marketplace Features
- Gig posting & management
- Bid submission system
- Escrow-style project workflow
- Freelancer hiring process
- User dashboards
- Notification center

## Engineering Features
- RESTful API architecture
- MVC backend structure
- Centralized error handling
- Dockerized environment
- Swagger API documentation
- Modular codebase

---

# Tech Stack

| Category | Technologies |
|----------|---------------|
| Frontend | React.js, Vite, Redux Toolkit, Tailwind CSS, Axios, Socket.IO Client |
| Backend | Node.js, Express.js, MongoDB, Mongoose, JWT, Passport.js, Socket.IO |
| Validation & Security | Zod, Helmet, CORS, Express Rate Limit |
| Testing | Jest, Supertest, Vitest, React Testing Library |
| DevOps & Tools | Docker, Docker Compose, GitHub Actions, Swagger/OpenAPI |

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/Aarsh-37/GigFlow.git
cd GigFlow
```

---

# Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Run Backend:

```bash
npm run dev
```

---

# Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file inside frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Run Frontend:

```bash
npm run dev
```

---

# Docker Setup

Run complete application using Docker:

```bash
docker-compose up --build
```

This starts:
- MongoDB
- Backend Server
- Frontend Application

---

# Testing

## Backend Tests

```bash
cd backend
npm test
```

## Frontend Tests

```bash
cd frontend
npm test
```

---

# API Documentation

Swagger Docs:

```text
http://localhost:5000/api-docs
```

---

# License

This project is licensed under the MIT License.

---

# Author

**Aarsh Vaidya**

GitHub: https://github.com/Aarsh-37
