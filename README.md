This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment Guide

This application consists of two separate services:

- **Frontend**: Next.js application (deployed on Vercel)
- **Backend**: Express.js API server (deployed on Render, Railway, or Fly.io)

Follow this comprehensive guide to deploy both services to production.

### Prerequisites

Before deploying, you need:

1. **GitHub Account** - Required to push code and connect to Vercel
2. **MongoDB Atlas Account** - For the production database ([mongodb.com/cloud](https://www.mongodb.com/cloud))
3. **Vercel Account** - To deploy the frontend ([vercel.com](https://vercel.com))
4. **Backend Hosting Account** - Choose one:
    - [Render.com](https://render.com) (Recommended - easy deployment)
    - [Railway.app](https://railway.app)
    - [Fly.io](https://fly.io)

### Step 1: Prepare Your Repository

**1.1 Create a GitHub Repository**

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Task manager app"

# Create repository on GitHub and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

**1.2 Verify Environment File**

- Check `.env.example` exists and contains placeholder values (not real credentials)
- Your actual `.env` file should be in `.gitignore` and not pushed to GitHub

### Step 2: Set Up MongoDB Atlas (Production Database)

**2.1 Create a MongoDB Cluster**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project (e.g., "task-manager-prod")
4. Create a new cluster:
    - Choose "M0" tier (free) or higher
    - Select region closest to your backend server location
5. Click "Create Deployment"

**2.2 Create Database User**

1. In the cluster, go to "Database Access" → "Add New Database User"
2. Set username: e.g., `taskmanager_user`
3. Set password: Generate a strong password (save it securely)
4. Click "Create User"

**2.3 Add IP Whitelist**

1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (for production, you can restrict to backend server IP)
3. Click "Confirm"

**2.4 Get Connection String**

1. Go to "Databases" → Click "Connect" on your cluster
2. Choose "Drivers" → "Node.js"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Keep this string safe - you'll need it for the backend

Example:

```
mongodb+srv://taskmanager_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_manager?retryWrites=true&w=majority
```

### Step 3: Deploy Backend (Express API)

Choose your preferred platform below:

#### **Option A: Deploy on Render (Recommended)**

**3A.1 Create Render Account & Connect GitHub**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your GitHub repositories

**3A.2 Create New Web Service**

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Fill in deployment details:
    - **Name**: `task-manager-api`
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm run start:api` (or `node server/src/server.js`)
4. Click "Create Web Service"

**3A.3 Add Environment Variables**
In the Render dashboard, go to your service → "Environment" and add:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://taskmanager_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/task_manager?retryWrites=true&w=majority
MONGO_DB_NAME=task_manager
JWT_SECRET=your_long_random_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-domain.vercel.app
```

Replace:

- `YOUR_PASSWORD` - Your MongoDB user password
- `your_long_random_jwt_secret_here...` - Generate a random 32+ character string (use a password generator)
- `https://your-vercel-domain.vercel.app` - Your Vercel frontend URL (add after deploying frontend)

**3A.4 Deploy**

- Render automatically deploys when you push to the main branch
- Wait for deployment to complete (5-10 minutes)
- Note your Render URL (e.g., `https://task-manager-api.onrender.com`)

---

#### **Option B: Deploy on Railway**

**3B.1 Create Railway Account**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway

**3B.2 Create New Project**

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Railway auto-detects Node.js

**3B.3 Add Environment Variables**

1. In your project, click "Variables"
2. Add all variables from Step 3A.3 above
3. Click "Deploy"

---

#### **Option C: Deploy on Fly.io**

**3C.1 Install Fly CLI**

```bash
# On Windows (using PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# On macOS/Linux
curl -L https://fly.io/install.sh | sh
```

**3C.2 Create Fly App**

```bash
flyctl auth login
flyctl launch --name task-manager-api --region iad
```

**3C.3 Add Secrets**

```bash
flyctl secrets set NODE_ENV=production PORT=5000 MONGO_URI="mongodb+srv://..." JWT_SECRET="..." JWT_EXPIRES_IN=7d CLIENT_URL="https://..."
```

**3C.4 Deploy**

```bash
flyctl deploy
```

---

### Step 4: Deploy Frontend on Vercel

**4.1 Import GitHub Repository to Vercel**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Continue with GitHub"
3. Authorize Vercel
4. Find and import your repository
5. Click "Import"

**4.2 Configure Project Settings**

1. **Project Name**: `task-manager` (or your preferred name)
2. **Framework**: Next.js (auto-detected)
3. **Root Directory**: Leave as `./`
4. Click "Deploy"

**4.3 Add Environment Variables**

1. After initial deployment, go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. Add the following variables for **Production** environment:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

Replace:

- `https://your-backend-url.com` - Your backend URL from Step 3 (e.g., `https://task-manager-api.onrender.com`)

**Note**: The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser.

**4.4 Redeploy with Environment Variables**

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Confirm to redeploy with new environment variables

**4.5 Get Your Vercel URL**

- Your frontend is now live at: `https://your-project-name.vercel.app`
- This is your `CLIENT_URL` for the backend

**4.6 Update Backend Environment Variables**

1. Go back to your backend deployment platform (Render/Railway/Fly)
2. Update the `CLIENT_URL` environment variable with your Vercel URL
3. Redeploy the backend
4. Wait for redeployment to complete (5-10 minutes)

---

### Step 5: Environment Variables Reference

**Frontend Environment Variables** (`NEXT_PUBLIC_*` - exposed to browser)
| Variable | Value | Example |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://task-manager-api.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.IO endpoint | `https://task-manager-api.onrender.com` |

**Backend Environment Variables** (Server-side only)
| Variable | Value | Example |
|----------|-------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `MONGO_DB_NAME` | Database name | `task_manager` |
| `JWT_SECRET` | JWT signing key (32+ chars) | `your_random_secret_here_min_32_chars` |
| `JWT_EXPIRES_IN` | JWT token expiry | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

---

### Step 6: Post-Deployment Testing

**6.1 Test Frontend Access**

```
Open: https://your-app-name.vercel.app
- Should display the login page
- No errors in browser console (F12)
```

**6.2 Test Backend Connection**

```bash
# From terminal or Postman
curl https://your-backend-url.com/health
# or
curl https://task-manager-api.onrender.com/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}'
```

**6.3 Test Full Workflow**

1. Go to your Vercel frontend URL
2. Register a new user
3. Log in
4. Create a new project and task
5. Add checklist items to the task
6. Toggle checklist items and save
7. Verify changes persist after refresh

**6.4 Check Backend Logs**

- **Render**: Service → "Logs"
- **Railway**: Project → "Logs"
- **Fly**: `flyctl logs`

Look for:

- Database connection successful
- WebSocket connections established
- No authentication errors
- No CORS errors

---

### Step 7: Troubleshooting

#### **Issue: "Cannot reach backend" or API errors**

**Solution**:

1. Verify `NEXT_PUBLIC_API_URL` is correct in Vercel
2. Check backend is running: `curl https://your-backend-url.com/health`
3. Verify `CLIENT_URL` on backend matches Vercel domain
4. Check backend logs for errors
5. Redeploy both frontend and backend

#### **Issue: "CORS error" or Socket.IO connection fails**

**Solution**:

1. Ensure `CLIENT_URL` env var on backend is set to Vercel domain (with https)
2. Verify `NEXT_PUBLIC_SOCKET_URL` on frontend points to backend
3. Restart backend service
4. Clear browser cache (Ctrl+Shift+Delete)

#### **Issue: "Database connection refused"**

**Solution**:

1. Verify MongoDB Atlas IP whitelist includes backend server IP
2. Check `MONGO_URI` is correct (copy from MongoDB Atlas)
3. Verify username/password are correct
4. Check if cluster is running in MongoDB Atlas dashboard

#### **Issue: "JWT authentication fails"**

**Solution**:

1. Verify `JWT_SECRET` is the same on backend in all deployments
2. Tokens expire in 7 days - users need to log in again
3. Check backend logs for token validation errors

#### **Issue: "Vercel deployment fails"**

**Solution**:

1. Check Vercel deployment logs: "Deployments" tab → click deployment → "View Logs"
2. Ensure `package.json` has all required dependencies
3. Check `NEXT_PUBLIC_*` variables are set in Vercel
4. Try redeploying: "Deployments" → click "..." → "Redeploy"

#### **Issue: "Changes not showing in production"**

**Solution**:

1. Push changes to GitHub main branch: `git push origin main`
2. Wait for automatic Vercel/backend redeployment (2-10 minutes)
3. Clear browser cache: `Ctrl+Shift+Delete`
4. For immediate feedback, check Vercel "Deployments" tab

---

### Step 8: Useful Links

- **Next.js Deployment Docs**: https://nextjs.org/docs/app/building-your-application/deploying
- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Guide**: https://docs.atlas.mongodb.com
- **Render Documentation**: https://render.com/docs
- **Railway Documentation**: https://docs.railway.app
- **Fly.io Documentation**: https://fly.io/docs
- **Express.js Guide**: https://expressjs.com
- **Socket.IO Deployment**: https://socket.io/docs/v4/glossary/cors

---

### Quick Reference Commands

```bash
# Local development
npm install
npm run dev              # Runs both frontend and backend
npm run dev:web         # Frontend only (port 3000)
npm run dev:api         # Backend only (port 5000)

# Production build
npm run build
npm run start:api        # Start backend for production

# Git workflow for deployment
git add .
git commit -m "Your changes"
git push origin main    # Auto-triggers Vercel & backend redeployment
```

---

### Support & Debugging

For detailed debugging:

1. Check backend logs on your hosting platform
2. Check Vercel build logs: Settings → Function Logs
3. Check browser console (F12) for frontend errors
4. Use MongoDB Atlas dashboard to verify database state
5. Test API endpoints with Postman: https://www.postman.com

Happy deploying! 🚀


