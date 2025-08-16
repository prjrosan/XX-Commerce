import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { CartItem } from '../types';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's cart
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const query = `
    SELECT 
      ci.id,
      ci.user_id,
      ci.product_id,
      ci.quantity,
      ci.created_at,
      ci.updated_at,
      p.id as product_id_full,
      p.title,
      p.description,
      p.price,
      p.category,
      p.image_url,
      p.stock_quantity,
      p.external_id,
      p.created_at as product_created_at,
      p.updated_at as product_updated_at
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `;

  db.all(query, [userId], (err, rows: any[]) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Transform the data to match the expected CartItem structure
    const items = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      product_id: row.product_id,
      quantity: row.quantity,
      created_at: row.created_at,
      updated_at: row.updated_at,
      product: {
        id: row.product_id_full,
        title: row.title,
        description: row.description,
        price: row.price,
        category: row.category,
        image_url: row.image_url,
        stock_quantity: row.stock_quantity,
        external_id: row.external_id,
        created_at: row.product_created_at,
        updated_at: row.product_updated_at
      }
    }));

    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items,
        total: parseFloat(total.toFixed(2))
      }
    });
  });
});

// Add item to cart
router.post('/add', [
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 })
], (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user!.id;
  const { product_id, quantity } = req.body;

  // Check if product exists and has stock
  db.get('SELECT * FROM products WHERE id = ?', [product_id], (err, product: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    db.get('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, existingItem: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }

        db.run(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
          [newQuantity, userId, product_id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update cart' });
            }

            res.json({
              success: true,
              message: 'Cart updated successfully',
              data: { quantity: newQuantity }
            });
          }
        );
      } else {
        // Add new item
        db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to add to cart' });
            }

            res.status(201).json({
              success: true,
              message: 'Item added to cart successfully',
              data: { id: this.lastID }
            });
          }
        );
      }
    });
  });
});

// Update cart item quantity
router.put('/update/:productId', [
  body('quantity').isInt({ min: 1 })
], (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user!.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  // Check stock availability
  db.get('SELECT stock_quantity FROM products WHERE id = ?', [productId], (err, product: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    db.run(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
      [quantity, userId, productId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update cart' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({
          success: true,
          message: 'Cart updated successfully',
          data: { quantity }
        });
      }
    );
  });
});

// Remove item from cart
router.delete('/remove/:productId', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;

  db.run(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove from cart' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    }
  );
});

// Clear cart
router.delete('/clear', (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to clear cart' });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { removed: this.changes }
    });
  });
});

export default router; 