# 🚀 Payment System Test Guide

## ✅ Current Status
- **App**: Running at http://localhost:5173
- **API**: Running at http://localhost:3001
- **Products**: 16 demo products available

## 🐛 Issue: "Failed to create order: Request failed with status code 400"

### This error happens when:
1. **Empty Cart** - No items in cart
2. **Short Address** - Shipping address less than 5 characters
3. **Not Logged In** - No authentication token

## 📝 Step-by-Step Test (EXACT STEPS):

### 1. 🔐 Login/Register
```
1. Go to: http://localhost:5173
2. Click "Register" (top right)
3. Fill in:
   - Name: Test User
   - Email: test@test.com  
   - Password: password123
   - Account Type: Customer
4. Click "Register"
5. Should see success message and be logged in
```

### 2. 🛒 Add Items to Cart
```
1. On homepage, you should see products
2. Click "Add to Cart" on 2-3 different products
3. Check cart icon (top right) shows number (e.g., "3")
4. Click cart icon to verify items are there
```

### 3. 💳 Test Checkout
```
1. In cart page, click "Proceed to Checkout"
2. Enter shipping address: "123 Test Street, Tokyo, Japan"
3. Click "Continue to Payment"
4. Payment form should appear with multiple options!
```

### 4. 🎯 Complete Payment
```
1. Choose any payment method (Credit Card, PayPal, etc.)
2. Click "Complete Payment - ¥[amount]"
3. Should see success message!
```

## 🔧 If Still Getting 400 Error:

### Check These:
- ✅ You're logged in (see user name in top right)
- ✅ Cart has items (cart icon shows number)
- ✅ Shipping address is 5+ characters
- ✅ Using http://localhost:5173 (not other port)

### Test Cart Manually:
1. Go to any product page
2. Click "Add to Cart" 
3. Should see "Added to cart!" message
4. Check cart icon shows "1"

## 💡 The Key Steps:
**LOGIN → ADD TO CART → CHECKOUT → PAYMENT** ✨

The payment system is working - you just need items in your cart first! 