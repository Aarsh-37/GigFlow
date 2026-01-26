# Deployment Guide for GigFlow

To get a **Hosted Link** for your submission, you must deploy your local application to the cloud. Since you are using a Database (MongoDB), you cannot just upload files; you need a server and a cloud database.

Here is the easiest path for a MERN stack app: **MongoDB Atlas** (Database), **Render** (Backend), and **Vercel** (Frontend).

---

## Part 1: The Cloud Database (MongoDB Atlas)
Your local database (`localhost`) cannot be accessed by the cloud. You need a cloud database.

1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and Sign Up (Free).
2.  Create a **New Cluster** (Shared/Free Tier).
3.  **Database Access:** Create a user (e.g., `admin`) and password. **Write this down!**
4.  **Network Access:** click "Add IP Address" -> **Allow Access from Anywhere** (`0.0.0.0/0`). This is crucial for Render to connect.
5.  Click **Connect** -> **Connect your application**.
6.  Copy the **Connection String**. It looks like:
    `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
7.  Replace `<password>` with your actual password. **Keep this URL safe.**

---

## Part 2: Deploy Backend (Render)
1.  Push your latest code to GitHub (You already did this!).
2.  Go to [Render.com](https://render.com/) and Sign Up with GitHub.
3.  Click **New +** -> **Web Service**.
4.  Select your `GigFlow` repository.
5.  **Settings:**
    *   **Name:** `gigflow-backend` (or similar)
    *   **Root Directory:** `backend` (Important!)
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
6.  **Environment Variables (Advanced Button):**
    *   Add `MONGO_URI`: (Paste your MongoDB Atlas connection string from Part 1)
    *   Add `JWT_SECRET`: (Enter your secret key)
    *   Add `NODE_ENV`: `production`
7.  Click **Create Web Service**.
8.  Wait for it to deploy. Once done, copying the **URL** (e.g., `https://gigflow-backend.onrender.com`).
    *   *Note: It might take a minute to start up.*

---

## Part 3: Deploy Frontend (Vercel)
1.  Go to `frontend/src/utils/api.js` in your code.
2.  Change the `baseURL` to your **Render Backend URL**:
    ```javascript
    // frontend/src/utils/api.js
    const api = axios.create({
        // baseURL: 'http://localhost:5000/api', // Comment this out
        baseURL: 'https://gigflow-backend.onrender.com/api', // Use your new Render URL
        withCredentials: true,
    });
    ```
3.  Commit and Push this change to GitHub.
4.  Go to [Vercel.com](https://vercel.com/) and Sign Up with GitHub.
5.  Click **Add New...** -> **Project**.
6.  Import your `GigFlow` repository.
7.  **Project Settings:**
    *   **Framework Preset:** Vite
    *   **Root Directory:** `frontend` (Important!)
8.  Click **Deploy**.
9.  Once finished, Vercel will give you a domain (e.g., `https://gigflow.vercel.app`).


## Part 4: Final Submission
*   **GitHub Repository:** `https://github.com/Aarsh-37/GigFlow`
*   **Hosted Link:** (Your Vercel URL from Part 3)
