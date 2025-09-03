# MongoDB Migration Guide for XX-Commerce

## 🚀 Overview
This guide explains how to migrate XX-Commerce from SQLite to MongoDB.

## 📋 Prerequisites
- MongoDB account (Atlas or local)
- Node.js and npm installed
- Access to your MongoDB connection string

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd server
npm install mongodb mongoose bcryptjs @types/bcryptjs
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/xx-commerce?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
PORT=3001
NODE_ENV=development
```

### 3. Update MongoDB Connection String
Replace the placeholder in `.env` with your actual MongoDB connection string from:
- MongoDB Atlas Dashboard → Connect → Connect your application
- Or your local MongoDB instance: `mongodb://localhost:27017/xx-commerce`

## 🗄️ Database Models Created

### ✅ User Model (`server/src/models/User.ts`)
- Username, email, password with bcrypt hashing
- Role-based access (customer, seller, admin)
- Automatic timestamps and validation

### ✅ Product Model (`server/src/models/Product.ts`)
- Product details with customization options
- Seller relationship and rating system
- Text search capabilities

### ✅ Order Model (`server/src/models/Order.ts`)
- Order items with customization options
- Status tracking and payment status
- Shipping information

### ✅ Cart Model (`server/src/models/Cart.ts`)
- User shopping cart with items
- Customization options support
- Automatic total calculation

### ✅ Rating Model (`server/src/models/Rating.ts`)
- User ratings for orders (1-5 stars)
- Comments and timestamps
- Unique constraint per user per order

### ✅ Payment Model (`server/src/models/Payment.ts`)
- Multiple payment methods support
- Payment status tracking
- Transaction details

### ✅ Chat Model (`server/src/models/Chat.ts`)
- Real-time messaging between users and sellers
- Message history and read status
- Product-specific conversations

## 🔄 Migration Process

### Phase 1: Setup (✅ Complete)
- [x] Install MongoDB dependencies
- [x] Create MongoDB models
- [x] Update server configuration
- [x] Create environment configuration

### Phase 2: Update API Routes (🔄 Next)
- [ ] Update auth routes to use MongoDB
- [ ] Update product routes to use MongoDB
- [ ] Update cart routes to use MongoDB
- [ ] Update order routes to use MongoDB
- [ ] Update payment routes to use MongoDB
- [ ] Update chat routes to use MongoDB
- [ ] Update rating routes to use MongoDB

### Phase 3: Data Migration (⏳ Pending)
- [ ] Create data migration scripts
- [ ] Export SQLite data
- [ ] Transform data for MongoDB
- [ ] Import data to MongoDB
- [ ] Verify data integrity

### Phase 4: Testing & Deployment (⏳ Pending)
- [ ] Test all API endpoints
- [ ] Update frontend if needed
- [ ] Deploy to production
- [ ] Monitor performance

## 🧪 Testing

### Test MongoDB Connection
```bash
cd server
npm run test:mongodb
```

### Build and Test Server
```bash
npm run build
npm start
```

## 📊 Benefits of MongoDB Migration

1. **Scalability**: Better performance with large datasets
2. **Flexibility**: Easier schema modifications
3. **Cloud Integration**: Automatic backups and scaling
4. **Real-time Features**: Better support for live updates
5. **Query Performance**: Advanced indexing and aggregation
6. **Document Storage**: Natural fit for product specifications

## ⚠️ Important Notes

1. **Data Loss**: This migration will replace your existing SQLite data
2. **Backup**: Always backup your data before migration
3. **Testing**: Test thoroughly in development before production
4. **Rollback**: Keep SQLite code until migration is verified

## 🆘 Troubleshooting

### Common Issues:
1. **Connection Failed**: Check MongoDB URI and network access
2. **Authentication Error**: Verify username/password in connection string
3. **Port Issues**: Ensure MongoDB port (27017) is accessible
4. **SSL Issues**: Add `?ssl=true` to connection string if needed

### Get Help:
- Check MongoDB Atlas logs
- Verify network connectivity
- Test connection string in MongoDB Compass
- Check server logs for detailed error messages

## 🎯 Next Steps

1. **Set up your MongoDB database** (Atlas recommended)
2. **Update your `.env` file** with real credentials
3. **Test the connection** using `npm run test:mongodb`
4. **Start the server** to verify everything works
5. **Begin updating API routes** one by one

## 📚 Resources

- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [XX-Commerce GitHub Repository](your-repo-url)

---

**Need Help?** Check the server logs or create an issue in the repository! 