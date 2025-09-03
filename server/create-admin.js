const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prajaroshan01:Rosan9860@xxcommerce.wvcc5e2.mongodb.net/xx-commerce?retryWrites=true&w=majority';

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
    }

    // Create new admin credentials
    const newAdminEmail = 'superadmin@xxcommerce.com';
    const newAdminUsername = 'superadmin';
    const newAdminPassword = 'SuperAdmin2024!';
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newAdminPassword, saltRounds);

    // Create new admin user
    const newAdmin = new User({
      username: newAdminUsername,
      email: newAdminEmail,
      password: hashedPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Save to database
    await newAdmin.save();
    console.log('✅ New admin user created successfully!');
    console.log('📋 Admin Credentials:');
    console.log(`   Email: ${newAdminEmail}`);
    console.log(`   Username: ${newAdminUsername}`);
    console.log(`   Password: ${newAdminPassword}`);
    console.log(`   Role: admin`);
    console.log('');
    console.log('🔐 Use these credentials to login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the function
createAdminUser(); 