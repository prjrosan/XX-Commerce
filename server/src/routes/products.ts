import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { Product } from '../types';
import axios from 'axios';
import { requireAdmin, requireAdminOrSeller, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Demo products with Japanese Yen pricing (Super affordable - All under ¥1,500!)
const demoProducts = [
  {
    title: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 1200, // ¥1,200 (super affordable!)
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    stock_quantity: 25,
    customization_options: {
      colors: ["Black", "White", "Blue", "Red"],
      sizes: ["Standard", "Large"],
      engraving: true
    }
  },
  {
    title: "Traditional Japanese Tea Set",
    description: "Beautiful handcrafted ceramic tea set with 6 cups and teapot. Perfect for traditional tea ceremonies.",
    price: 800, // ¥800 (super affordable!)
    category: "home",
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
    stock_quantity: 15,
    customization_options: {
      colors: ["White", "Blue", "Green", "Pink"],
      patterns: ["Traditional", "Modern", "Floral"],
      engraving: true
    }
  },
  {
    title: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitor, GPS, and water resistance. Track your workouts and health metrics.",
    price: 1400, // ¥1,400 (super affordable!)
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    stock_quantity: 30,
    customization_options: {
      colors: ["Black", "Silver", "Gold", "Rose Gold"],
      bands: ["Silicone", "Leather", "Metal"],
      engraving: true
    }
  },
  {
    title: "Handmade Sushi Knife",
    description: "Professional-grade sushi knife made from high-carbon steel. Perfect for sushi chefs and cooking enthusiasts.",
    price: 900, // ¥900 (super affordable!)
    category: "kitchen",
    image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400",
    stock_quantity: 10,
    customization_options: {
      handle_materials: ["Wood", "Bamboo", "Composite"],
      blade_lengths: ["180mm", "210mm", "240mm"],
      engraving: true
    }
  },
  {
    title: "Organic Matcha Green Tea",
    description: "Premium organic matcha powder from Uji, Japan. Rich in antioxidants and perfect for traditional tea preparation.",
    price: 400, // ¥400 (super affordable!)
    category: "food",
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    stock_quantity: 50,
    customization_options: {
      grades: ["Ceremonial", "Premium", "Culinary"],
      sizes: ["30g", "50g", "100g"],
      packaging: ["Tin", "Pouch", "Gift Box"]
    }
  },
  {
    title: "Modern Minimalist Desk Lamp",
    description: "Sleek LED desk lamp with adjustable brightness and color temperature. Perfect for home office or study.",
    price: 600, // ¥600 (super affordable!)
    category: "home",
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    stock_quantity: 20,
    customization_options: {
      colors: ["White", "Black", "Silver", "Gold"],
      bases: ["Clamp", "Stand", "Wall Mount"],
      engraving: false
    }
  },
  {
    title: "Yukata Kimono Set",
    description: "Traditional Japanese yukata with obi belt and geta sandals. Perfect for summer festivals and special occasions.",
    price: 1000, // ¥1,000 (super affordable!)
    category: "clothing",
    image_url: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400",
    stock_quantity: 12,
    customization_options: {
      patterns: ["Cherry Blossom", "Wave", "Geometric", "Floral"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue", "Pink", "Purple", "Green"]
    }
  },
  {
    title: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 360-degree sound and 12-hour battery life. Perfect for outdoor activities.",
    price: 700, // ¥700 (super affordable!)
    category: "electronics",
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    stock_quantity: 35,
    customization_options: {
      colors: ["Black", "Blue", "Red", "Yellow"],
      sizes: ["Mini", "Standard", "Large"],
      engraving: true
    }
  }
];

// Initialize demo products
router.post('/init-demo', requireAdmin, (req: Request, res: Response) => {
  let insertedCount = 0;
  let errorCount = 0;

  demoProducts.forEach((product) => {
    db.run(
      'INSERT OR IGNORE INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        product.title,
        product.description,
        product.price,
        product.category,
        product.image_url,
        product.stock_quantity,
        `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      ],
      function(err) {
        if (err) {
          errorCount++;
        } else {
          insertedCount++;
        }
      }
    );
  });

  setTimeout(() => {
    res.json({
      success: true,
      message: 'Demo products initialized',
      data: { inserted: insertedCount, errors: errorCount }
    });
  }, 1000);
});

// Update existing demo products with new prices
router.post('/update-prices', requireAdmin, (req: Request, res: Response) => {
  let updatedCount = 0;
  let errorCount = 0;

  demoProducts.forEach((product) => {
    db.run(
      'UPDATE products SET price = ? WHERE title = ?',
      [product.price, product.title],
      function(err) {
        if (err) {
          errorCount++;
          console.error('Error updating product price:', err);
        } else {
          if (this.changes > 0) {
            updatedCount++;
          }
        }
      }
    );
  });

  setTimeout(() => {
    res.json({
      success: true,
      message: 'Product prices updated',
      data: { updated: updatedCount, errors: errorCount }
    });
  }, 1000);
});

// Reset demo products (delete old ones and create new ones with correct prices)
router.post('/reset-demo', requireAdmin, (req: Request, res: Response) => {
  // First, delete all existing demo products
  db.run('DELETE FROM products WHERE title IN (?)', [demoProducts.map(p => p.title).join(',')], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete old products' });
    }

    // Then insert new products with correct prices
    let insertedCount = 0;
    let errorCount = 0;

    demoProducts.forEach((product) => {
      db.run(
        'INSERT INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          product.title,
          product.description,
          product.price,
          product.category,
          product.image_url,
          product.stock_quantity,
          `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        ],
        function(err) {
          if (err) {
            errorCount++;
          } else {
            insertedCount++;
          }
        }
      );
    });

    setTimeout(() => {
      res.json({
        success: true,
        message: 'Demo products reset with new prices',
        data: { inserted: insertedCount, errors: errorCount }
      });
    }, 1000);
  });
});

// Get all products (with pagination and filtering)
router.get('/', async (req: Request, res: Response) => {
  const { page = 1, limit = 20, category, search, minPrice, maxPrice } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let query = `
      SELECT * FROM products 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    db.all(query, params, (err, products: Product[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get total count for pagination
      db.get('SELECT COUNT(*) as total FROM products', (err, result: any) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          success: true,
          data: {
            products,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: result.total,
              pages: Math.ceil(result.total / Number(limit))
            }
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product: Product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add customization options for demo products
    const demoProduct = demoProducts.find(p => p.title === product.title);
    if (demoProduct) {
      product.customization_options = demoProduct.customization_options;
    }

    res.json({ success: true, data: product });
  });
});

// Get product customization options
router.get('/:id/customization', (req: Request, res: Response) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product: Product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const demoProduct = demoProducts.find(p => p.title === product.title);
    if (demoProduct) {
      res.json({ success: true, data: demoProduct.customization_options });
    } else {
      res.json({ success: true, data: null });
    }
  });
});

// Create product (admin or seller)
router.post('/', authenticateToken, requireAdminOrSeller, [
  body('title').trim().isLength({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 })
], (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, price, category, stock_quantity = 0, image_url } = req.body;
  const userId = req.user?.id;

  db.run(
    'INSERT INTO products (title, description, price, category, stock_quantity, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, price, category, stock_quantity, image_url, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create product' });
      }

      res.status(201).json({
        success: true,
        data: { id: this.lastID, title, description, price, category, stock_quantity, image_url }
      });
    }
  );
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('stock_quantity').optional().isInt({ min: 0 })
], (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;

  // Build dynamic update query
  const fields = Object.keys(updates).filter(key => 
    ['title', 'description', 'price', 'category', 'stock_quantity', 'image_url'].includes(key)
  );

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const query = `
    UPDATE products 
    SET ${fields.map(field => `${field} = ?`).join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [...fields.map(field => updates[field]), id];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully' });
  });
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

// Sync products from external API (admin only)
router.post('/sync/external', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch products from DummyJSON API
    const response = await axios.get('https://dummyjson.com/products?limit=100');
    const products = response.data.products;

    let syncedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Check if product already exists
        db.get('SELECT id FROM products WHERE external_id = ?', [product.id.toString()], (err, existing) => {
          if (err) {
            errorCount++;
            return;
          }

          if (!existing) {
            // Insert new product
            db.run(
              'INSERT INTO products (title, description, price, category, image_url, stock_quantity, external_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                product.title,
                product.description,
                product.price,
                product.category,
                product.images[0] || null,
                product.stock,
                product.id.toString()
              ],
              (err) => {
                if (err) {
                  errorCount++;
                } else {
                  syncedCount++;
                }
              }
            );
          }
        });
      } catch (error) {
        errorCount++;
      }
    }

    res.json({
      success: true,
      data: {
        synced: syncedCount,
        errors: errorCount,
        total: products.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

export default router; 