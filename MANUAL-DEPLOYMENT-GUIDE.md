# Manual Render Deployment Guide

## If Blueprint Deployment Fails, Use Manual Deployment:

### Backend Service (xx-commerce-api):
1. Go to Render Dashboard → New → Web Service
2. Connect GitHub repository
3. **Settings:**
   - **Name**: xx-commerce-api
   - **Environment**: Node
   - **Build Command**: 
     ```bash
     echo "Starting build process..."
     npm install
     cd server
     npm install
     npm run build
     cd ..
     echo "Build completed!"
     ```
   - **Start Command**:
     ```bash
     echo "Starting server..."
     cd server
     node dist/index.js
     ```

4. **Environment Variables:**
   - NODE_ENV = production
   - PORT = 10000
   - HOST = 0.0.0.0
   - JWT_SECRET = [Generate secure random string]
   - CORS_ORIGIN = https://xx-commerce-client.onrender.com
   - MONGODB_URI = [Your MongoDB connection string]
   - STRIPE_SECRET_KEY = [Your Stripe secret key]
   - STRIPE_WEBHOOK_SECRET = [Your Stripe webhook secret]

### Frontend Service (xx-commerce-client):
1. Go to Render Dashboard → New → Static Site
2. Connect GitHub repository
3. **Settings:**
   - **Name**: xx-commerce-client
   - **Build Command**:
     ```bash
     echo "Building client..."
     cd client
     npm install
     npm run build
     echo "Client build completed!"
     ```
   - **Publish Directory**: client/dist

4. **Environment Variables:**
   - VITE_API_URL = https://xx-commerce-api.onrender.com
   - VITE_STRIPE_PUBLISHABLE_KEY = [Your Stripe publishable key]

## Expected Results:
- Backend will build TypeScript and start with compiled JavaScript
- Frontend will build React app and serve static files
- Both services will be accessible via Render URLs
