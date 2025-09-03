import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Product, IProduct } from '../models';
import axios from 'axios';
import { requireAdmin, requireAdminOrSeller, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Demo products with Japanese Yen pricing (Super affordable - All under ¥1,500!)
const demoProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 1200, // ¥1,200 (super affordable!)
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
    stock_quantity: 25,
    customization_options: [
      {
        type: "color",
        name: "Color",
        price_adjustment: 0,
        available_values: ["Black", "White", "Blue", "Red"]
      },
      {
        type: "size",
        name: "Size",
        price_adjustment: 0,
        available_values: ["Standard", "Large"]
      },
      {
        type: "engraving",
        name: "Engraving",
        price_adjustment: 100,
        available_values: ["Yes", "No"]
      }
    ]
  },
  {
    name: "Traditional Japanese Tea Set",
    description: "Beautiful handcrafted ceramic tea set with 6 cups and teapot. Perfect for traditional tea ceremonies.",
    price: 800, // ¥800 (super affordable!)
    category: "home",
    images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400"],
    stock_quantity: 15,
    customization_options: [
      {
        type: "color",
        name: "Color",
        price_adjustment: 0,
        available_values: ["White", "Blue", "Green", "Pink"]
      },
      {
        type: "pattern",
        name: "Pattern",
        price_adjustment: 0,
        available_values: ["Traditional", "Modern", "Floral"]
      }
    ]
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor, GPS, and water resistance. Track your workouts and health metrics.",
    price: 1400, // ¥1,400 (super affordable!)
    category: "electronics",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
    stock_quantity: 30,
    customization_options: [
      {
        type: "color",
        name: "Color",
        price_adjustment: 0,
        available_values: ["Black", "Silver", "Gold", "Rose Gold"]
      },
      {
        type: "band",
        name: "Band Type",
        price_adjustment: 0,
        available_values: ["Silicone", "Leather", "Metal"]
      }
    ]
  }
];

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sort = 'created_at', order = 'desc', page = 1, limit = 20 } = req.query;
    
    // Build query
    const query: any = { is_active: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    // Build sort object
    const sortObj: any = {};
    sortObj[sort as string] = order === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('seller_id', 'username email');
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller_id', 'username email')
      .populate('rating');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (Admin/Seller only)
router.post('/', authenticateToken, requireAdminOrSeller, [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('price').isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  body('category').trim().isLength({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, price, stock_quantity, category, images, customization_options } = req.body;
    
    const product = new Product({
      name,
      description,
      price,
      stock_quantity,
      category,
      images: images || [],
      customization_options: customization_options || [],
      seller_id: req.user?.id
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (Admin/Seller only)
router.put('/:id', authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock_quantity, category, images, customization_options, is_active } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user can modify this product
    if (req.user?.role !== 'admin' && product.seller_id.toString() !== String(req.user?.id)) {
      return res.status(403).json({ error: 'Not authorized to modify this product' });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        stock_quantity,
        category,
        images,
        customization_options,
        is_active
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (Admin/Seller only)
router.delete('/:id', authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if user can delete this product
    if (req.user?.role !== 'admin' && product.seller_id.toString() !== String(req.user?.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Seed demo products (Admin only)
router.post('/seed/demo', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({ error: 'Products already exist. Cannot seed demo data.' });
    }
    
    // Create demo products with a default admin user ID
    const demoProductsWithSeller = demoProducts.map(product => ({
      ...product,
      seller_id: (req as AuthRequest).user?.id || '000000000000000000000000' // Default admin ID
    }));
    
    const createdProducts = await Product.insertMany(demoProductsWithSeller);
    
    res.status(201).json({
      success: true,
      message: `Created ${createdProducts.length} demo products`,
      data: createdProducts
    });
  } catch (error) {
    console.error('Seed demo products error:', error);
    res.status(500).json({ error: 'Failed to seed demo products' });
  }
});

export default router; 