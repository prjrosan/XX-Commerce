# 🚀 Railway Environment Variables

## Required Environment Variables for Railway:

### In Railway Dashboard → Your Project → Variables:

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://xx-commerce-production.up.railway.app
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## How to Set:
1. Go to Railway Dashboard
2. Select your project
3. Click "Variables" tab
4. Add each variable above
5. Redeploy your app
