const axios = require('axios');

// New admin credentials
const newAdmin = {
  username: 'superadmin',
  email: 'superadmin@xxcommerce.com',
  password: 'SuperAdmin2024!',
  role: 'admin'
};

async function registerAdmin() {
  try {
    console.log('🔄 Registering new admin user...');
    console.log('📋 Admin Credentials:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Password: ${newAdmin.password}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log('');

    // Register the admin user
    const response = await axios.post('http://localhost:3001/api/auth/register', newAdmin);
    
    if (response.status === 201) {
      console.log('✅ Admin user registered successfully!');
      console.log('🔐 You can now login with these credentials:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: ${newAdmin.password}`);
    } else {
      console.log('⚠️  Registration response:', response.status, response.data);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Registration failed:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run the function
registerAdmin(); 