const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prajaroshan01:Rosan9860@xxcommerce.wvcc5e2.mongodb.net/xx-commerce?retryWrites=true&w=majority';

// Product Schema (simplified for this script)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: [String],
  stock_quantity: { type: Number, required: true },
  seller_id: { type: String, required: true },
  customization_options: [{
    type: String,
    name: String,
    price_adjustment: Number,
    available_values: [String]
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);

    if (totalProducts === 0) {
      console.log('⚠️  No products found in database!');
      console.log('💡 This means we need to seed the database with sample products.');
    } else {
      // Get all products
      const products = await Product.find({}).limit(10);
      console.log('\n📋 First 10 products:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - $${product.price} (${product.category})`);
      });
    }

    // Check if there are any active products
    const activeProducts = await Product.countDocuments({ is_active: true });
    console.log(`\n✅ Active products: ${activeProducts}`);

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the function
checkProducts(); 