# Render Deployment Guide

## Overview
This guide will help you deploy your XX-Commerce application to Render, a modern cloud platform that makes it easy to deploy full-stack applications.

## Prerequisites
- A Render account (free tier available)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- MongoDB Atlas account (for database)
- Stripe account (for payments)

## Deployment Steps

### 1. Prepare Your Repository
Make sure your project is pushed to a Git repository with the following structure:
\\\
XX-Commerce/
├── render.yaml          # Render configuration
├── package.json         # Root package.json
├── server/              # Backend code
│   ├── package.json
│   └── src/
└── client/              # Frontend code
    ├── package.json
    └── src/
\\\

### 2. Deploy Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click \
New
+\ → \Blueprint\
3. Connect your Git repository
4. Render will automatically detect the \ender.yaml\ file
5. Click \Apply\ to deploy both services

### 3. Manual Deployment (Alternative)

#### Deploy Backend API
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click \New
+\ → \Web
Service\
3. Connect your Git repository
4. Configure the service:
   - **Name**: xx-commerce-api
   - **Environment**: Node
   - **Build Command**: \cd server && npm install && npm run build\
   - **Start Command**: \cd server && npm start\
   - **Plan**: Free

#### Deploy Frontend
1. Click \New
+\ → \Static
Site\
2. Connect your Git repository
3. Configure the service:
   - **Name**: xx-commerce-client
   - **Build Command**: \cd client && npm install && npm run build\
   - **Publish Directory**: \client/dist\
   - **Plan**: Free

### 4. Environment Variables Setup

#### Backend Environment Variables
Set these in your Render dashboard under \Environment\:

\\\
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-a-secure-secret>
CORS_ORIGIN=https://xx-commerce-client.onrender.com
MONGODB_URI=<your-mongodb-atlas-connection-string>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\\\

#### Frontend Environment Variables
\\\
VITE_API_URL=https://xx-commerce-api.onrender.com
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
\\\

### 5. Database Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to your backend environment variables as \MONGODB_URI\

### 6. Stripe Configuration
1. Get your Stripe keys from the Stripe Dashboard
2. Add \STRIPE_SECRET_KEY\ to backend environment variables
3. Add \VITE_STRIPE_PUBLISHABLE_KEY\ to frontend environment variables
4. Set up webhook endpoints pointing to your backend URL

### 7. Custom Domain (Optional)
1. In your Render dashboard, go to your service settings
2. Click \Custom
Domains\
3. Add your domain and follow the DNS configuration instructions

## Important Notes

### Free Tier Limitations
- Services may sleep after 15 minutes of inactivity
- Cold starts can take 30-60 seconds
- Limited to 750 hours per month

### Performance Optimization
- Consider upgrading to a paid plan for better performance
- Use Render's built-in CDN for static assets
- Enable auto-deploy from your main branch

### Security
- Never commit environment variables to your repository
- Use Render's environment variable management
- Enable HTTPS (automatic on Render)

## Troubleshooting

### Common Issues
1. **Build Failures**: Check your build commands and dependencies
2. **CORS Errors**: Ensure CORS_ORIGIN matches your frontend URL
3. **Database Connection**: Verify MongoDB URI and network access
4. **Environment Variables**: Double-check all required variables are set

### Logs
- View logs in the Render dashboard under \Logs\
- Use \ender logs\ CLI command for real-time logs

## Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [XX-Commerce Issues](https://github.com/your-repo/issues)

## Next Steps
After successful deployment:
1. Test all functionality
2. Set up monitoring
3. Configure backups
4. Set up CI/CD pipeline
5. Consider scaling options
