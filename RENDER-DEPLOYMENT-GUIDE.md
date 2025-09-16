# XX-Commerce Render Deployment Guide

## 🚀 **Deploy to Render.com**

### **Step 1: Prepare Your Repository**
✅ Your code is already committed and pushed to GitHub: `https://github.com/prjrosan/XX-Commerce`

### **Step 2: Create Render Services**

#### **2.1 Create Backend Service (API)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `prjrosan/XX-Commerce`
4. Configure the backend service:

**Service Settings:**
- **Name:** `xx-commerce-api`
- **Environment:** `Node`
- **Plan:** `Free`
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Build Command:** 
  ```bash
  npm install
  cd server
  npm install
  npm run build
  ```
- **Start Command:**
  ```bash
  cd server
  node dist/index.js
  ```

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=https://xx-commerce.onrender.com
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=xx_commerce_db
```

#### **2.2 Create Frontend Service (Static Site)**
1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository: `prjrosan/XX-Commerce`
3. Configure the frontend service:

**Service Settings:**
- **Name:** `xx-commerce`
- **Environment:** `Static Site`
- **Plan:** `Free`
- **Branch:** `main`
- **Root Directory:** Leave empty
- **Build Command:** `./build-client.sh`
- **Publish Directory:** `client/dist`

**Environment Variables:**
```
VITE_API_URL=https://xx-commerce-api.onrender.com
```

### **Step 3: Deploy**

1. **Deploy Backend First:**
   - Click **"Create Web Service"** for the API
   - Wait for build to complete (5-10 minutes)
   - Note the API URL: `https://xx-commerce-api.onrender.com`

2. **Deploy Frontend:**
   - Click **"Create Static Site"** for the frontend
   - Wait for build to complete (3-5 minutes)
   - Note the frontend URL: `https://xx-commerce.onrender.com`

### **Step 4: Update Environment Variables**

After both services are deployed:

1. **Update Frontend Environment:**
   - Go to your frontend service settings
   - Update `VITE_API_URL` to your actual API URL
   - Redeploy the frontend

2. **Update Backend CORS:**
   - Go to your backend service settings
   - Update `CORS_ORIGIN` to your actual frontend URL
   - Redeploy the backend

### **Step 5: Test Your Deployment**

1. **Visit your frontend:** `https://xx-commerce.onrender.com`
2. **Test login:** `admin@new.com` / `admin123`
3. **Test features:**
   - Browse products
   - Add to cart
   - Checkout process
   - Admin dashboard

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify build commands are correct

2. **API Not Working:**
   - Check API service logs
   - Verify environment variables
   - Ensure CORS is configured correctly

3. **Frontend Can't Connect to API:**
   - Verify `VITE_API_URL` is correct
   - Check if API service is running
   - Ensure CORS allows your frontend domain

4. **Database Issues:**
   - The app uses SQLite (file-based database)
   - Data persists between deployments
   - For production, consider upgrading to PostgreSQL

## 📊 **Service URLs**

After deployment, you'll have:
- **Frontend:** `https://xx-commerce.onrender.com`
- **API:** `https://xx-commerce-api.onrender.com`
- **Health Check:** `https://xx-commerce-api.onrender.com/api/health`

## 💰 **Cost Information**

- **Free Plan:** Both services on free tier
- **Limitations:** 
  - Services sleep after 15 minutes of inactivity
  - Cold start takes 30-60 seconds
  - 750 hours/month limit
- **Upgrade:** Consider paid plans for production use

## 🔄 **Updates and Redeployment**

To update your app:
1. Push changes to GitHub
2. Render automatically redeploys
3. Or manually trigger redeploy from dashboard

## 📝 **Admin Credentials**

- **Email:** `admin@new.com`
- **Password:** `admin123`
- **Role:** Admin (full access)

## 🎯 **Features Available**

✅ **User Authentication** (Register/Login)  
✅ **Product Catalog** (16 products)  
✅ **Shopping Cart** (Add/Remove/Update)  
✅ **Checkout Process** (Address/Payment)  
✅ **Payment System** (Multiple methods)  
✅ **Admin Dashboard** (Product/Order management)  
✅ **Responsive Design** (Mobile/Desktop)  

## 🚀 **Your App is Ready!**

Once deployed, your XX-Commerce e-commerce platform will be live and accessible to users worldwide!

**GitHub Repository:** https://github.com/prjrosan/XX-Commerce  
**Render Dashboard:** https://dashboard.render.com
