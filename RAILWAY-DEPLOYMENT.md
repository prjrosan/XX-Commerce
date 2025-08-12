# 🚀 Railway Deployment Guide for XX-Commerce

## **Quick Fix for "Application failed to respond" Error**

### **Step 1: Set Environment Variables in Railway**

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your `xx-commerce-production` project
3. Click **"Variables"** tab
4. Add these variables:

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://xx-commerce-production.up.railway.app
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Step 2: Redeploy Your App**

1. In Railway Dashboard, click **"Deploy"** button
2. Wait for build to complete
3. Check deployment logs for any errors

### **Step 3: Test Your Deployment**

```bash
# Test health check
curl https://xx-commerce-production.up.railway.app/health

# Test root endpoint
curl https://xx-commerce-production.up.railway.app/
```

## **What I Fixed:**

✅ **Port Configuration** - Added proper host binding  
✅ **Environment Variables** - Railway-specific config  
✅ **Build Process** - Auto-build on Railway  
✅ **Start Script** - Custom Railway start script  
✅ **Health Checks** - Added monitoring endpoints  
✅ **Error Handling** - Better production error messages  

## **Common Issues & Solutions:**

### **Issue: "Application failed to respond"**
- **Cause**: Missing environment variables or build failure
- **Solution**: Set all required env vars in Railway

### **Issue: "Build failed"**
- **Cause**: TypeScript compilation errors
- **Solution**: Check server logs, fix TypeScript issues

### **Issue: "Port already in use"**
- **Cause**: Railway port configuration
- **Solution**: Use `PORT` env var (Railway sets this automatically)

## **Expected Result:**

After fixing, your app should show:
```json
{
  "message": "XX-Commerce API is running! 🚀",
  "status": "OK",
  "endpoints": {
    "health": "/health",
    "api": "/api",
    "products": "/api/products",
    "auth": "/api/auth"
  }
}
```

## **Need Help?**

1. Check Railway deployment logs
2. Verify environment variables are set
3. Test locally first: `npm run build && npm start`
4. Contact Railway support if issues persist

---

**🚀 Your Japanese e-commerce with PayPay should be live soon! 🇯🇵⚡💰**
