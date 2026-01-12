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


