# Render Deployment Guide

## Quick Start: Demo Mode (No Database Required!)

The easiest way to deploy and show the application is using **Demo Mode**, which works completely offline with mock data - **no database or backend needed!**

---

## Step 1: Deploy Frontend Service (Demo Mode)

1. **In Render Dashboard:**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository: `Sarvandani/Fullstack-TaskManagement`

2. **Fill in the form:**

   **Basic Settings:**
   - **Name:** `taskmanagement-frontend`
   - **Region:** Choose your preferred region (e.g., Frankfurt)
   - **Branch:** `main`

   **Root Directory:**
   - Set to: `frontend`

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   npm start
   ```

   **Instance Type:**
   - Select **Free**

3. **Add Environment Variable (Optional for demo mode):**

   ```
   NEXT_PUBLIC_API_URL = http://localhost:5002/api
   ```
   
   **Note:** This won't be used in demo mode, but Next.js requires it. You can use any placeholder value.

4. **Click "Create Web Service"**

   - Wait for deployment to complete (takes 2-5 minutes)
   - **Copy the frontend URL** (e.g., `https://taskmanagement-frontend-xxxx.onrender.com`)

---

## Step 2: Verify Demo Mode

1. Visit your frontend URL
2. Click the **"Try Demo Mode"** button
3. Explore the application with mock data:
   - View dashboard with analytics
   - Browse 3 demo projects
   - See 12 demo tasks
   - Check assignees page
   - All features work with mock data!

**That's it! Demo mode works completely offline - no database or backend needed! ✅**

---

## Alternative: Deploy on Vercel (Recommended for Next.js)

**Option B: Deploy on Vercel**

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click **Add New Project**
4. Import repository: `Sarvandani/Fullstack-TaskManagement`
5. **Configure Project:**
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
6. **Environment Variables (Optional):**
   - `NEXT_PUBLIC_API_URL` = `http://localhost:5002/api` (placeholder, not used in demo)
7. Click **Deploy**
8. Copy the Vercel URL
9. Click **"Try Demo Mode"** to test!

---

## What Works in Demo Mode

✅ **Dashboard** - View analytics and stats
✅ **Projects** - Browse 3 demo projects
✅ **Tasks** - See 12 demo tasks across projects
✅ **Task Board** - Drag and drop tasks (updates only in browser)
✅ **Assignees** - View all assignees and their tasks
✅ **Project Details** - Full project pages with tasks
✅ **UI Navigation** - All pages and navigation work

❌ **Does NOT work in Demo Mode:**
- Sign up / Login (not needed - use demo mode!)
- Creating new projects (shows alert)
- Creating new tasks (shows alert)
- Editing/deleting tasks (updates only in browser, not saved)
- File uploads (not available)
- Real-time updates (not available)

---

## Frontend Configuration Details

**Root Directory:** `frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables (Optional):**
- `NEXT_PUBLIC_API_URL` - Placeholder value (not used in demo mode, but required by Next.js)

---

## Troubleshooting

**Build fails:**
- Check build logs in Render/Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify Node.js version (Render/Vercel uses Node 18+ by default)

**Demo mode not working:**
- Make sure you clicked "Try Demo Mode" button on login page
- Check browser console for errors
- Verify the frontend deployed successfully

**Application loads but is blank:**
- Check if you're logged in (try demo mode)
- Check browser console for JavaScript errors
- Verify build completed successfully

---

## Summary Checklist (Demo Mode Only)

- [ ] Deploy frontend service on Render or Vercel
  - [ ] Set root directory to `frontend`
  - [ ] Set build command: `npm install && npm run build`
  - [ ] Set start command: `npm start`
  - [ ] Add `NEXT_PUBLIC_API_URL` environment variable (placeholder)
- [ ] Visit frontend URL
- [ ] Click "Try Demo Mode" button
- [ ] Test the demo application ✅

**That's all you need! Demo mode works completely offline with mock data.**

---

## Full Deployment (With Database - Optional)

If you want full functionality with data persistence, sign up, login, and real-time features, you'll need to:

1. Set up a cloud database (Supabase or Render PostgreSQL)
2. Deploy backend service on Render
3. Configure environment variables
4. Update frontend to connect to backend

**For demo purposes, the frontend-only deployment is sufficient!**

---

Good luck! 🚀
