const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

// Path to old SQLite database
const dbPath = path.join(__dirname, 'data', 'ecommerce.db');

// Admin credentials for MongoDB
const adminCredentials = {
  email: 'superadmin@xxcommerce.com',
  password: 'SuperAdmin2024!'
};

async function migrateOldProducts() {
  try {
    console.log('🔄 Starting migration of old products from SQLite to MongoDB...');
    
    // First, login as admin to get token
    console.log('🔐 Authenticating as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', adminCredentials);
    
    if (loginResponse.status !== 200) {
      console.error('❌ Failed to login as admin');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin authentication successful!');
    
    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: 'http://localhost:3001/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Open SQLite database
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error opening SQLite database:', err.message);
        return;
      }
      console.log('✅ Connected to old SQLite database');
    });
    
    // Get all products from SQLite
    db.all('SELECT * FROM products', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading products from SQLite:', err.message);
        return;
      }
      
      console.log(`📦 Found ${rows.length} products in old database`);
      
      if (rows.length === 0) {
        console.log('⚠️  No products found in old database');
        db.close();
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      // Migrate each product
      for (const oldProduct of rows) {
        try {
          console.log(`🔄 Migrating: ${oldProduct.title || oldProduct.name || 'Unknown Product'}`);
          
          // Convert SQLite product to MongoDB format
          const newProduct = {
            name: oldProduct.title || oldProduct.name || 'Migrated Product',
            description: oldProduct.description || 'Product migrated from old database',
            price: parseFloat(oldProduct.price) || 0,
            category: oldProduct.category || 'General',
            images: oldProduct.image_url ? [oldProduct.image_url] : ['https://via.placeholder.com/300x300?text=Product'],
            stock_quantity: parseInt(oldProduct.stock_quantity) || 0,
            seller_id: 'superadmin', // Set as admin for now
            customization_options: oldProduct.customization_options ? JSON.parse(oldProduct.customization_options) : [],
            rating: {
              average: 0,
              count: 0
            },
            is_active: true
          };
          
          // Add to MongoDB
          const response = await authAxios.post('/products', newProduct);
          
          if (response.status === 201) {
            console.log(`✅ Migrated: ${newProduct.name} - $${newProduct.price}`);
            successCount++;
          } else {
            console.log(`⚠️  Failed to migrate: ${newProduct.name} - Status: ${response.status}`);
            errorCount++;
          }
          
        } catch (error) {
          console.log(`❌ Error migrating product: ${error.response?.data?.error || error.message}`);
          errorCount++;
        }
      }
      
      console.log('\n📊 Migration Results:');
      console.log(`✅ Successfully migrated: ${successCount} products`);
      console.log(`❌ Failed to migrate: ${errorCount} products`);
      
      if (successCount > 0) {
        console.log('\n🎉 Your old products are now in MongoDB!');
        console.log('🌐 Check your frontend at: http://localhost:5173');
        console.log('📱 Or check the API: http://localhost:3001/api/products');
      }
      
      // Close SQLite database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing SQLite database:', err.message);
        } else {
          console.log('🔌 SQLite database closed');
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the migration
migrateOldProducts(); 