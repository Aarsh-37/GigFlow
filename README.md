# GigFlow – Real-Time Freelance Marketplace

<div align="center">


### Real-Time Freelance Marketplace Platform

<p align="center">
  A production-grade full-stack marketplace engineered for seamless collaboration between freelancers and clients through secure workflows, real-time communication, and scalable system architecture.
</p>


</div>

---

## Overview

GigFlow is built to simulate a modern production-ready freelance ecosystem where clients and freelancers can interact through secure gig workflows, live updates, escrow-style project handling, and scalable backend services.

The platform focuses on delivering a smooth real-time experience while following industry-standard engineering and deployment practices.

---

## What Powers GigFlow

<table>
<tr>
<td width="33%" align="center">

### Real-Time Systems

Socket.IO-powered live notifications, instant dashboard synchronization, and responsive user interactions.

</td>

<td width="33%" align="center">

### Secure Architecture

JWT authentication, role-based authorization, protected APIs, and security-first backend middleware.

</td>

<td width="33%" align="center">

### Scalable Engineering

RESTful APIs, modular MVC architecture, Dockerized workflows, and production-ready backend practices.

</td>
</tr>
</table>

---

# Features

<div align="center">

| Real-Time Collaboration | Secure Authentication |
|--------------------------|----------------------|
| Live notifications, dashboard updates, and seamless Socket.IO synchronization for instant communication across the platform. | JWT authentication, Google OAuth, protected routes, rate limiting, Helmet security, and Zod validation ensure strong security. |

| Freelance Marketplace Workflow | Smart User Experience |
|--------------------------------|-----------------------|
| Post gigs, submit bids, hire freelancers, and manage escrow-style project workflows with ease. | Interactive dashboards and persistent notifications keep users connected and informed in real time. |

| Scalable Engineering Architecture |
|-----------------------------------|
| Built using RESTful APIs, MVC architecture, centralized error handling, Dockerized deployment, and Swagger/OpenAPI documentation for scalable development. |

</div>

--- 

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
