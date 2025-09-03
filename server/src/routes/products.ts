import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { requireAdmin, requireAdminOrSeller, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, sort = 'created_at', order = 'desc', page = 1, limit = 20 } = req.query;
    
    // Build query
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Add sorting
    query += ` ORDER BY ${sort} ${String(order).toUpperCase()}`;
    
    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams: any[] = [];
    
    if (category && category !== 'all') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (title LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        console.error('Error counting products:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const total = (countResult as any)?.total || 0;
      
      // Get products
      db.all(query, params, (err, products) => {
        if (err) {
          console.error('Error getting products:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Format products
        const formattedProducts = (products || []).map((product: any) => ({
          ...product,
          formatted_price: `$${product.price.toFixed(2)}`
        }));
        
        res.json({
          success: true,
          data: {
            products: formattedProducts,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        console.error('Error getting product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
              res.json({
          success: true,
          data: {
            ...(product as any),
            formatted_price: `$${(product as any).price.toFixed(2)}`
          }
        });
    });
    
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (Admin/Seller only)
router.post('/', authenticateToken, requireAdminOrSeller, [
  body('title').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').trim().isLength({ min: 1 }),
  body('image_url').optional().isURL(),
  body('stock_quantity').optional().isInt({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { title, description, price, category, image_url, stock_quantity = 0 } = req.body;
    const userId = req.user!.id;
    
    const query = `
      INSERT INTO products (title, description, price, category, image_url, stock_quantity, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [title, description, price, category, image_url, stock_quantity, userId], function(err) {
      if (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: this.lastID,
          title,
          description,
          price,
          category,
          image_url,
          stock_quantity,
          user_id: userId
        }
      });
    });
    
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (Admin/Seller only)
router.put('/:id', authenticateToken, requireAdminOrSeller, [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('image_url').optional().isURL(),
  body('stock_quantity').optional().isInt({ min: 0 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user!.id;
    
    // Check if user owns the product or is admin
    db.get('SELECT user_id FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        console.error('Error checking product ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if ((product as any).user_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
      
      // Build update query
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updates[key]);
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);
      
      const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(query, updateValues, function(err) {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
          success: true,
          message: 'Product updated successfully'
        });
      });
    });
    
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (Admin/Seller only)
router.delete('/:id', authenticateToken, requireAdminOrSeller, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    // Check if user owns the product or is admin
    db.get('SELECT user_id FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        console.error('Error checking product ownership:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if ((product as any).user_id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this product' });
      }
      
      db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting product:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
          success: true,
          message: 'Product deleted successfully'
        });
      });
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 