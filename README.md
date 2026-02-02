<<<<<<< HEAD
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

### 🛠️ Strategic Moderation (Admin Panel)
- **Role-Based Access Control (RBAC)**: A dedicated administrative layer to monitor the entire ecosystem.
- **Global Oversight**: Admins can view all users, monitor every gig's status, and moderate content by deleting inappropriate postings.

---

## 🏗️ Tech Stack

### Frontend
- **React.js (Vite)**
- **Tailwind CSS** (Modern, responsive UI)
- **Redux Toolkit** (Global state management)
- **Framer Motion** (Subtle micro-animations)
- **Socket.IO-Client** (Real-time sync)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Relational-style modeling)
- **Passport.js** (Standard & Google OAuth)
- **Socket.IO** (Event-driven architecture)
- **Zod** (Type-safe validation)

---

## 🚦 Getting Started

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Local or Atlas)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Aarsh-37/GigFlow.git

=======
# GigFlow – Mini Freelance Marketplace

GigFlow is a small full-stack project that works like a **freelance job platform**.  
Clients can post jobs (called *Gigs*) and freelancers can apply to those jobs by placing bids.

This project was built as part of a **Full Stack Development Internship Assignment** to demonstrate backend logic, authentication, and database relationships.

---

## About the Project

In GigFlow:
- Any user can post a job
- Any user can apply to jobs
- A client can hire **only one freelancer per job**

The focus of this project is not just UI, but **correct business logic**, especially the hiring flow.

---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Redux Toolkit / Context API

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Authentication
- JWT (JSON Web Tokens)
- HttpOnly Cookies

---

## Features

### User Authentication
- Sign up and login
- Secure JWT-based authentication
- No fixed roles – users can act as both **client** and **freelancer**

---

### Gigs (Jobs)

- View all open gigs
- Search gigs by title
- Post a new gig with:
  - Title
  - Description
  - Budget

---

### Bidding & Hiring Logic

This is the most important part of the project:

1. Freelancers place bids on gigs (message + price)
2. The client can see all bids for their gig
3. The client hires **one** freelancer

When a freelancer is hired:
- The gig status changes from **Open → Assigned**
- The selected bid becomes **Hired**
- All other bids for that gig are automatically **Rejected**

This logic is handled on the backend.

---



---

## Setup & and Installation

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 2. Installation
Clone the repository and install dependencies for **both** backend and frontend:

```bash
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
<<<<<<< HEAD
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

### 4. Running the Development environment
**Backend:**
=======
Create a `.env` file in the `backend` folder with the following values:

```env
PORT= Any Port here we have taken 5000
MONGO_URI=connect with your Mongo
JWT_SECRET= makeyourOwn
NODE_ENV=development  / production for deployment purpose
```

### 4. Running the Project
You need to run both the backend and frontend servers.

**Option 1: Two Terminals**
Terminal 1 (Backend):
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
```bash
cd backend
npm run dev
```
<<<<<<< HEAD
**Frontend:**
=======

Terminal 2 (Frontend):
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
```bash
cd frontend
npm run dev
```

<<<<<<< HEAD
---

## 🧪 Testing
Run the testing suite to verify system integrity:
```bash
cd backend
npm test
```

---

## 📄 License
This project is part of a professional internship assignment. All logic and engineering patterns are original implementations.
=======
The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.
>>>>>>> 9f1b36aefc5edba50be4def76c633c15eddff02f
