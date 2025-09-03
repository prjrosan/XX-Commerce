# Manual Render Deployment Guide

## 🚀 Alternative Deployment Method

Since the Blueprint approach is having issues with the "nom" error, here is a step-by-step manual deployment guide:

## Step 1: Deploy Backend API

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `prjrosan/XX-Commerce`
4. Configure the service:
   - **Name**: `xx-commerce-api`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && node dist/index.js`
   - **Plan**: `Free`

5. Click "Create Web Service"

## Step 2: Set Backend Environment Variables

After the service is created, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGIN=https://xx-commerce-client.onrender.com
MONGODB_URI=your-mongodb-atlas-connection-string
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Step 3: Deploy Frontend

1. Click "New +" → "Static Site"
2. Connect your GitHub repository: `prjrosan/XX-Commerce`
3. Configure the service:
   - **Name**: `xx-commerce-client`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Plan**: `Free`

4. Click "Create Static Site"

## Step 4: Set Frontend Environment Variables

After the service is created, go to "Environment" tab and add:

```
VITE_API_URL=https://xx-commerce-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## Step 5: Update CORS Origin

1. Go back to your backend service
2. Update the `CORS_ORIGIN` environment variable with your actual frontend URL
3. The frontend URL will be: `https://xx-commerce-client.onrender.com`

## Troubleshooting

### If you still get "nom" error:
1. Try this build command instead: `npm install && cd server && npm install && npm run build`
2. Make sure there are no hidden characters in the build command
3. Try creating the service without the render.yaml file (delete it temporarily)

### Common Issues:
- **Build fails**: Check that all dependencies are in package.json
- **CORS errors**: Make sure CORS_ORIGIN matches your frontend URL exactly
- **Database connection**: Verify MongoDB URI is correct
- **Environment variables**: Double-check all required variables are set

## Expected URLs:
- Backend: `https://xx-commerce-api.onrender.com`
- Frontend: `https://xx-commerce-client.onrender.com`

## Next Steps:
1. Test your deployed application
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD for automatic deployments
