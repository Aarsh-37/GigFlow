# Google OAuth Setup Guide for GigFlow

This guide explains how to set up Google Authentication for the GigFlow platform.

## 1. Create Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named "GigFlow".

## 2. Configure Google Auth Platform
1. Select your project (e.g., "gigflow") in the top project picker.
2. In the sidebar (as seen in your screenshot):
   - Click **Branding**: Fill in the **App name**, **User support email**, and **Developer contact info**. Save these settings.
   - Click **Data access**: Click **Add or Remove Scopes** and select `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
   - Click **Audience**: Ensure the User Type is set to **External** (this is where you might find the External/Internal toggle if not already set).

## 3. Create OAuth 2.0 Client ID
1. In the same sidebar, click on **Clients**.
2. Click **Create Client** (or **+ Create Credentials** > **OAuth client ID** if at the top).
3. Select **Web application**.
4. Set **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://gigflow-frontend.onrender.com` (if applicable)
5. Set **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://gigflow-backend-xlsy.onrender.com/api/auth/google/callback`
6. Click **Create** and copy your **Client ID** and **Client Secret**.

## 4. Update Backend Environment Variables
Add the following variables to your `backend/.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=http://localhost:5173
```

## 5. Restart Backend
Once the variables are added, restart your backend server. The console should log "Google OAuth Strategy initialized successfully."

## How it Works
1. When a user clicks "Google" on the Login or Register page, they are redirected to Google's sign-in page.
2. After successful authentication, Google redirects back to `/api/auth/google/callback`.
3. The backend creates/finds the user, sets a JWT cookie, and redirects the user back to the `FRONTEND_URL`.
4. The frontend (`App.jsx`) detects the absence of user info in local state and calls `/api/auth/me` to recover the session from the cookie.
