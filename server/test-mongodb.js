const { connectDB, disconnectDB } = require('./dist/database/mongodb');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    await connectDB();
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations here if needed
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  } finally {
    await disconnectDB();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection(); 