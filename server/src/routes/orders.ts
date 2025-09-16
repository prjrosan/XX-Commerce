import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's orders
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const query = `
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        GROUP_CONCAT(p.title || ' (x' || oi.quantity || ')') as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    db.all(query, [userId], (err, orders) => {
      if (err) {
        console.error('Error getting orders:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
              res.json({
          success: true,
          data: (orders || []).map((order: any) => ({
            ...order,
            items_summary: order.items_summary || 'No items'
          }))
        });
    });
    
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get order by ID with items
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    // Get order details
    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId], (err, order) => {
      if (err) {
        console.error('Error getting order:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const itemsQuery = `
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.title,
          p.description,
          p.category,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      
      db.all(itemsQuery, [id], (err, items) => {
        if (err) {
          console.error('Error getting order items:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          success: true,
          data: {
            ...(order as any),
            items: items || []
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order
router.post('/', authenticateToken, [
  body('shipping_address').trim().isLength({ min: 1 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const userId = req.user!.id;
    const { shipping_address } = req.body;
    
    // Get user's cart items
    const cartQuery = `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.price,
        p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
    
    db.all(cartQuery, [userId], (err, cartItems) => {
      if (err) {
        console.error('Error getting cart items:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      
      // Check stock availability
      for (const item of cartItems) {
        if ((item as any).stock_quantity < (item as any).quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for product ID ${(item as any).product_id}. Available: ${(item as any).stock_quantity}, Requested: ${(item as any).quantity}` 
          });
        }
      }
      
      // Calculate total
      const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      
      // Start transaction
      // Process order items sequentially
      // Create order
      db.run('INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)', 
        [userId, total, shipping_address], 
        function(err) {
            if (err) {
              console.error('Error creating order:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            const orderId = this.lastID;
            
            // Create order items and update stock sequentially
            let completed = 0;
            const totalItems = cartItems.length;
            
            const processNextItem = (index: number) => {
              if (index >= totalItems) {
                // All items processed, clear cart and return response
                db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                  if (err) {
                    console.error('Error clearing cart:', err);
                  }
                  
                  res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    data: {
                      order: {
                        id: orderId,
                        user_id: userId,
                        total_amount: total,
                        status: 'pending',
                        payment_status: 'pending',
                        shipping_address,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }
                    }
                  });
                });
                return;
              }
              
              const item = cartItems[index] as any;
              
              // Insert order item
              db.run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', 
                [orderId, item.product_id, item.quantity, item.price], 
                function(err) {
                  if (err) {
                    console.error('Error creating order item:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  // Update stock
                  db.run('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', 
                    [item.quantity, item.product_id], 
                    function(err) {
                      if (err) {
                        console.error('Error updating stock:', err);
                        return res.status(500).json({ error: 'Database error' });
                      }
                      
                      completed++;
                      // Process next item
                      processNextItem(index + 1);
                    }
                  );
                }
              );
            };
            
            // Start processing items
            processNextItem(0);
          }
        );
      });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (Admin only)
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('payment_status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'refunded'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updateData: any = { status };
    if (payment_status) updateData.payment_status = payment_status;
    
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = [...Object.values(updateData), id];
    
    db.run(`UPDATE orders SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, updateValues, function(err) {
      if (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({
        success: true,
        message: 'Order updated successfully'
      });
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router; 