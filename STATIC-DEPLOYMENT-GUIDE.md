# Static Site Deployment Guide for Render

## Option 1: Blueprint Deployment (Recommended)

1. **Go to Render Dashboard** → https://dashboard.render.com
2. **Click "New +"** → **"Blueprint"**
3. **Connect your GitHub repository** (XX-Commerce)
4. **Render will automatically detect** the `render.yaml` file
5. **Click "Apply"** to deploy both services

## Option 2: Manual Static Site Deployment

### Frontend (Static Site):
1. **Go to Render Dashboard** → **New** → **Static Site**
2. **Connect GitHub repository**
3. **Settings:**
   - **Name**: `xx-commerce`
   - **Build Command**: 
     ```bash
     echo "Building static site..."
     cd client
     npm install
     npm run build
     echo "Static site build completed!"
     ```
   - **Publish Directory**: `client/dist`

4. **Environment Variables:**
   - `VITE_API_URL` = `https://xx-commerce-api.onrender.com`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = [Your Stripe publishable key]

### Backend (API Server):
1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect GitHub repository**
3. **Settings:**
   - **Name**: `xx-commerce-api`
   - **Build Command**: 
     ```bash
     echo "Building API server..."
     npm install
     cd server
     npm install
     npm run build
     cd ..
     echo "API build completed!"
     ```
   - **Start Command**: 
     ```bash
     echo "Starting API server..."
     cd server
     node dist/index.js
     ```

4. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = [Generate secure random string]
   - `CORS_ORIGIN` = `https://xx-commerce.onrender.com`
   - `MONGODB_URI` = [Your MongoDB connection string]
   - `STRIPE_SECRET_KEY` = [Your Stripe secret key]
   - `STRIPE_WEBHOOK_SECRET` = [Your Stripe webhook secret]

## Expected Results:
- **Frontend**: Static React app served from CDN
- **Backend**: Node.js API server with compiled JavaScript
- **URLs**: 
  - Frontend: `https://xx-commerce.onrender.com`
  - Backend: `https://xx-commerce-api.onrender.com`

## Benefits of Static Site Deployment:
- ✅ **Faster loading** - Served from CDN
- ✅ **More reliable** - No server-side rendering issues
- ✅ **Easier to deploy** - Just build and serve files
- ✅ **Better performance** - Static files are cached
- ✅ **Lower cost** - Static sites are cheaper on Render
