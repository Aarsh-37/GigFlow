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
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
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
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:5000`.
