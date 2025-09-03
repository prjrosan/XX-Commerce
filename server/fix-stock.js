const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://prajaroshan01:Rosan9860@xxcommerce.wvcc5e2.mongodb.net/';
const client = new MongoClient(uri);

async function fixStock() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('xx-commerce');
    const products = db.collection('products');
    
    // Update the Traditional Japanese Tea Set stock
    const result = await products.updateOne(
      { _id: '68a6d39a046ca70356458af8' },
      { $set: { stock_quantity: 10 } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Stock updated successfully');
    } else {
      console.log('❌ Product not found or no changes made');
    }
    
    // Check the updated product
    const product = await products.findOne({ _id: '68a6d39a046ca70356458af8' });
    if (product) {
      console.log('Updated product:', {
        name: product.name,
        stock: product.stock_quantity
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixStock(); 