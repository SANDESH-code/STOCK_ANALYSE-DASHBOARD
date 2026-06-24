# Render.com Deployment Guide

## 🚀 Quick Deploy to Render.com

Your project is now configured for one-click deployment on Render.com! Follow these simple steps:

### Step 1: Connect Your GitHub Repository

1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if you haven't already
4. Select your repository: **`SANDESH-code/STOCK_ANALYSE-DASHBOARD`**
5. Click **"Apply"**

### Step 2: Configure Environment Variables

Render will automatically detect the `render.yaml` file and create:
- ✅ Backend web service (Node.js)
- ✅ Frontend static site (React/Vite)
- ✅ MySQL database

**Important:** You need to set one environment variable manually:

#### For the Frontend Service:
1. In Render dashboard, go to your **frontend service**
2. Navigate to **Environment** tab
3. Add this variable:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://stock-analyse-backend.onrender.com` (Render will provide the actual URL after backend deployment)

### Step 3: Deploy!

Render will automatically:
1. Build and deploy your backend API
2. Create and initialize the MySQL database
3. Build and deploy your frontend
4. Set up all environment variables

### Step 4: Get Your Live URLs

After deployment completes (5-10 minutes), you'll receive:
- **Frontend URL:** `https://stock-analyse-frontend.onrender.com`
- **Backend API URL:** `https://stock-analyse-backend.onrender.com`

## 📋 Default Admin Credentials

Once deployed, you can login with:
- **Email:** `admin@stockanalyse.com`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials immediately after first login!

## 🔧 Manual Deployment (Alternative)

If you prefer to deploy services manually:

### Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name:** `stock-analyse-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** `Free`

### Database
1. Click **"New +"** → **"PostgreSQL"** (Render free tier uses PostgreSQL, but we can adapt)
2. Or use **MySQL** from the database options
3. Name it: `stock-analyse-db`

### Frontend Service
1. Click **"New +"** → **"Static Site"**
2. Connect your repository
3. Configure:
   - **Name:** `stock-analyse-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Plan:** `Free`

## 🔍 Monitoring Your Deployment

### Check Logs
- Go to your service dashboard
- Click **"Logs"** tab to view real-time logs

### Health Check
Visit: `https://stock-analyse-backend.onrender.com/api/health`

### Database
- Go to your database dashboard
- Click **"Connect"** to get connection details
- Use MySQL client to verify data

## 🛠️ Troubleshooting

### Frontend API Errors
If you see CORS or API connection errors:
1. Verify `VITE_API_BASE_URL` is set correctly in frontend environment
2. Rebuild frontend: Go to frontend service → **"Manual Deploy"** → **"Deploy latest commit"**

### Database Connection Issues
1. Check backend logs for connection errors
2. Verify database credentials in environment variables
3. Ensure database is in same region as backend service

### Build Failures
1. Check build logs for specific errors
2. Verify `package.json` files are correct
3. Ensure all dependencies are listed

## 💰 Free Tier Limitations

Render's free tier includes:
- **750 hours/month** of service uptime (shared across services)
- **Database:** Limited storage and compute
- **Auto-sleep:** Services sleep after 15 minutes of inactivity

**Note:** Free services may take 30-60 seconds to wake up on first request.

## 🎯 Next Steps

1. **Update CORS_ORIGIN** in backend environment to your actual frontend URL
2. **Change admin password** immediately after deployment
3. **Set up custom domain** (optional, in Render dashboard)
4. **Enable HTTPS** (automatic on Render)
5. **Monitor usage** to avoid unexpected charges

## 📞 Support

If you encounter issues:
- Check Render's [documentation](https://render.com/docs)
- View service logs in Render dashboard
- Test backend health endpoint: `/api/health`

---

**🎉 Your app is now live!** Share your deployment URLs and enjoy your fully functional stock analysis dashboard!