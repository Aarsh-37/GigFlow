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

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_id

### 4. Running the Development environment
**Backend:**
```bash
cd backend
npm run dev
```
**Frontend:**
cd frontend
npm run dev
```

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
