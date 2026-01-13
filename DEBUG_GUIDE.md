# 🚑 Deployment Troubleshooting Guide

Since the "Network Error" persists, we need to check exactly which part is failing. Please follow these steps **in order**.

---

### Step 1: Is the Backend Alive?
We need to know if your Render server is actually running or if it crashed.

1.  Go to your **Render Dashboard**.
2.  Click on the **URL** of your web service (e.g., `https://gigflow-backend-xlsy.onrender.com`).
3.  **What do you see?**
    *   ✅ **"API is running..."**: Good! Your backend and database are working. The issue is likely in the Frontend (Step 3).
    *   ❌ **"502 Bad Gateway"** or **"Site can't be reached"**: Your backend CRASHED. Go to Step 2.

---

### Step 2: Why did the Backend Crash? (If Step 1 failed)
If Step 1 failed, your server is refusing to start, usually because of the Database.

1.  Go to **Render Dashboard** -> **Logs**.
2.  Look for **Red Errors**.
3.  **Common Errors:**
    *   `MongooseServerSelectionError`: **IP Blocked.** You forgot to add `0.0.0.0/0` in MongoDB Atlas Network Access.
    *   `bad auth` / `Authentication failed`: **Wrong Password.** You might have typo'd the password in `MONGO_URI`.
    *   `MongoParseError`: **Invalid URL.** Your connection string is malformed.

**Action:** Fix the issue in MongoDB Atlas or Render Env Vars, and wait for redeploy.

---

### Step 3: Is the Frontend Connected? (If Step 1 passed)
If your backend is alive (Step 1 says "API is running"), but the app still fails:

1.  Open your **Vercel Website**.
2.  Right-click anywhere -> **Inspect** -> **Console** tab.
3.  Refresh the page.
4.  Do you see a red error?
    *   `Access to XMLHttpRequest has been blocked by CORS policy`: Copy the URL in the error and verify it matches your backend.
    *   `ERR_CONNECTION_REFUSED`: Your frontend is trying to talk to `localhost`! This means:
        *   You might have forgotten to set `VITE_API_URL` in Vercel.
        *   Or you didn't redeploy Vercel after adding it.

**Action:**
1.  Go to **Vercel Dashboard** -> **Settings** -> **Environment Variables**.
2.  Ensure `VITE_API_URL` is set to `https://gigflow-backend-xlsy.onrender.com/api` (Make sure `/api` is at the end!).
3.  Go to **Deployments** tab -> **Redeploy** to apply the changes.

---

### Summary Checklist
1.  [ ] **MongoDB Atlas:** Network Access set to `0.0.0.0/0`.
2.  [ ] **Render:** `MONGO_URI` is correct.
3.  [ ] **Render:** `FRONTEND_URL` matches your Vercel link exactly.
4.  [ ] **Vercel:** `VITE_API_URL` is set to `.../api`.
