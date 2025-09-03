import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's cart
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const query = `
      SELECT 
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        ci.updated_at,
        p.title,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
    
    db.all(query, [userId], (err, items) => {
      if (err) {
        console.error('Error getting cart:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const total = (items || []).reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      res.json({
        success: true,
        data: {
          items: (items || []).map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            product_id: item.product_id,
            quantity: item.quantity,
            created_at: item.created_at,
            updated_at: item.updated_at,
            product: {
              id: item.product_id,
              title: item.title,
              description: item.description,
              price: item.price,
              category: item.category,
              image_url: item.image_url,
              stock_quantity: item.stock_quantity
            }
          })),
          total: parseFloat((total as number).toFixed(2))
        }
      });
    });
    
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, [
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user!.id;
    const { product_id, quantity } = req.body;
    
    // Check if product exists and has stock
    db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product) => {
      if (err) {
        console.error('Error checking product:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if ((product as any).stock_quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      // Check if item already exists in cart
      db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, existingItem) => {
        if (err) {
          console.error('Error checking existing cart item:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (existingItem) {
          // Update existing item quantity
          const newQuantity = (existingItem as any).quantity + quantity;
          if ((product as any).stock_quantity < newQuantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
          }
          
          db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, (existingItem as any).id], function(err) {
            if (err) {
              console.error('Error updating cart item:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
              success: true,
              message: 'Cart item updated successfully'
            });
          });
        } else {
          // Add new item
          db.run('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, quantity], function(err) {
            if (err) {
              console.error('Error adding to cart:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.status(201).json({
              success: true,
              message: 'Item added to cart successfully'
            });
          });
        }
      });
    });
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authenticateToken, [
  body('quantity').isInt({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    // Check if cart item exists and belongs to user
    db.get('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], (err, cartItem) => {
      if (err) {
        console.error('Error checking cart item:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      // Check stock availability
      db.get('SELECT stock_quantity FROM products WHERE id = ?', [(cartItem as any).product_id], (err, product) => {
        if (err) {
          console.error('Error checking product stock:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!product || (product as any).stock_quantity < quantity) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        
        // Update quantity
        db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantity, itemId], function(err) {
          if (err) {
            console.error('Error updating cart item:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            success: true,
            message: 'Cart item updated successfully'
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    
    db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, userId], function(err) {
      if (err) {
        console.error('Error removing cart item:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    });
    
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
      if (err) {
        console.error('Error clearing cart:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    });
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 