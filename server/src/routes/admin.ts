import { Router, Request, Response } from 'express'
import { db } from '../database/init'
import { requireAdmin } from '../middleware/auth'
import { Product, Order, User } from '../types'

const router = Router()

// Apply admin middleware to all routes
router.use(requireAdmin)

// Get dashboard stats
router.get('/stats', (req: Request, res: Response) => {
  try {
    // Get total products
    db.get('SELECT COUNT(*) as total FROM products', (err, productResult: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      // Get total orders
      db.get('SELECT COUNT(*) as total FROM orders', (err, orderResult: any) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        // Get total revenue
        db.get('SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"', (err, revenueResult: any) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          // Get total customers
          db.get('SELECT COUNT(*) as total FROM users WHERE role = "user"', (err, customerResult: any) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' })
            }

            // Get low stock products
            db.get('SELECT COUNT(*) as total FROM products WHERE stock_quantity < 10', (err, lowStockResult: any) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              // Get pending orders
              db.get('SELECT COUNT(*) as total FROM orders WHERE status = "pending"', (err, pendingResult: any) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' })
                }

                res.json({
                  success: true,
                  data: {
                    totalProducts: productResult.total || 0,
                    totalOrders: orderResult.total || 0,
                    totalRevenue: revenueResult.total || 0,
                    totalCustomers: customerResult.total || 0,
                    lowStockProducts: lowStockResult.total || 0,
                    pendingOrders: pendingResult.total || 0
                  }
                })
              })
            })
          })
        })
      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all orders (admin view)
router.get('/orders', (req: Request, res: Response) => {
  const query = `
    SELECT o.*, u.name as customer_name, u.email as customer_email
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `

  db.all(query, (err, orders: Order[]) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.json({ success: true, data: orders })
  })
})

// Get all customers
router.get('/customers', (req: Request, res: Response) => {
  db.all('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC', (err, customers: User[]) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.json({ success: true, data: customers })
  })
})

// Update order status
router.put('/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  db.run(
    'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' })
      }

      res.json({ success: true, message: 'Order status updated' })
    }
  )
})

// Get order details with items
router.get('/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params

  db.get(
    'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
    [id],
    (err, order: Order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' })
      }

      // Get order items
      db.all(
        'SELECT oi.*, p.title, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
        [id],
        (err, items: any) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          order.items = items as any
          res.json({ success: true, data: order })
        }
      )
    }
  )
})

// Get customer details with orders
router.get('/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params

  db.get('SELECT * FROM users WHERE id = ?', [id], (err, customer: User) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' })
    }

    // Get customer orders
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [id], (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ 
        success: true, 
        data: { 
          ...customer, 
          orders,
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order: any) => sum + order.total_amount, 0)
        } 
      })
    })
  })
})

// Update product stock
router.put('/products/:id/stock', (req: Request, res: Response) => {
  const { id } = req.params
  const { stock_quantity } = req.body

  if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
    return res.status(400).json({ error: 'Invalid stock quantity' })
  }

  db.run(
    'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [stock_quantity, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update stock' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' })
      }

      res.json({ success: true, message: 'Stock updated successfully' })
    }
  )
})

// Update product customization options
router.put('/products/:id/customization', (req: Request, res: Response) => {
  const { id } = req.params
  const { customization_options } = req.body

  if (!customization_options || typeof customization_options !== 'object') {
    return res.status(400).json({ error: 'Invalid customization options' })
  }

  // For now, we'll store customization options as JSON in a separate column
  // In a real implementation, you might want a separate table for this
  db.run(
    'UPDATE products SET customization_options = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(customization_options), id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update customization options' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' })
      }

      res.json({ success: true, message: 'Customization options updated' })
    }
  )
})

// Get low stock products
router.get('/products/low-stock', (req: Request, res: Response) => {
  const { threshold = 10 } = req.query

  db.all(
    'SELECT * FROM products WHERE stock_quantity < ? ORDER BY stock_quantity ASC',
    [threshold],
    (err, products: Product[]) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ success: true, data: products })
    }
  )
})

// Get recent orders
router.get('/orders/recent', (req: Request, res: Response) => {
  const { limit = 10 } = req.query

  const query = `
    SELECT o.*, u.name as customer_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
    LIMIT ?
  `

  db.all(query, [limit], (err, orders: Order[]) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.json({ success: true, data: orders })
  })
})

// Get sales analytics
router.get('/analytics/sales', (req: Request, res: Response) => {
  const { period = '30' } = req.query // days

  const query = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total_amount) as revenue
    FROM orders 
    WHERE created_at >= date('now', '-${period} days')
    AND status != 'cancelled'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `

  db.all(query, (err, analytics) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.json({ success: true, data: analytics })
  })
})

// Get top selling products
router.get('/analytics/top-products', (req: Request, res: Response) => {
  const { limit = 10 } = req.query

  const query = `
    SELECT 
      p.id,
      p.title,
      p.price,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'cancelled' OR o.status IS NULL
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ?
  `

  db.all(query, [limit], (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    res.json({ success: true, data: products })
  })
})

export default router 