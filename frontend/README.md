# GigFlow Frontend

This is the client-side application for GigFlow, a freelance marketplace platform.

## Tech Stack
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Real-time**: Socket.io Client
- **Icons**: Lucide React

## Setup & Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The app will run at [http://localhost:5173](http://localhost:5173).

## Key Directories
- `src/components`: Reusable UI components (Navbar, etc.)
- `src/pages`: Main view components (Dashboard, CreateGig, etc.)
- `src/slices`: Redux state slices (authSlice)
- `src/utils`: Helper functions (axios instance)
