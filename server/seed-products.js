const axios = require('axios');

// Sample products data
const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
    price: 199.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500"],
    stock_quantity: 50,
    seller_id: "superadmin", // Using your admin user as seller
    customization_options: [
      {
        type: "color",
        name: "Headphone Color",
        price_adjustment: 0,
        available_values: ["Black", "White", "Blue", "Red"]
      },
      {
        type: "warranty",
        name: "Extended Warranty",
        price_adjustment: 29.99,
        available_values: ["1 Year", "2 Years", "3 Years"]
      }
    ],
    rating: {
      average: 4.5,
      count: 12
    },
    is_active: true
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking watch with heart rate monitor, GPS, and smartphone connectivity. Track your workouts and health metrics.",
    price: 299.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500"],
    stock_quantity: 30,
    seller_id: "superadmin",
    customization_options: [
      {
        type: "size",
        name: "Watch Band Size",
        price_adjustment: 0,
        available_values: ["Small", "Medium", "Large", "Extra Large"]
      },
      {
        type: "color",
        name: "Watch Color",
        price_adjustment: 0,
        available_values: ["Black", "Silver", "Gold", "Rose Gold"]
      }
    ],
    rating: {
      average: 4.8,
      count: 25
    },
    is_active: true
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and eco-friendly cotton t-shirt made from 100% organic materials. Available in multiple colors and sizes.",
    price: 29.99,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500"],
    stock_quantity: 100,
    seller_id: "superadmin",
    customization_options: [
      {
        type: "size",
        name: "T-Shirt Size",
        price_adjustment: 0,
        available_values: ["XS", "S", "M", "L", "XL", "XXL"]
      },
      {
        type: "color",
        name: "T-Shirt Color",
        price_adjustment: 0,
        available_values: ["White", "Black", "Navy", "Gray", "Red", "Blue"]
      }
    ],
    rating: {
      average: 4.2,
      count: 18
    },
    is_active: true
  },
  {
    name: "Professional Coffee Maker",
    description: "Commercial-grade coffee maker perfect for home and office use. Features programmable settings and thermal carafe.",
    price: 89.99,
    category: "Home & Kitchen",
    images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500"],
    stock_quantity: 25,
    seller_id: "superadmin",
    customization_options: [
      {
        type: "capacity",
        name: "Coffee Capacity",
        price_adjustment: 0,
        available_values: ["8 Cups", "12 Cups", "16 Cups"]
      },
      {
        type: "color",
        name: "Machine Color",
        price_adjustment: 0,
        available_values: ["Black", "Stainless Steel", "White"]
      }
    ],
    rating: {
      average: 4.6,
      count: 31
    },
    is_active: true
  },
  {
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with dedicated graphics card, fast processor, and high refresh rate display. Perfect for gamers and content creators.",
    price: 1299.99,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500", "https://images.unsplash.com/photo-1541807084-5c3b9d7a6b0a?w=500"],
    stock_quantity: 15,
    seller_id: "superadmin",
    customization_options: [
      {
        type: "ram",
        name: "RAM Upgrade",
        price_adjustment: 199.99,
        available_values: ["16GB", "32GB", "64GB"]
      },
      {
        type: "storage",
        name: "Storage Upgrade",
        price_adjustment: 299.99,
        available_values: ["1TB SSD", "2TB SSD", "4TB SSD"]
      }
    ],
    rating: {
      average: 4.9,
      count: 8
    },
    is_active: true
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Seeding database with sample products...');
    console.log(`📦 Adding ${sampleProducts.length} products...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of sampleProducts) {
      try {
        const response = await axios.post('http://localhost:3001/api/products', product);
        
        if (response.status === 201) {
          console.log(`✅ Added: ${product.name} - $${product.price}`);
          successCount++;
        } else {
          console.log(`⚠️  Failed to add: ${product.name} - Status: ${response.status}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error adding ${product.name}: ${error.response?.data?.error || error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Seeding Results:');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed to add: ${errorCount} products`);
    
    if (successCount > 0) {
      console.log('\n🎉 Your products are now available!');
      console.log('🌐 Check your frontend at: http://localhost:5173');
    }
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  }
}

// Run the function
seedProducts(); 