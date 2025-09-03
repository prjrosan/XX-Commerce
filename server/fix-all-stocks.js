const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://prajaroshan01:Rosan9860@xxcommerce.wvcc5e2.mongodb.net/';
const client = new MongoClient(uri);

async function fixAllStocks() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('xx-commerce');
    const products = db.collection('products');
    
    // Find all products with 0 stock
    const zeroStockProducts = await products.find({ stock_quantity: 0 }).toArray();
    console.log(`Found ${zeroStockProducts.length} products with 0 stock`);
    
    if (zeroStockProducts.length === 0) {
      console.log('✅ All products have stock');
      return;
    }
    
    // Update all products with 0 stock to have 10 stock
    const result = await products.updateMany(
      { stock_quantity: 0 },
      { $set: { stock_quantity: 10 } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} products with stock`);
    
    // Verify the updates
    const updatedProducts = await products.find({ stock_quantity: 10 }).toArray();
    console.log('Updated products:');
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.stock_quantity} stock`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixAllStocks(); 